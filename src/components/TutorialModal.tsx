type TutorialModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const TutorialModal = ({ isOpen, onClose }: TutorialModalProps) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">튜토리얼</h2>
          <button className="modal-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <p className="modal-text">
            1. 오른쪽 상단의 설정 버튼을 눌러 사용할 이미지를 선택합니다. 기본 샘플로 파비콘과
            Yangi 이미지를 사용할 수 있습니다.
          </p>
          <p className="modal-text">
            2. 정렬 알고리즘과 조각 개수, 속도를 조정한 뒤 &quot;조각내고 섞기&quot; 버튼을 눌러
            이미지를 조각내고 섞습니다.
          </p>
          <p className="modal-text">
            3. &quot;정렬 시작&quot; 버튼을 눌러 알고리즘이 이미지를 어떻게 정렬하는지 시각적으로
            확인해 보세요.
          </p>
        </div>

        <button
          type="button"
          className="control-btn control-btn-primary modal-button"
          onClick={onClose}
        >
          시작하기
        </button>
      </div>
    </div>
  )
}
