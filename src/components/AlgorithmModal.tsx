import { ALGORITHM_DETAILS } from '../constants'
import type { SortAlgorithm } from '../types'

type AlgorithmModalItem = {
  label: string
  algorithm: SortAlgorithm
}

type AlgorithmModalProps = {
  isOpen: boolean
  onClose: () => void
  algorithms: AlgorithmModalItem[]
}

export const AlgorithmModal = ({ isOpen, onClose, algorithms }: AlgorithmModalProps) => {
  const visibleAlgorithms = algorithms.filter((item) => item.algorithm)
  const isCompareView = visibleAlgorithms.length > 1

  if (!isOpen || visibleAlgorithms.length === 0) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="알고리즘 설명" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isCompareView ? '알고리즘 비교 설명' : '알고리즘 설명'}</h2>
          <button className="modal-close" type="button" aria-label="닫기" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <p className="modal-text">
            {isCompareView
              ? '비교 모드에서는 두 알고리즘이 같은 이미지와 같은 조각 수를 기준으로 동시에 실행됩니다. 아래 설명을 같이 보면 어떤 방식이 더 빠르고, 어떤 방식이 더 직관적으로 움직이는지 바로 비교할 수 있어요.'
              : '지금 선택된 알고리즘의 특징과 동작 방식을 아래에서 확인할 수 있어요.'}
          </p>

          {visibleAlgorithms.map(({ label, algorithm }) => (
            <section key={`${label}-${algorithm.id}`} style={{ marginBottom: '1rem' }}>
              {isCompareView && (
                <p className="modal-text" style={{ marginBottom: '0.4rem', opacity: 0.7 }}>
                  {label}
                </p>
              )}
              <h3 className="setting-title" style={{ marginBottom: '0.5rem' }}>
                {algorithm.name}
              </h3>
              <p className="modal-text">{ALGORITHM_DETAILS[algorithm.id]?.subtitle}</p>

              <div className="algorithm-meta">
                <span className="algorithm-tag">시간 복잡도: {algorithm.complexity}</span>
                {ALGORITHM_DETAILS[algorithm.id]?.traits.map((trait) => (
                  <span key={`${algorithm.id}-${trait}`} className="algorithm-tag">
                    {trait}
                  </span>
                ))}
              </div>
            </section>
          ))}

          <ol className="algorithm-steps">
            <li>
              먼저, 화면에 보이는 이미지를 여러 개의 얇은 조각으로 나누고, 이 조각들을 무작위로
              섞어서 &quot;정렬이 필요&quot;한 상태로 만들어 둡니다. 이때 이미지는 양이가 아니라,
              사용자가 선택한 어떤 사진이든 될 수 있어요.
            </li>
            <li>
              그 다음, 선택한 알고리즘이 두 조각을 비교하면서 &quot;어느 쪽이 앞에 와야 하는지&quot;
              판단합니다. 비교하는 두 칸은 화면에서 밝게 강조돼요.
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
            {isCompareView
              ? '두 설명을 함께 본 뒤 비교 모드를 실행하면, 같은 입력에서 각 알고리즘이 얼마나 다른 순서와 속도로 움직이는지 바로 확인할 수 있어요.'
              : '알고리즘을 바꿔가며 같은 이미지를 정렬해 보면, 어떤 방법이 더 빨리, 어떤 방법이 더 직관적으로 조각을 움직이는지 직접 비교해 볼 수 있어요.'}
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
