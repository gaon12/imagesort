import { ALGORITHM_DETAILS } from '../constants'
import type { SortAlgorithm } from '../types'

type AlgorithmModalProps = {
  isOpen: boolean
  onClose: () => void
  algorithm: SortAlgorithm | null
}

export const AlgorithmModal = ({ isOpen, onClose, algorithm }: AlgorithmModalProps) => {
  if (!isOpen || !algorithm) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{algorithm.name} 튜토리얼</h2>
          <button className="modal-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <p className="modal-text">
            지금 선택된 알고리즘은 <strong>{algorithm.name}</strong> 입니다. 아래 순서를
            천천히 따라보면 어떻게 이미지를 정렬하는지 쉽게 이해할 수 있어요.
          </p>
          <p className="modal-text">{ALGORITHM_DETAILS[algorithm.id]?.subtitle}</p>

          <div className="algorithm-meta">
            <span className="algorithm-tag">시간 복잡도: {algorithm.complexity}</span>
            {ALGORITHM_DETAILS[algorithm.id]?.traits.map((trait) => (
              <span key={trait} className="algorithm-tag">
                {trait}
              </span>
            ))}
          </div>

          <ol className="algorithm-steps">
            <li>
              먼저, 화면에 보이는 이미지를 여러 개의 얇은 조각으로 나누고, 이 조각들을 무작위로
              섞어서 &quot;정렬이 필요&quot;한 상태로 만들어 둡니다. 이때 이미지는 양이가 아니라,
              사용자가 선택한 어떤 사진이든 될 수 있어요.
            </li>
            <li>
              그 다음, 선택한 알고리즘(
              <strong>{algorithm.name}</strong>
              )이 두 조각을 비교하면서 &quot;어느 쪽이 앞에 와야 하는지&quot; 판단합니다. 비교하는
              두 칸은 화면에서 밝게 강조돼요.
            </li>
            <li>
              자리를 바꾸어야 한다고 판단되면, 두 조각의 위치가 바뀌고, 동시에 작은 효과음(소리를
              켜 둔 경우)이 나면서 현재 단계가 한 칸씩 앞으로 진전됩니다.
            </li>
            <li>
              이 과정을 왼쪽에서 오른쪽, 또는 구간을 나누어 반복하면서, 결국 왼쪽부터 오른쪽까지
              조각들이 원래 이미지 순서대로 정렬됩니다.
            </li>
            <li>
              정렬이 모두 끝나면, 화면에서 왼쪽에서 오른쪽으로 한 칸씩 훑어가며
              &quot;이제 완전히 정렬되었어!&quot; 하고 확인하는 마무리 애니메이션이 실행되고 결과
              창이 나타납니다.
            </li>
          </ol>

          <p className="modal-text">
            알고리즘을 바꿔가며 같은 이미지를 정렬해 보면, 어떤 방법이 더 빨리, 어떤 방법이 더
            직관적으로 조각을 움직이는지 직접 비교해 볼 수 있어요.
          </p>
        </div>

        <button
          type="button"
          className="control-btn control-btn-primary modal-button"
          onClick={onClose}
        >
          이해했어요
        </button>
      </div>
    </div>
  )
}
