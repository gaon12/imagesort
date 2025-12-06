import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import type { Strip, SortStep, ImageSourceType, SortAlgorithmId, Theme } from './types'
import { PRESET_IMAGES, SORT_ALGORITHMS, THEME_STORAGE_KEY, TUTORIAL_STORAGE_KEY } from './constants'
import { createShuffledStrips, formatMilliseconds, getInitialTheme } from './utils'
import { useAudio } from './hooks/useAudio'
import { TutorialModal } from './components/TutorialModal'
import { AlgorithmModal } from './components/AlgorithmModal'
import { SettingsModal } from './components/SettingsModal'
import { ResultModal } from './components/ResultModal'
import { ErrorModal } from './components/ErrorModal'

function App() {
  const { t } = useTranslation()

  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [imageSourceType, setImageSourceType] = useState<ImageSourceType>('preset')
  const [imageSrc, setImageSrc] = useState<string | null>(PRESET_IMAGES[0]?.url ?? null)
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_IMAGES[0]?.id ?? 'favicon')
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [stripCount, setStripCount] = useState<number>(64)
  const [algorithmId, setAlgorithmId] = useState<SortAlgorithmId>('quick')
  const [stepDelay, setStepDelay] = useState<number>(28)
  const [strips, setStrips] = useState<Strip[]>([])
  const [sortSteps, setSortSteps] = useState<SortStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1)
  const [isSorting, setIsSorting] = useState(false)
  const [hasPrepared, setHasPrepared] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedMilliseconds, setElapsedMilliseconds] = useState(0)
  const sortStartTimeRef = useRef<number | null>(null)
  const uploadedImageUrlRef = useRef<string | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showTutorialModal, setShowTutorialModal] = useState(false)
  const [showAlgorithmModal, setShowAlgorithmModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isViewportLandscape, setIsViewportLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth >= window.innerHeight
  })

  const activeAlgorithm = useMemo(
    () => SORT_ALGORITHMS.find((a) => a.id === algorithmId) ?? SORT_ALGORITHMS[0],
    [algorithmId]
  )

  const { playStepSound, playCompleteSound } = useAudio(soundEnabled, activeAlgorithm)

  const currentStep = currentStepIndex >= 0 ? sortSteps[currentStepIndex] : null
  const totalExpectedSteps = sortSteps.length
  const totalExpectedComparisons = sortSteps[sortSteps.length - 1]?.comparisons ?? 0
  const totalExpectedSwaps = sortSteps[sortSteps.length - 1]?.swaps ?? 0

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      setIsViewportLandscape(window.innerWidth >= window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 컴포넌트 언마운트 시 업로드된 이미지 URL 정리
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
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

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

  useEffect(() => {
    if (!sortSteps.length) {
      if (isSorting) setIsSorting(false)
      return
    }

    if (!isSorting || isPaused) {
      return
    }

    if (currentStepIndex >= sortSteps.length - 1) {
      setIsSorting(false)
      setIsPaused(false)
      setShowResultModal(true)
      playCompleteSound()
      return
    }

    const timer = window.setTimeout(() => {
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
    }, stepDelay)

    return () => window.clearTimeout(timer)
  }, [currentStepIndex, isSorting, isPaused, sortSteps, stepDelay, strips.length, playStepSound, playCompleteSound])

  const handlePrepare = () => {
    if (!imageSrc) return
    const count = Math.min(Math.max(stripCount, 8), 160)
    const initial = createShuffledStrips(count)
    setStrips(initial)

    const rawSteps = activeAlgorithm.generateSteps(initial)

    // 메모리 절약을 위해 배열 참조를 공유
    const normalizedSteps: SortStep[] = []
    let lastArray = initial
    let lastComparisons = 0
    let lastSwaps = 0

    for (const step of rawSteps) {
      const nextArray =
        Array.isArray(step.array) && step.array.length === initial.length ? step.array : lastArray

      normalizedSteps.push({
        ...step,
        array: nextArray,
      })

      lastArray = nextArray
      lastComparisons = step.comparisons
      lastSwaps = step.swaps
    }

    const finalArray = lastArray
    if (finalArray.length > 0) {
      normalizedSteps.push({
        array: finalArray,
        activeIndices: null,
        comparisons: lastComparisons,
        swaps: lastSwaps,
      })
    }

    setSortSteps(normalizedSteps)
    setCurrentStepIndex(-1)
    setElapsedMilliseconds(0)
    setIsSorting(false)
    setIsPaused(false)
    sortStartTimeRef.current = null
    setHasPrepared(true)
    setShowResultModal(false)
  }

  const handleStartSorting = () => {
    if (!hasPrepared || !sortSteps.length) return

    if (!isSorting) {
      sortStartTimeRef.current = performance.now()
      setElapsedMilliseconds(0)
      setCurrentStepIndex(-1)
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
    // 메모리 해제를 위해 명시적으로 빈 배열로 설정
    setStrips([])
    setSortSteps([])
    setCurrentStepIndex(-1)
    setElapsedMilliseconds(0)
    setIsSorting(false)
    setIsPaused(false)
    sortStartTimeRef.current = null
    setHasPrepared(false)
    setShowResultModal(false)
  }

  const handleStopSorting = () => {
    if (!hasPrepared && !isSorting) return
    setIsSorting(false)
    setIsPaused(false)
    sortStartTimeRef.current = null
    setElapsedMilliseconds(0)
    setCurrentStepIndex(-1)
    setShowResultModal(false)

    if (sortSteps.length > 0) {
      const first = sortSteps[0]
      if (first && Array.isArray(first.array)) {
        setStrips(first.array)
      }
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

    // 이전 업로드 URL 정리
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

    try {
      new URL(url)
    } catch {
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

  return (
    <div className="app-root">
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="app-title-block">
            <h1 className="app-title">Image Sort Studio</h1>
            <p className="app-subtitle">다양한 정렬 알고리즘을 시각화해요.</p>
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
          <button
            type="button"
            className="algorithm-help-button"
            onClick={() => setShowAlgorithmModal(true)}
            disabled={!activeAlgorithm}
          >
            알고리즘 설명
          </button>
        </div>

        <div className="top-bar-center">
          {imageSrc && (
            <div className="status-info">
              <span className="status-label">Progress:</span>
              <span className="status-value">
                {currentStepIndex < 0 ? 0 : currentStepIndex + 1}/{totalExpectedSteps || 0}
              </span>
              <span className="status-divider">•</span>
              <span className="status-label">Time:</span>
              <span className="status-value">{formatMilliseconds(elapsedMilliseconds)}</span>
            </div>
          )}
        </div>

        <div className="top-bar-right">
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

      <main className="main-stage">
        {imageSrc ? (
          <div
            className="image-frame"
            style={
              imageSize
                ? isViewportLandscape
                  ? {
                      aspectRatio: imageSize.width / imageSize.height,
                      height: '100%',
                      maxWidth: '100%',
                    }
                  : {
                      aspectRatio: imageSize.width / imageSize.height,
                      width: '100%',
                      maxHeight: '100%',
                    }
                : undefined
            }
          >
            {strips.length === 0 && (
              <img src={imageSrc} alt="Selected" className="preview-image" />
            )}

            {strips.length > 0 && (
              <div className="strip-container">
                {strips.map((strip, index) => {
                  const isActive =
                    activeIndices?.[0] === index || activeIndices?.[1] === index

                  return (
                    <div
                      key={strip.id}
                      className={isActive ? 'image-strip image-strip-active' : 'image-strip'}
                      style={{
                        width: `${100 / strips.length}%`,
                        backgroundImage: `url(${imageSrc})`,
                        backgroundSize: `${strips.length * 100}% 100%`,
                        backgroundPosition: `${strip.offsetPercent}% 0`,
                        transitionDuration: `${stepDelay * 0.9}ms`,
                      }}
                    />
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <p>이미지를 선택하여 정렬 시각화를 시작하세요</p>
          </div>
        )}
      </main>

      <footer className="bottom-bar">
        <button
          type="button"
          className="control-btn control-btn-secondary"
          onClick={handleReset}
          disabled={isSorting}
        >
          초기화
        </button>
        <button
          type="button"
          className="control-btn control-btn-secondary"
          onClick={handlePrepare}
          disabled={!imageSrc || isSorting}
        >
          조각내고 섞기
        </button>
        <button
          type="button"
          className="control-btn control-btn-secondary"
          onClick={handleStopSorting}
          disabled={!isSorting && !hasPrepared}
        >
          정지
        </button>
        <button
          type="button"
          className="control-btn control-btn-primary"
          onClick={handleStartSorting}
          disabled={!hasPrepared || !sortSteps.length}
        >
          {!isSorting ? '정렬 시작' : isPaused ? '계속' : '일시정지'}
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
