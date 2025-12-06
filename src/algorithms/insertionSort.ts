import type { Strip, SortStep } from './types'

export const generateInsertionSortSteps = (items: Strip[]): SortStep[] => {
  const workingArray = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  for (let i = 1; i < workingArray.length; i += 1) {
    const key = workingArray[i]
    let j = i - 1

    // key와 왼쪽 요소들을 비교하면서 위치 찾기
    while (j >= 0) {
      comparisons += 1

      steps.push({
        array: [...workingArray],
        activeIndices: [j, i],
        comparisons,
        swaps
      })

      if (workingArray[j].originalIndex <= key.originalIndex) {
        break
      }

      j -= 1
    }

    const insertPos = j + 1

    // 이동이 필요한 경우에만 실제로 배열 재배치
    if (insertPos !== i) {
      // key를 제거하고 새 위치에 삽입 (길이는 그대로 유지)
      workingArray.splice(i, 1)
      workingArray.splice(insertPos, 0, key)

      // 이동된 칸 수만큼 쓰기/스왑 증가
      swaps += i - insertPos

      steps.push({
        array: [...workingArray],
        activeIndices: [insertPos, insertPos],
        comparisons,
        swaps
      })
    }
  }

  return steps
}
