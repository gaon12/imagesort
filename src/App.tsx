import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import type { Strip, SortStep, ImageSourceType, SortAlgorithmId, QuickSortPivot, Theme } from './types'
import { PRESET_IMAGES, SORT_ALGORITHMS, THEME_STORAGE_KEY, TUTORIAL_STORAGE_KEY, QUICK_SORT_PIVOT_STORAGE_KEY } from './constants'
import { createOrderedStrips, createShuffledStrips, formatMilliseconds, getInitialTheme, safeStorageGetItem, safeStorageSetItem } from './utils'
import { useAudio } from './hooks/useAudio'
import { TutorialModal } from './components/TutorialModal'
import { AlgorithmModal } from './components/AlgorithmModal'
import { SettingsModal } from './components/SettingsModal'
import { ResultModal } from './components/ResultModal'
import { ErrorModal } from './components/ErrorModal'
import { ErrorBoundary } from './components/ErrorBoundary'
import { StripVisualization } from './components/StripVisualization'
import { generateQuickSortSteps } from './algorithms/quickSort'

type SharedResultState = {
  algorithmId: SortAlgorithmId
  stripCount: number
  totalComparisons: number
  totalSwaps: number
  elapsedMilliseconds: number
  compareResult: {
    algorithmId: SortAlgorithmId
    totalComparisons: number
    totalSwaps: number
  } | null
  imageSourceType: ImageSourceType
  selectedPresetId: string
  imageSrc: string | null
}

// Helper to get initial pivot strategy
function getInitialPivot(): QuickSortPivot {
  const stored = safeStorageGetItem(QUICK_SORT_PIVOT_STORAGE_KEY)
  if (stored === 'first' || stored === 'last' || stored === 'middle' || stored === 'random') return stored
  return 'last'
}

function isSortAlgorithmId(value: string | null): value is SortAlgorithmId {
  return SORT_ALGORITHMS.some((algorithm) => algorithm.id === value)
}

function getDistinctCompareAlgorithmId(primaryId: SortAlgorithmId): SortAlgorithmId {
  return SORT_ALGORITHMS.find((algorithm) => algorithm.id !== primaryId)?.id ?? primaryId
}

function parseSharedResultFromUrl(): SharedResultState | null {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const algorithmId = params.get('algo')
  if (!isSortAlgorithmId(algorithmId)) return null

  const stripCount = Number.parseInt(params.get('strips') ?? '', 10)
  const totalComparisons = Number.parseInt(params.get('comparisons') ?? '', 10)
  const totalSwaps = Number.parseInt(params.get('swaps') ?? '', 10)
  const elapsedMilliseconds = Number.parseInt(params.get('time') ?? '', 10)

  if (![stripCount, totalComparisons, totalSwaps, elapsedMilliseconds].every(Number.isFinite)) {
    return null
  }

  const compareAlgorithmId = params.get('compareAlgo')
  const compareComparisons = Number.parseInt(params.get('compareComparisons') ?? '', 10)
  const compareSwaps = Number.parseInt(params.get('compareSwaps') ?? '', 10)
  const compareResult =
    isSortAlgorithmId(compareAlgorithmId)
    && compareAlgorithmId !== algorithmId
    && Number.isFinite(compareComparisons)
    && Number.isFinite(compareSwaps)
      ? {
          algorithmId: compareAlgorithmId,
          totalComparisons: compareComparisons,
          totalSwaps: compareSwaps,
        }
      : null

  const sourceType = params.get('source')
  if (sourceType === 'url') {
    const sharedImageUrl = params.get('imageUrl')
    if (sharedImageUrl) {
      return {
        algorithmId,
        stripCount,
        totalComparisons,
        totalSwaps,
        elapsedMilliseconds,
        compareResult,
        imageSourceType: 'url',
        selectedPresetId: '',
        imageSrc: sharedImageUrl,
      }
    }
  }

  if (sourceType === 'preset') {
    const presetId = params.get('preset')
    const preset = PRESET_IMAGES.find((item) => item.id === presetId) ?? PRESET_IMAGES[0]

    return {
      algorithmId,
      stripCount,
      totalComparisons,
      totalSwaps,
      elapsedMilliseconds,
      compareResult,
      imageSourceType: 'preset',
      selectedPresetId: preset?.id ?? '',
      imageSrc: preset?.url ?? null,
    }
  }

  return {
    algorithmId,
    stripCount,
    totalComparisons,
    totalSwaps,
    elapsedMilliseconds,
    compareResult,
    imageSourceType: 'upload',
    selectedPresetId: '',
    imageSrc: null,
  }
}

