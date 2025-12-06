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
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">정렬 완료!</h2>
        <p className="modal-text">
          {algorithm.name}로 {strips.length.toLocaleString()}개의 조각을 정렬했습니다.
        </p>

        <div className="modal-stats">
          <div className="stat-item">
            <div className="stat-label">실제 시간</div>
            <div className="stat-value">{formatMilliseconds(elapsedMilliseconds)}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">총 비교 횟수</div>
            <div className="stat-value">{totalComparisons.toLocaleString()}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">총 스왑/쓰기</div>
            <div className="stat-value">{totalSwaps.toLocaleString()}</div>
          </div>
        </div>

        {imageSrc && (
          <div className="modal-image-wrapper">
            <img src={imageSrc} alt="Sorted result" className="modal-image" />
          </div>
        )}

        <button
          type="button"
          className="control-btn control-btn-primary modal-button"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  )
}
