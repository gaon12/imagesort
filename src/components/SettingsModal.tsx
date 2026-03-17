import { useTranslation } from 'react-i18next'
import { PRESET_IMAGES } from '../constants'
import type { ImageSourceType, QuickSortPivot, SortAlgorithmId } from '../types'

type SettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  imageSourceType: ImageSourceType
  setImageSourceType: (type: ImageSourceType) => void
  selectedPresetId: string
  onPresetChange: (presetId: string) => void
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  imageUrlInput: string
  setImageUrlInput: (value: string) => void
  onApplyUrl: () => void
  stripCount: number
  setStripCount: (value: number) => void
  stepDelay: number
  setStepDelay: (value: number) => void
  soundEnabled: boolean
  setSoundEnabled: (value: boolean) => void
  pivotStrategy: QuickSortPivot
  setPivotStrategy: (value: QuickSortPivot) => void
  algorithmId: SortAlgorithmId
}

export const SettingsModal = ({
  isOpen,
  onClose,
  imageSourceType,
  setImageSourceType,
  selectedPresetId,
  onPresetChange,
  onFileChange,
  imageUrlInput,
  setImageUrlInput,
  onApplyUrl,
  stripCount,
  setStripCount,
  stepDelay,
  setStepDelay,
  soundEnabled,
  setSoundEnabled,
  pivotStrategy,
  setPivotStrategy,
  algorithmId,
}: SettingsModalProps) => {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">설정</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="setting-group">
            <h3 className="setting-title">이미지 선택</h3>
            <div className="radio-row">
              <label className="radio-option">
                <input
                  type="radio"
                  name="image-source"
                  value="preset"
                  checked={imageSourceType === 'preset'}
                  onChange={() => setImageSourceType('preset')}
                />
                <span>준비된 이미지</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="image-source"
                  value="upload"
                  checked={imageSourceType === 'upload'}
                  onChange={() => setImageSourceType('upload')}
                />
                <span>파일 업로드</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="image-source"
                  value="url"
                  checked={imageSourceType === 'url'}
                  onChange={() => setImageSourceType('url')}
                />
                <span>이미지 URL</span>
              </label>
            </div>

            {imageSourceType === 'preset' && (
              <div className="preset-row">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={preset.id === selectedPresetId ? 'chip chip-active' : 'chip'}
                    onClick={() => onPresetChange(preset.id)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            {imageSourceType === 'upload' && (
              <label className="file-input-label">
                <span>이미지 파일 선택</span>
                <input type="file" accept="image/*" onChange={onFileChange} />
              </label>
            )}

            {imageSourceType === 'url' && (
              <div className="url-input-row">
                <input
                  className="text-input"
                  type="url"
                  placeholder="https://example.com/image.png"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      onApplyUrl()
                    }
                  }}
                />
                <button className="apply-btn" onClick={onApplyUrl}>
                  적용
                </button>
              </div>
            )}
          </div>

          <div className="setting-group">
            <h3 className="setting-title">정렬 옵션</h3>
            <div className="slider-row">
              <label className="slider-label">
                조각 개수
                <span className="slider-value">{stripCount}</span>
              </label>
              <input
                type="range"
                min={8}
                max={160}
                value={stripCount}
                onChange={(e) => setStripCount(Number.parseInt(e.target.value, 10))}
              />
            </div>

            <div className="slider-row">
              <label className="slider-label">
                속도
                <span className="slider-value">{stepDelay}ms</span>
              </label>
              <input
                type="range"
                min={8}
                max={80}
                value={stepDelay}
                onChange={(e) => setStepDelay(Number.parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div className="setting-group">
            <h3 className="setting-title">소리</h3>
            <label className="radio-option">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              <span>효과음 켜기</span>
            </label>
          </div>

          {algorithmId === 'quick' && (
            <div className="setting-group">
              <h3 className="setting-title">{t('settings.pivotStrategy')}</h3>
              <div className="radio-row" style={{ flexWrap: 'wrap' }}>
                {(['first', 'last', 'middle', 'random'] as const).map((strategy) => (
                  <label key={strategy} className="radio-option">
                    <input
                      type="radio"
                      name="pivot-strategy"
                      value={strategy}
                      checked={pivotStrategy === strategy}
                      onChange={() => setPivotStrategy(strategy)}
                    />
                    <span>{t(`settings.pivot${strategy.charAt(0).toUpperCase() + strategy.slice(1)}`)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="setting-group">
            <h3 className="setting-title">정보</h3>
            <a
              href="https://github.com/gaon12/imagesort"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-color)',
                textDecoration: 'none',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>GitHub에서 보기</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
