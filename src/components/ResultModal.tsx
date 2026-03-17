import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMilliseconds } from '../utils'
import type { SortAlgorithm, Strip } from '../types'

type ResultModalProps = {
  isOpen: boolean
  onClose: () => void
  algorithm: SortAlgorithm
  strips: Strip[]
  elapsedMilliseconds: number
  totalComparisons: number
  totalSwaps: number
  imageSrc: string | null
}

export const ResultModal = ({
  isOpen,
  onClose,
  algorithm,
  strips,
  elapsedMilliseconds,
  totalComparisons,
  totalSwaps,
  imageSrc,
}: ResultModalProps) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      const canvas = document.createElement('canvas')
      const dpr = window.devicePixelRatio || 1
      const width = 600
      const statsHeight = 200

      let imgHeight = 0
      let imgElement: HTMLImageElement | null = null

      if (imageSrc) {
        await new Promise<void>((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            imgHeight = Math.min(280, Math.round((img.naturalHeight / img.naturalWidth) * width))
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
        { label: '총 비교 횟수', value: totalComparisons.toLocaleString() },
        { label: '총 스왑/쓰기', value: totalSwaps.toLocaleString() },
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
      ctx.fillText(algorithm.complexity + ' • ' + strips.length + ' strips', 24, 185)

      // Image
      if (imgElement && imgHeight > 0) {
        ctx.drawImage(imgElement, 24, statsHeight, width - 48, imgHeight)
      }

      // Download
      const link = document.createElement('a')
      link.download = `sort-${algorithm.id}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExporting(false)
    }
  }, [algorithm, strips, elapsedMilliseconds, totalComparisons, totalSwaps, imageSrc])

  const handleCopyLink = useCallback(async () => {
    const params = new URLSearchParams({
      algo: algorithm.id,
      strips: String(strips.length),
      comparisons: String(totalComparisons),
      swaps: String(totalSwaps),
      time: String(Math.round(elapsedMilliseconds)),
    })
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
  }, [algorithm, strips, elapsedMilliseconds, totalComparisons, totalSwaps])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{t('result.title')}</h2>
        <p className="modal-text">
          {t('result.message', { algorithm: algorithm.name, count: strips.length })}
        </p>

        <div className="modal-stats">
          <div className="stat-item">
            <div className="stat-label">{t('result.actualTime')}</div>
            <div className="stat-value">{formatMilliseconds(elapsedMilliseconds)}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">{t('result.comparisons')}</div>
            <div className="stat-value">{totalComparisons.toLocaleString()}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">{t('result.swaps')}</div>
            <div className="stat-value">{totalSwaps.toLocaleString()}</div>
          </div>
        </div>

        {imageSrc && (
          <div className="modal-image-wrapper">
            <img ref={imageRef} src={imageSrc} alt="Sorted result" className="modal-image" />
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
