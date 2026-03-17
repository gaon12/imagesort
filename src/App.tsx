import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import type { Strip, SortStep, ImageSourceType, SortAlgorithmId, QuickSortPivot, Theme } from './types'
import { PRESET_IMAGES, SORT_ALGORITHMS, THEME_STORAGE_KEY, TUTORIAL_STORAGE_KEY, QUICK_SORT_PIVOT_STORAGE_KEY } from './constants'
import { createShuffledStrips, formatMilliseconds, getInitialTheme } from './utils'
import { useAudio } from './hooks/useAudio'
import { TutorialModal } from './components/TutorialModal'
import { AlgorithmModal } from './components/AlgorithmModal'
import { SettingsModal } from './components/SettingsModal'
import { ResultModal } from './components/ResultModal'
import { ErrorModal } from './components/ErrorModal'
import { ErrorBoundary } from './components/ErrorBoundary'
import { StripVisualization } from './components/StripVisualization'
import { generateQuickSortSteps } from './algorithms/quickSort'

// Helper to get initial pivot strategy
function getInitialPivot(): QuickSortPivot {
  try {
    const stored = window.localStorage.getItem(QUICK_SORT_PIVOT_STORAGE_KEY)
    if (stored === 'first' || stored === 'last' || stored === 'middle' || stored === 'random') return stored
  } catch { /* ignore */ }
  return 'last'
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

  const { playStepSound, playCompleteSound } = useAudio(soundEnabled, activeAlgorithm)

  const currentStep = currentStepIndex >= 0 ? sortSteps[currentStepIndex] : null
  const compareStep = compareStepIndex >= 0 ? compareSortSteps[compareStepIndex] : null
  const totalExpectedSteps = sortSteps.length
  const totalExpectedComparisons = sortSteps[sortSteps.length - 1]?.comparisons ?? 0
  const totalExpectedSwaps = sortSteps[sortSteps.length - 1]?.swaps ?? 0

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
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const seen = window.localStorage.getItem(TUTORIAL_STORAGE_KEY)
      if (!seen) {
        setShowTutorialModal(true)
        window.localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    try {
      window.localStorage.setItem(QUICK_SORT_PIVOT_STORAGE_KEY, pivotStrategy)
    } catch { /* ignore */ }
  }, [pivotStrategy])

  useEffect(() => {
    if (!imageSrc || typeof Image === 'undefined') {
      setImageSize(null)
      return
    }
    const img = new Image()
    img.onload = () => {
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
      setImageSize(null)
      setErrorMessage(t('error.invalidUrl'))
      setShowErrorModal(true)
      setImageSrc(null)
    }
    img.src = imageSrc
  }, [imageSrc, t])

  useEffect(() => {
    if (!imageSize) return
    const { width, height } = imageSize
    if (!width || !height) return
    const aspect = width / height
    const base = 48
    const factor = Math.min(Math.max(aspect, 0.5), 2)
    const suggested = Math.round(base * factor)
    const clamped = Math.min(Math.max(suggested, 8), 160)
    setStripCount(clamped)
  }, [imageSize])

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
        if (sortStartTimeRef.current != null) {
          setElapsedMilliseconds(performance.now() - sortStartTimeRef.current)
        }
        if (nextStep.activeIndices) {
          const idx = nextStep.activeIndices[1] ?? nextStep.activeIndices[0]
          const ratio = strips.length > 1 ? idx / (strips.length - 1) : 0
          playStepSound(ratio)
        }
      }
      // Advance compare
      if (compareMode && !compareDone) {
        const nextCompareIndex = compareStepIndex + 1
        const nextCompareStep = compareSortSteps[nextCompareIndex]
        setCompareStepIndex(nextCompareIndex)
        setCompareStrips(nextCompareStep.array)
      }
    }, stepDelay)

    return () => window.clearTimeout(timer)
  }, [
    currentStepIndex, compareStepIndex,
    isSorting, isPaused,
    sortSteps, compareSortSteps,
    compareMode, stepDelay,
    strips.length, playStepSound, playCompleteSound,
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
    for (const step of rawSteps) {
      const nextArray =
        Array.isArray(step.array) && step.array.length === initial.length ? step.array : lastArray
      normalizedSteps.push({ ...step, array: nextArray })
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

  // --- Prepare handler (async with loading state) ---
  const handlePrepare = useCallback(() => {
    if (!imageSrc) return
    const count = Math.min(Math.max(stripCount, 8), 160)
    const initial = createShuffledStrips(count)
    setStrips(initial)
    setIsPreparing(true)

    // Async step computation to avoid blocking UI
    setTimeout(() => {
      try {
        // Generate main algorithm steps
        const generateMainSteps = algorithmId === 'quick'
          ? (items: Strip[]) => generateQuickSortSteps(items, pivotStrategy)
          : activeAlgorithm.generateSteps

        const rawSteps = generateMainSteps(initial)
        const normalizedSteps = normalizeSteps(rawSteps, initial)

        setSortSteps(normalizedSteps)

        // Generate compare algorithm steps if in compare mode
        if (compareMode) {
          const generateCompareSteps = compareAlgorithmId === 'quick'
            ? (items: Strip[]) => generateQuickSortSteps(items, pivotStrategy)
            : compareAlgorithm.generateSteps
          const compareRaw = generateCompareSteps(initial)
          const compareNormalized = normalizeSteps(compareRaw, initial)
          setCompareSortSteps(compareNormalized)
          setCompareStrips(initial)
          setCompareStepIndex(-1)
        }

        setCurrentStepIndex(-1)
        setElapsedMilliseconds(0)
        setIsSorting(false)
        setIsPaused(false)
        sortStartTimeRef.current = null
        setHasPrepared(true)
        setShowResultModal(false)
      } finally {
        setIsPreparing(false)
      }
    }, 0)
  }, [imageSrc, stripCount, algorithmId, pivotStrategy, activeAlgorithm, compareMode, compareAlgorithmId, compareAlgorithm])

  const handleStartSorting = () => {
    if (!hasPrepared || !sortSteps.length) return
    if (!isSorting) {
      sortStartTimeRef.current = performance.now()
      setElapsedMilliseconds(0)
      setCurrentStepIndex(-1)
      if (compareMode) {
        setCompareStepIndex(-1)
        if (compareSortSteps.length > 0) setCompareStrips(compareSortSteps[0]?.array ?? compareStrips)
      }
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
    setStrips([])
    setSortSteps([])
    setCurrentStepIndex(-1)
    setElapsedMilliseconds(0)
    setIsSorting(false)
    setIsPaused(false)
    sortStartTimeRef.current = null
    setHasPrepared(false)
    setShowResultModal(false)
    if (compareMode) {
      setCompareStrips([])
      setCompareSortSteps([])
      setCompareStepIndex(-1)
    }
  }

  const handleStopSorting = () => {
    if (!hasPrepared && !isSorting) return
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
    setAlgorithmId(nextId)
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
            disabled={isSorting}
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
              onChange={(e) => { setCompareAlgorithmId(e.target.value as SortAlgorithmId); handleReset() }}
              className="algorithm-select algorithm-select-compare"
              disabled={isSorting}
            >
              {SORT_ALGORITHMS.map((algo) => (
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
            disabled={!activeAlgorithm}
          >
            {t('algorithm.help')}
          </button>
        </div>

        <div className="top-bar-center">
          {imageSrc && (
            <div className="status-info">
              <span className="status-label">{t('status.progress')}:</span>
              <span className="status-value">
                {currentStepIndex < 0 ? 0 : currentStepIndex + 1}/{totalExpectedSteps || 0}
              </span>
              <span className="status-divider">•</span>
              <span className="status-label">{t('status.time')}:</span>
              <span className="status-value">{formatMilliseconds(elapsedMilliseconds)}</span>
            </div>
          )}
        </div>

        <div className="top-bar-right">
          <button
            type="button"
            className={`icon-button ${compareMode ? 'icon-button-active' : ''}`}
            onClick={() => { setCompareMode(!compareMode); handleReset() }}
            disabled={isSorting}
            title={t('controls.compareMode')}
          >
            ⚡
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowSettingsModal(true)}
            disabled={isSorting}
          >
            ⚙️
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
            {currentStepIndex < 0 ? 0 : currentStepIndex + 1} / {sortSteps.length}
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
          disabled={!hasPrepared || !sortSteps.length}
        >
          {!isSorting ? t('controls.start') : isPaused ? t('controls.continue') : t('controls.pause')}
        </button>
      </footer>

      <TutorialModal isOpen={showTutorialModal} onClose={() => setShowTutorialModal(false)} />

      <AlgorithmModal
        isOpen={showAlgorithmModal}
        onClose={() => setShowAlgorithmModal(false)}
        algorithm={activeAlgorithm}
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
        onClose={() => setShowResultModal(false)}
        algorithm={activeAlgorithm}
        strips={strips}
        elapsedMilliseconds={elapsedMilliseconds}
        totalComparisons={totalExpectedComparisons}
        totalSwaps={totalExpectedSwaps}
        imageSrc={imageSrc}
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