function App() {
  const { t } = useTranslation()

  // --- Core state ---
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [imageSourceType, setImageSourceType] = useState<ImageSourceType>('preset')
  const [imageSrc, setImageSrc] = useState<string | null>(PRESET_IMAGES[0]?.url ?? null)
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_IMAGES[0]?.id ?? 'favicon')
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [stripCount, setStripCount] = useState<number>(64)
  const [algorithmId, setAlgorithmId] = useState<SortAlgorithmId>('quick')
  const [pivotStrategy, setPivotStrategy] = useState<QuickSortPivot>(getInitialPivot)
  const [stepDelay, setStepDelay] = useState<number>(28)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // --- Visualization state ---
  const [strips, setStrips] = useState<Strip[]>([])
  const [sortSteps, setSortSteps] = useState<SortStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1)
  const [isSorting, setIsSorting] = useState(false)
  const [hasPrepared, setHasPrepared] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPreparing, setIsPreparing] = useState(false)
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState(0)
  const sortStartTimeRef = useRef<number | null>(null)
  const uploadedImageUrlRef = useRef<string | null>(null)
  const prepareTimeoutRef = useRef<number | null>(null)
  const prepareRunIdRef = useRef(0)

  // --- Compare mode state ---
  const [compareMode, setCompareMode] = useState(false)
  const [compareAlgorithmId, setCompareAlgorithmId] = useState<SortAlgorithmId>('bubble')
  const [compareStrips, setCompareStrips] = useState<Strip[]>([])
  const [compareSortSteps, setCompareSortSteps] = useState<SortStep[]>([])
  const [compareStepIndex, setCompareStepIndex] = useState<number>(-1)

  // --- UI state ---
  const [showResultModal, setShowResultModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showTutorialModal, setShowTutorialModal] = useState(false)
  const [showAlgorithmModal, setShowAlgorithmModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [sharedResult, setSharedResult] = useState<SharedResultState | null>(null)
  const [isViewportLandscape, setIsViewportLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= window.innerHeight
  })

  const activeAlgorithm = useMemo(
    () => SORT_ALGORITHMS.find((a) => a.id === algorithmId) ?? SORT_ALGORITHMS[0],
    [algorithmId]
  )

  const compareAlgorithm = useMemo(
    () => SORT_ALGORITHMS.find((a) => a.id === compareAlgorithmId) ?? SORT_ALGORITHMS[1],
    [compareAlgorithmId]
  )

  const sharedPrimaryAlgorithm = useMemo(
    () => sharedResult
      ? SORT_ALGORITHMS.find((algorithm) => algorithm.id === sharedResult.algorithmId) ?? activeAlgorithm
      : null,
    [activeAlgorithm, sharedResult]
  )

  const sharedCompareAlgorithm = useMemo(
    () => sharedResult?.compareResult
      ? SORT_ALGORITHMS.find((algorithm) => algorithm.id === sharedResult.compareResult?.algorithmId) ?? compareAlgorithm
      : null,
    [compareAlgorithm, sharedResult]
  )

  const { playStepSound, playCompleteSound } = useAudio(soundEnabled)

  const currentStep = currentStepIndex >= 0 ? sortSteps[currentStepIndex] : null
  const compareStep = compareStepIndex >= 0 ? compareSortSteps[compareStepIndex] : null
  const totalExpectedSteps = sortSteps.length
  const totalExpectedComparisons = sortSteps[sortSteps.length - 1]?.comparisons ?? 0
  const totalExpectedSwaps = sortSteps[sortSteps.length - 1]?.swaps ?? 0
  const totalExpectedCompareComparisons = compareSortSteps[compareSortSteps.length - 1]?.comparisons ?? 0
  const totalExpectedCompareSwaps = compareSortSteps[compareSortSteps.length - 1]?.swaps ?? 0
  const usesOpenEndedTotals = activeAlgorithm.isProbabilistic === true
  const usesOpenEndedCompareTotals = compareAlgorithm.isProbabilistic === true
  const mainDisplayedComparisons = currentStep?.comparisons ?? 0
  const mainDisplayedSwaps = currentStep?.swaps ?? 0
  const compareDisplayedComparisons = compareStep?.comparisons ?? 0
  const compareDisplayedSwaps = compareStep?.swaps ?? 0
  const mainProgressValue = `${currentStepIndex < 0 ? 0 : currentStepIndex + 1}/${usesOpenEndedTotals ? t('status.unknownTotal') : (totalExpectedSteps || 0)}`
  const compareProgressValue = `${compareStepIndex < 0 ? 0 : compareStepIndex + 1}/${usesOpenEndedCompareTotals ? t('status.unknownTotal') : (compareSortSteps.length || 0)}`

  // --- Effects ---
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      setIsViewportLandscape(window.innerWidth >= window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    return () => {
      if (uploadedImageUrlRef.current) {
        URL.revokeObjectURL(uploadedImageUrlRef.current)
      }
      if (prepareTimeoutRef.current != null) {
        window.clearTimeout(prepareTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = safeStorageGetItem(TUTORIAL_STORAGE_KEY)
    if (!seen) {
      setShowTutorialModal(true)
      safeStorageSetItem(TUTORIAL_STORAGE_KEY, 'true')
    }
  }, [])

  useEffect(() => {
    const parsedSharedResult = parseSharedResultFromUrl()
    if (!parsedSharedResult) return

    const orderedSharedStrips = createOrderedStrips(parsedSharedResult.stripCount)
    setAlgorithmId(parsedSharedResult.algorithmId)
    setStripCount(parsedSharedResult.stripCount)
    setImageSourceType(parsedSharedResult.imageSourceType)
    setImageSrc(parsedSharedResult.imageSrc)
    setSelectedPresetId(parsedSharedResult.selectedPresetId)
    setImageUrlInput(parsedSharedResult.imageSourceType === 'url' ? (parsedSharedResult.imageSrc ?? '') : '')
    setCompareMode(Boolean(parsedSharedResult.compareResult))
    setCompareAlgorithmId(
      parsedSharedResult.compareResult?.algorithmId
      ?? getDistinctCompareAlgorithmId(parsedSharedResult.algorithmId)
    )
    setStrips(orderedSharedStrips)
    setSortSteps([])
    setCurrentStepIndex(-1)
    setCompareStrips(parsedSharedResult.compareResult ? orderedSharedStrips : [])
    setCompareSortSteps([])
    setCompareStepIndex(-1)
    setElapsedMilliseconds(parsedSharedResult.elapsedMilliseconds)
    setHasPrepared(false)
    setIsSorting(false)
    setIsPaused(false)
    sortStartTimeRef.current = null
    setSharedResult(parsedSharedResult)
    setShowTutorialModal(false)
    setShowResultModal(true)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    safeStorageSetItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    safeStorageSetItem(QUICK_SORT_PIVOT_STORAGE_KEY, pivotStrategy)
  }, [pivotStrategy])

  useEffect(() => {
    if (!imageSrc || typeof Image === 'undefined') {
      setImageSize(null)
      return
    }

    let isCurrent = true
    const img = new Image()
    img.onload = () => {
      if (!isCurrent) return
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight })
      } else {
        setImageSize(null)
        setErrorMessage(t('error.invalidImage'))
        setShowErrorModal(true)
        setImageSrc(null)
      }
    }
    img.onerror = () => {
      if (!isCurrent) return
      setImageSize(null)
      setErrorMessage(t('error.invalidUrl'))
      setShowErrorModal(true)
      setImageSrc(null)
    }
    img.src = imageSrc

    return () => {
      isCurrent = false
    }
  }, [imageSrc, t])

  useEffect(() => {
    if (sharedResult) return
    if (!imageSize) return
    const { width, height } = imageSize
    if (!width || !height) return
    const aspect = width / height
    const base = 48
    const factor = Math.min(Math.max(aspect, 0.5), 2)
    const suggested = Math.round(base * factor)
    const clamped = Math.min(Math.max(suggested, 8), 160)
    setStripCount(clamped)
  }, [imageSize, sharedResult])

  useEffect(() => {
    const baseTitle = t('app.title')
    const algorithmTitle = compareMode
      ? `${activeAlgorithm.name} vs ${compareAlgorithm.name}`
      : activeAlgorithm.name
    const statusTitle = isPreparing
      ? '준비 중'
      : isSorting
        ? (isPaused ? '일시정지' : '정렬 중')
        : hasPrepared
          ? '준비 완료'
          : activeAlgorithm.description

    document.title = `${algorithmTitle} · ${statusTitle} · ${baseTitle}`
  }, [activeAlgorithm, compareAlgorithm, compareMode, hasPrepared, isPaused, isPreparing, isSorting, t])

  // --- Main animation effect ---
  useEffect(() => {
    if (!sortSteps.length) {
      if (isSorting) setIsSorting(false)
      return
    }
    if (!isSorting || isPaused) return

    const mainDone = currentStepIndex >= sortSteps.length - 1
    const compareDone = !compareMode || compareStepIndex >= compareSortSteps.length - 1

    if (mainDone && compareDone) {
      setIsSorting(false)
      setIsPaused(false)
      setShowResultModal(true)
      playCompleteSound()
      return
    }

    const timer = window.setTimeout(() => {
      // Advance main
      if (!mainDone) {
        const nextIndex = currentStepIndex + 1
        const nextStep = sortSteps[nextIndex]
        setCurrentStepIndex(nextIndex)
        setStrips(nextStep.array)
        if (nextStep.activeIndices) {
          const idx = nextStep.activeIndices[1] ?? nextStep.activeIndices[0]
          const ratio = strips.length > 1 ? idx / (strips.length - 1) : 0
          playStepSound(ratio, activeAlgorithm)
        }
      }

      // Advance compare
      if (compareMode && !compareDone) {
        const nextCompareIndex = compareStepIndex + 1
        const nextCompareStep = compareSortSteps[nextCompareIndex]
        setCompareStepIndex(nextCompareIndex)
        setCompareStrips(nextCompareStep.array)
        if (nextCompareStep.activeIndices) {
          const idx = nextCompareStep.activeIndices[1] ?? nextCompareStep.activeIndices[0]
          const ratio = compareStrips.length > 1 ? idx / (compareStrips.length - 1) : 0
          playStepSound(ratio, compareAlgorithm)
        }
      }

      if (sortStartTimeRef.current != null) {
        setElapsedMilliseconds(performance.now() - sortStartTimeRef.current)
      }
    }, stepDelay)

    return () => window.clearTimeout(timer)
  }, [
    currentStepIndex, compareStepIndex,
    isSorting, isPaused,
    sortSteps, compareSortSteps,
    compareMode, stepDelay,
    activeAlgorithm, compareAlgorithm,
    strips.length, compareStrips.length, playStepSound, playCompleteSound,
  ])

  // --- Step jump handler ---
  const handleStepJump = useCallback((stepIndex: number) => {
    if (!hasPrepared || isSorting) return
    const clamped = Math.min(Math.max(stepIndex, 0), sortSteps.length - 1)
    setCurrentStepIndex(clamped)
    setStrips(sortSteps[clamped].array)
    if (compareMode && compareSortSteps.length > 0) {
      const compareClamped = Math.min(clamped, compareSortSteps.length - 1)
      setCompareStepIndex(compareClamped)
      setCompareStrips(compareSortSteps[compareClamped].array)
    }
  }, [hasPrepared, isSorting, sortSteps, compareSortSteps, compareMode])

  const normalizeSteps = (rawSteps: SortStep[], initial: Strip[]): SortStep[] => {
    const normalizedSteps: SortStep[] = []
    let lastArray = initial
    let lastComparisons = 0
    let lastSwaps = 0
    const expectedIds = new Set(initial.map((strip) => strip.id))
    const isValidArray = (candidate: Strip[]): boolean => {
      if (!Array.isArray(candidate) || candidate.length !== initial.length) return false

      const seenIds = new Set<number>()
      for (const strip of candidate) {
        if (!strip || !expectedIds.has(strip.id) || seenIds.has(strip.id)) return false
        seenIds.add(strip.id)
      }

      return seenIds.size === expectedIds.size
    }

    const normalizeActiveIndices = (activeIndices: SortStep['activeIndices'], arrayLength: number) => {
      if (!activeIndices) return null

      const [left, right] = activeIndices
      if (left < 0 || right < 0 || left >= arrayLength || right >= arrayLength) return null

      return activeIndices
    }

    for (const step of rawSteps) {
      const nextArray = isValidArray(step.array) ? step.array : lastArray
      normalizedSteps.push({
        ...step,
        array: nextArray,
        activeIndices: normalizeActiveIndices(step.activeIndices, nextArray.length),
      })
      lastArray = nextArray
      lastComparisons = step.comparisons
      lastSwaps = step.swaps
    }
    if (lastArray.length > 0) {
      normalizedSteps.push({
        array: lastArray,
        activeIndices: null,
        comparisons: lastComparisons,
        swaps: lastSwaps,
      })
    }
    return normalizedSteps
  }

  const invalidatePendingPrepare = useCallback(() => {
    prepareRunIdRef.current += 1
    if (prepareTimeoutRef.current != null) {
      window.clearTimeout(prepareTimeoutRef.current)
      prepareTimeoutRef.current = null
    }
  }, [])

  // --- Prepare handler (async with loading state) ---
  const handlePrepare = useCallback(() => {
    if (!imageSrc || isPreparing) return
    invalidatePendingPrepare()
    setSharedResult(null)

    const count = Math.min(Math.max(stripCount, 8), 160)
    const initial = createShuffledStrips(count)
    const runId = prepareRunIdRef.current

    setStrips(initial)
    setCurrentStepIndex(-1)
    setCompareStepIndex(-1)
    setElapsedMilliseconds(0)
    setHasPrepared(false)
    setShowResultModal(false)
    setIsPreparing(true)

    // Async step computation to avoid blocking UI
    prepareTimeoutRef.current = window.setTimeout(() => {
      prepareTimeoutRef.current = null
      try {
        // Generate main algorithm steps
        const generateMainSteps = algorithmId === 'quick'
          ? (items: Strip[]) => generateQuickSortSteps(items, pivotStrategy)
          : activeAlgorithm.generateSteps

        const rawSteps = generateMainSteps(initial)
        const normalizedSteps = normalizeSteps(rawSteps, initial)

        if (prepareRunIdRef.current !== runId) return

        setSortSteps(normalizedSteps)
        setStrips(normalizedSteps[0]?.array ?? initial)

        // Generate compare algorithm steps if in compare mode
        if (compareMode) {
          const generateCompareSteps = compareAlgorithmId === 'quick'
            ? (items: Strip[]) => generateQuickSortSteps(items, pivotStrategy)
            : compareAlgorithm.generateSteps
          const compareRaw = generateCompareSteps(initial)
          const compareNormalized = normalizeSteps(compareRaw, initial)

          if (prepareRunIdRef.current !== runId) return

          setCompareSortSteps(compareNormalized)
          setCompareStrips(compareNormalized[0]?.array ?? initial)
          setCompareStepIndex(-1)
        } else {
          setCompareSortSteps([])
          setCompareStrips([])
          setCompareStepIndex(-1)
        }

        setCurrentStepIndex(-1)
        setElapsedMilliseconds(0)
        setIsSorting(false)
        setIsPaused(false)
        sortStartTimeRef.current = null
        setHasPrepared(true)
      } finally {
        if (prepareRunIdRef.current === runId) {
          setIsPreparing(false)
        }
      }
    }, 0)
  }, [imageSrc, stripCount, algorithmId, pivotStrategy, activeAlgorithm, compareMode, compareAlgorithmId, compareAlgorithm, invalidatePendingPrepare, isPreparing])

  const handleStartSorting = () => {
    if (!hasPrepared || !sortSteps.length) return
    if (!isSorting) {
      setSharedResult(null)
      const mainComplete = currentStepIndex >= sortSteps.length - 1
      const compareComplete = !compareMode
        || compareSortSteps.length === 0
        || compareStepIndex >= compareSortSteps.length - 1
      const shouldRestartAll = mainComplete && compareComplete

      if (shouldRestartAll) {
        setElapsedMilliseconds(0)
        setCurrentStepIndex(-1)
        setStrips(sortSteps[0]?.array ?? [])
        if (compareMode && compareSortSteps.length > 0) {
          setCompareStepIndex(-1)
          setCompareStrips(compareSortSteps[0]?.array ?? [])
        } else {
          setCompareStepIndex(-1)
          setCompareStrips([])
        }
        sortStartTimeRef.current = performance.now()
      } else {
        sortStartTimeRef.current = performance.now() - elapsedMilliseconds
      }
      setShowResultModal(false)
      setIsPaused(false)
      setIsSorting(true)
      return
    }
    if (!isPaused) {
      if (sortStartTimeRef.current != null) {
        setElapsedMilliseconds(performance.now() - sortStartTimeRef.current)
        sortStartTimeRef.current = null
      }
      setIsPaused(true)
      return
    }
    sortStartTimeRef.current = performance.now() - elapsedMilliseconds
    setIsPaused(false)
  }

  const handleReset = () => {
    invalidatePendingPrepare()
    setSharedResult(null)
    setStrips([])
    setSortSteps([])
    setCurrentStepIndex(-1)
    setElapsedMilliseconds(0)
    setIsSorting(false)
    setIsPaused(false)
    setIsPreparing(false)
    sortStartTimeRef.current = null
    setHasPrepared(false)
    setShowResultModal(false)
    setCompareStrips([])
    setCompareSortSteps([])
    setCompareStepIndex(-1)
  }

  const handleStopSorting = () => {
    if (!hasPrepared && !isSorting) return
    setSharedResult(null)
    setIsSorting(false)
    setIsPaused(false)
    sortStartTimeRef.current = null
    setElapsedMilliseconds(0)
    setCurrentStepIndex(-1)
    setShowResultModal(false)
    if (sortSteps.length > 0 && sortSteps[0]?.array) {
      setStrips(sortSteps[0].array)
    }
    if (compareMode && compareSortSteps.length > 0 && compareSortSteps[0]?.array) {
      setCompareStepIndex(-1)
      setCompareStrips(compareSortSteps[0].array)
    }
  }

  const handleCloseResultModal = () => {
    setShowResultModal(false)
    setSharedResult(null)
  }

  const handlePresetChange = (presetId: string) => {
    const preset = PRESET_IMAGES.find((p) => p.id === presetId)
    if (!preset) return
    setImageSourceType('preset')
    setSelectedPresetId(presetId)
    setImageSrc(preset.url)
    handleReset()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMessage(t('error.imageFileOnly'))
      setShowErrorModal(true)
      event.target.value = ''
      return
    }
    if (uploadedImageUrlRef.current) {
      URL.revokeObjectURL(uploadedImageUrlRef.current)
    }
    const url = URL.createObjectURL(file)
    uploadedImageUrlRef.current = url
    setImageSourceType('upload')
    setImageSrc(url)
    setSelectedPresetId('')
    handleReset()
  }

  const handleApplyUrl = () => {
    const url = imageUrlInput.trim()
    if (!url) return
    try { new URL(url) } catch {
      setErrorMessage(t('error.invalidUrlFormat'))
      setShowErrorModal(true)
      return
    }
    setImageSourceType('url')
    setImageSrc(url)
    setSelectedPresetId('')
    handleReset()
  }

  const handleAlgorithmChange = (nextId: SortAlgorithmId) => {
    if (isPreparing) return
    setAlgorithmId(nextId)
    if (compareMode && compareAlgorithmId === nextId) {
      setCompareAlgorithmId(getDistinctCompareAlgorithmId(nextId))
    }
    handleReset()
  }

  const handleCompareModeToggle = () => {
    const nextCompareMode = !compareMode
    setCompareMode(nextCompareMode)
    if (nextCompareMode && compareAlgorithmId === algorithmId) {
      setCompareAlgorithmId(getDistinctCompareAlgorithmId(algorithmId))
    }
    handleReset()
  }

  const handleCompareAlgorithmChange = (nextId: SortAlgorithmId) => {
    if (nextId === algorithmId) return
    setCompareAlgorithmId(nextId)
    handleReset()
  }

  const activeIndices = currentStep?.activeIndices ?? null
  const compareActiveIndices = compareStep?.activeIndices ?? null

  const mainVisualizationStrips = strips
  const compareVisualizationStrips = compareMode ? (compareStrips.length > 0 ? compareStrips : strips) : []

  return (
    <div className="app-root">
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="app-title-block">
            <h1 className="app-title">{t('app.title')}</h1>
            <p className="app-subtitle">{t('app.subtitle')}</p>
          </div>
          <select
            value={algorithmId}
            onChange={(e) => handleAlgorithmChange(e.target.value as SortAlgorithmId)}
            className="algorithm-select"
            aria-label="주 알고리즘"
            disabled={isSorting || isPreparing}
          >
            {SORT_ALGORITHMS.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name} - {algo.complexity}
              </option>
            ))}
          </select>
          {compareMode && (
            <select
              value={compareAlgorithmId}
              onChange={(e) => handleCompareAlgorithmChange(e.target.value as SortAlgorithmId)}
              className="algorithm-select algorithm-select-compare"
              aria-label="비교 알고리즘"
              disabled={isSorting || isPreparing}
            >
              {SORT_ALGORITHMS.filter((algo) => algo.id !== algorithmId).map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name} - {algo.complexity}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="algorithm-help-button"
            onClick={() => setShowAlgorithmModal(true)}
            disabled={!activeAlgorithm || isPreparing}
          >
            {t('algorithm.help')}
          </button>
        </div>

        <div className="top-bar-center">
          {imageSrc && (
            <div className={compareMode ? 'status-panel' : ''}>
              <div className="status-info">
                {compareMode && hasPrepared ? (
                  <>
                    <span className="status-label">{activeAlgorithm.name}:</span>
                    <span className="status-value">{mainProgressValue}</span>
                    <span className="status-divider">•</span>
                    <span className="status-label">{compareAlgorithm.name}:</span>
                    <span className="status-value">{compareProgressValue}</span>
                    <span className="status-divider">•</span>
                    <span className="status-label">{t('status.time')}:</span>
                    <span className="status-value">{formatMilliseconds(elapsedMilliseconds)}</span>
                  </>
                ) : (
                  <>
                    <span className="status-label">{t('status.progress')}:</span>
                    <span className="status-value">
                      {currentStepIndex < 0 ? 0 : currentStepIndex + 1}/
                      {usesOpenEndedTotals ? t('status.unknownTotal') : (totalExpectedSteps || 0)}
                    </span>
                    <span className="status-divider">•</span>
                    <span className="status-label">{t('status.time')}:</span>
                    <span className="status-value">{formatMilliseconds(elapsedMilliseconds)}</span>
                  </>
                )}
              </div>

              {compareMode && hasPrepared && (
                <div className="compare-status-grid">
                  <div className="compare-status-card">
                    <span className="compare-status-title">{activeAlgorithm.name}</span>
                    <span className="compare-status-metric">
                      {t('status.progress')}: {mainProgressValue}
                    </span>
                    <span className="compare-status-metric">
                      {t('status.comparisons')}: {mainDisplayedComparisons.toLocaleString()}
                    </span>
                    <span className="compare-status-metric">
                      {t('status.swaps')}: {mainDisplayedSwaps.toLocaleString()}
                    </span>
                  </div>
                  <div className="compare-status-card">
                    <span className="compare-status-title">{compareAlgorithm.name}</span>
                    <span className="compare-status-metric">
                      {t('status.progress')}: {compareProgressValue}
                    </span>
                    <span className="compare-status-metric">
                      {t('status.comparisons')}: {compareDisplayedComparisons.toLocaleString()}
                    </span>
                    <span className="compare-status-metric">
                      {t('status.swaps')}: {compareDisplayedSwaps.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="top-bar-right">
          <button
            type="button"
            className={`icon-button ${compareMode ? 'icon-button-active' : ''}`}
            onClick={handleCompareModeToggle}
            aria-label={t('controls.compareMode')}
            aria-pressed={compareMode}
            disabled={isSorting || isPreparing}
            title={t('controls.compareMode')}
          >
            ⚡
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowSettingsModal(true)}
            aria-label={t('settings.title')}
            disabled={isSorting || isPreparing}
          >
            ⚙️
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t('controls.toggleTheme')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className={`main-stage ${compareMode ? 'main-stage-compare' : ''}`}>
        {isPreparing && (
          <div className="preparing-overlay">
            <div className="preparing-spinner" />
            <span>계산 중...</span>
          </div>
        )}
        {imageSrc ? (
          <>
            <ErrorBoundary>
              <StripVisualization
                strips={mainVisualizationStrips}
                imageSrc={imageSrc}
                imageSize={imageSize}
                isViewportLandscape={isViewportLandscape}
                activeIndices={activeIndices}
                stepDelay={stepDelay}
                label={compareMode ? activeAlgorithm.name : undefined}
              />
            </ErrorBoundary>
            {compareMode && imageSrc && (
              <ErrorBoundary>
                <StripVisualization
                  strips={compareVisualizationStrips}
                  imageSrc={imageSrc}
                  imageSize={imageSize}
                  isViewportLandscape={isViewportLandscape}
                  activeIndices={compareActiveIndices}
                  stepDelay={stepDelay}
                  label={compareAlgorithm.name}
                />
              </ErrorBoundary>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>{t('empty')}</p>
          </div>
        )}
      </main>

      {/* Step scrubber */}
      {hasPrepared && !isSorting && sortSteps.length > 0 && (
        <div className="step-scrubber">
          <span className="step-scrubber-label">{t('controls.stepJump')}</span>
          <input
            type="range"
            min={0}
            max={sortSteps.length - 1}
            value={currentStepIndex < 0 ? 0 : currentStepIndex}
            onChange={(e) => handleStepJump(Number.parseInt(e.target.value, 10))}
            className="step-scrubber-input"
          />
          <span className="step-scrubber-value">
            {currentStepIndex < 0 ? 0 : currentStepIndex + 1}
            {usesOpenEndedTotals ? ` / ${t('status.unknownTotal')}` : ` / ${sortSteps.length}`}
          </span>
        </div>
      )}

      <footer className="bottom-bar">
        <button
          type="button"
          className="control-btn control-btn-secondary"
          onClick={handleReset}
          disabled={isSorting}
        >
          {t('controls.reset')}
        </button>
        <button
          type="button"
          className="control-btn control-btn-secondary"
          onClick={handlePrepare}
          disabled={!imageSrc || isSorting || isPreparing}
        >
          {isPreparing ? '준비 중...' : t('controls.shuffle')}
        </button>
        <button
          type="button"
          className="control-btn control-btn-secondary"
          onClick={handleStopSorting}
          disabled={!isSorting && !hasPrepared}
        >
          {t('controls.stop')}
        </button>
        <button
          type="button"
          className="control-btn control-btn-primary"
          onClick={handleStartSorting}
          disabled={!hasPrepared || !sortSteps.length || isPreparing}
        >
          {!isSorting ? t('controls.start') : isPaused ? t('controls.continue') : t('controls.pause')}
        </button>
      </footer>

      <TutorialModal isOpen={showTutorialModal} onClose={() => setShowTutorialModal(false)} />

      <AlgorithmModal
        isOpen={showAlgorithmModal}
        onClose={() => setShowAlgorithmModal(false)}
        algorithms={compareMode ? [
          { label: '기준 알고리즘', algorithm: activeAlgorithm },
          { label: '비교 알고리즘', algorithm: compareAlgorithm },
        ] : [
          { label: '선택된 알고리즘', algorithm: activeAlgorithm },
        ]}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        imageSourceType={imageSourceType}
        setImageSourceType={setImageSourceType}
        selectedPresetId={selectedPresetId}
        onPresetChange={handlePresetChange}
        onFileChange={handleFileChange}
        imageUrlInput={imageUrlInput}
        setImageUrlInput={setImageUrlInput}
        onApplyUrl={handleApplyUrl}
        stripCount={stripCount}
        setStripCount={setStripCount}
        stepDelay={stepDelay}
        setStepDelay={setStepDelay}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        pivotStrategy={pivotStrategy}
        setPivotStrategy={setPivotStrategy}
        algorithmId={algorithmId}
      />

      <ResultModal
        isOpen={showResultModal}
        onClose={handleCloseResultModal}
        algorithm={sharedPrimaryAlgorithm ?? activeAlgorithm}
        strips={strips}
        stripCount={sharedResult?.stripCount}
        elapsedMilliseconds={sharedResult?.elapsedMilliseconds ?? elapsedMilliseconds}
        totalComparisons={sharedResult?.totalComparisons ?? totalExpectedComparisons}
        totalSwaps={sharedResult?.totalSwaps ?? totalExpectedSwaps}
        compareResult={sharedResult
          ? (
              sharedResult.compareResult && sharedCompareAlgorithm
                ? {
                    algorithm: sharedCompareAlgorithm,
                    totalComparisons: sharedResult.compareResult.totalComparisons,
                    totalSwaps: sharedResult.compareResult.totalSwaps,
                  }
                : null
            )
          : (
              compareMode
                ? {
                    algorithm: compareAlgorithm,
                    totalComparisons: totalExpectedCompareComparisons,
                    totalSwaps: totalExpectedCompareSwaps,
                  }
                : null
            )}
        imageSourceType={sharedResult?.imageSourceType ?? imageSourceType}
        selectedPresetId={sharedResult?.selectedPresetId ?? selectedPresetId}
        imageSrc={sharedResult?.imageSrc ?? imageSrc}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        errorMessage={errorMessage}
      />
    </div>
  )
}

export default App
