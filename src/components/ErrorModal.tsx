type ErrorModalProps = {
  isOpen: boolean
  onClose: () => void
  errorMessage: string
}

export const ErrorModal = ({ isOpen, onClose, errorMessage }: ErrorModalProps) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="오류" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">오류</h2>
          <button className="modal-close" type="button" aria-label="닫기" onClick={onClose}>
            x
          </button>
        </div>

        <div className="modal-content">
          <p className="modal-text">{errorMessage}</p>
        </div>

        <button
          type="button"
          className="control-btn control-btn-primary modal-button"
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  )
}
