import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMilliseconds } from '../utils'
import type { ImageSourceType, SortAlgorithm, Strip } from '../types'

type CompareResult = {
  algorithm: SortAlgorithm
  totalComparisons: number
  totalSwaps: number
}

type ResultModalProps = {
  isOpen: boolean
  onClose: () => void
  algorithm: SortAlgorithm
  strips: Strip[]
  stripCount?: number
  elapsedMilliseconds: number
  totalComparisons: number
  totalSwaps: number
  compareResult?: CompareResult | null
  imageSourceType?: ImageSourceType
  selectedPresetId?: string
  imageSrc: string | null
}

export const ResultModal = ({
  isOpen,
  onClose,
  algorithm,
  strips,
  stripCount,
  elapsedMilliseconds,
  totalComparisons,
  totalSwaps,
  compareResult,
  imageSourceType,
  selectedPresetId,
  imageSrc,
}: ResultModalProps) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const effectiveStripCount = stripCount ?? strips.length
  const comparisonLabel = algorithm.isProbabilistic ? t('result.runComparisons') : t('result.comparisons')
  const swapLabel = algorithm.isProbabilistic ? t('result.runSwaps') : t('result.swaps')

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const canvas = document.createElement('canvas')
      const dpr = window.devicePixelRatio || 1
      const width = 600
      const statsHeight = 200
      const maxImageWidth = width - 48
      const maxImageHeight = 280

      let imgHeight = 0
      let imgWidth = 0
      let imgElement: HTMLImageElement | null = null

      if (imageSrc) {
        await new Promise<void>((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const scale = Math.min(
              maxImageWidth / img.naturalWidth,
              maxImageHeight / img.naturalHeight,
              1,
            )
            imgWidth = Math.round(img.naturalWidth * scale)
            imgHeight = Math.round(img.naturalHeight * scale)
            imgElement = img
            resolve()
          }
          img.onerror = () => resolve()
          img.src = imageSrc
        })
      }

      const totalHeight = statsHeight + imgHeight + (imgHeight > 0 ? 16 : 0)
      canvas.width = width * dpr
      canvas.height = totalHeight * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${totalHeight}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)

      // Background
      ctx.fillStyle = '#0f0f12'
      ctx.fillRect(0, 0, width, totalHeight)

      // Title
      ctx.fillStyle = '#f5f5f7'
      ctx.font = 'bold 20px system-ui, sans-serif'
      ctx.fillText('정렬 완료! — ' + algorithm.name, 24, 40)

      // Stats boxes
      const stats = [
        { label: '실제 시간', value: formatMilliseconds(elapsedMilliseconds) },
        { label: algorithm.isProbabilistic ? '이번 실행 비교 횟수' : '총 비교 횟수', value: totalComparisons.toLocaleString() },
        { label: algorithm.isProbabilistic ? '이번 실행 스왑/쓰기' : '총 스왑/쓰기', value: totalSwaps.toLocaleString() },
      ]

      const boxW = (width - 48 - 16) / 3
      stats.forEach((stat, i) => {
        const x = 24 + i * (boxW + 8)
        const y = 60
        ctx.fillStyle = '#25252d'
        ctx.beginPath()
        ctx.roundRect(x, y, boxW, 100, 8)
        ctx.fill()

        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '10px system-ui, sans-serif'
        ctx.fillText(stat.label.toUpperCase(), x + 12, y + 24)

        ctx.fillStyle = '#f5f5f7'
        ctx.font = 'bold 18px system-ui, sans-serif'
        ctx.fillText(stat.value, x + 12, y + 60)
      })

      // Complexity
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '13px system-ui, sans-serif'
      ctx.fillText(algorithm.complexity + ' • ' + effectiveStripCount + ' strips', 24, 185)

      // Image
      if (imgElement && imgHeight > 0) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        const imageX = Math.round((width - imgWidth) / 2)
        ctx.drawImage(imgElement, imageX, statsHeight, imgWidth, imgHeight)
      }

      // Download
      const link = document.createElement('a')
      link.download = `sort-${algorithm.id}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExporting(false)
    }
  }, [algorithm, effectiveStripCount, elapsedMilliseconds, totalComparisons, totalSwaps, imageSrc])

  const handleCopyLink = useCallback(async () => {
    const params = new URLSearchParams({
      algo: algorithm.id,
      strips: String(effectiveStripCount),
      comparisons: String(totalComparisons),
      swaps: String(totalSwaps),
      time: String(Math.round(elapsedMilliseconds)),
    })

    if (compareResult) {
      params.set('compareAlgo', compareResult.algorithm.id)
      params.set('compareComparisons', String(compareResult.totalComparisons))
      params.set('compareSwaps', String(compareResult.totalSwaps))
    }

    if (imageSourceType === 'preset' && selectedPresetId) {
      params.set('source', 'preset')
      params.set('preset', selectedPresetId)
    } else if (imageSourceType === 'url' && imageSrc) {
      params.set('source', 'url')
      params.set('imageUrl', imageSrc)
    } else if (imageSourceType === 'upload') {
      params.set('source', 'upload')
    }

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [algorithm, compareResult, effectiveStripCount, elapsedMilliseconds, imageSourceType, imageSrc, selectedPresetId, totalComparisons, totalSwaps])

  const renderStatsSection = (
    sectionLabel: string,
    sectionAlgorithm: SortAlgorithm,
    comparisons: number,
    swaps: number,
  ) => {
    const sectionComparisonLabel = sectionAlgorithm.isProbabilistic
      ? t('result.runComparisons')
      : t('result.comparisons')
    const sectionSwapLabel = sectionAlgorithm.isProbabilistic
      ? t('result.runSwaps')
      : t('result.swaps')

    return (
      <section className="compare-result-card">
        <div className="compare-result-header">
          <span className="compare-result-label">{sectionLabel}</span>
          <strong className="compare-result-name">{sectionAlgorithm.name}</strong>
        </div>
        <div className="modal-stats modal-stats-compact">
          <div className="stat-item">
            <div className="stat-label">{sectionComparisonLabel}</div>
            <div className="stat-value">{comparisons.toLocaleString()}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">{sectionSwapLabel}</div>
            <div className="stat-value">{swaps.toLocaleString()}</div>
          </div>
        </div>
      </section>
    )
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={t('result.title')} onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{t('result.title')}</h2>
        <p className="modal-text">
          {compareResult
            ? t('result.compareMessage', { primary: algorithm.name, secondary: compareResult.algorithm.name })
            : t('result.message', { algorithm: algorithm.name, count: effectiveStripCount })}
        </p>

        {compareResult ? (
          <>
            <div className="modal-stats modal-stats-single">
              <div className="stat-item">
                <div className="stat-label">{t('result.actualTime')}</div>
                <div className="stat-value">{formatMilliseconds(elapsedMilliseconds)}</div>
              </div>
            </div>

            <div className="compare-result-grid">
              {renderStatsSection(t('result.primaryAlgorithm'), algorithm, totalComparisons, totalSwaps)}
              {renderStatsSection(
                t('result.compareAlgorithm'),
                compareResult.algorithm,
                compareResult.totalComparisons,
                compareResult.totalSwaps,
              )}
            </div>
          </>
        ) : (
          <div className="modal-stats">
            <div className="stat-item">
              <div className="stat-label">{t('result.actualTime')}</div>
              <div className="stat-value">{formatMilliseconds(elapsedMilliseconds)}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">{comparisonLabel}</div>
              <div className="stat-value">{totalComparisons.toLocaleString()}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">{swapLabel}</div>
              <div className="stat-value">{totalSwaps.toLocaleString()}</div>
            </div>
          </div>
        )}

        {imageSrc && (
          <div className="modal-image-wrapper">
            <img src={imageSrc} alt="Sorted result" className="modal-image" />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <button
            type="button"
            className="control-btn control-btn-secondary"
            style={{ flex: 1 }}
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? '내보내는 중...' : t('controls.exportResult')}
          </button>
          <button
            type="button"
            className="control-btn control-btn-secondary"
            style={{ flex: 1 }}
            onClick={handleCopyLink}
          >
            {copied ? t('controls.copied') : t('controls.copyLink')}
          </button>
        </div>

        <button
          type="button"
          className="control-btn control-btn-primary modal-button"
          onClick={onClose}
        >
          {t('result.close')}
        </button>
      </div>
    </div>
  )
}
