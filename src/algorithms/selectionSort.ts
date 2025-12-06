import type { Strip, SortStep } from './types'

export const generateSelectionSortSteps = (items: Strip[]): SortStep[] => {
  const workingArray = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  for (let i = 0; i < workingArray.length - 1; i += 1) {
    let minIndex = i

    // 최솟값 찾기
    for (let j = i + 1; j < workingArray.length; j += 1) {
      comparisons += 1

      steps.push({
        array: [...workingArray],
        activeIndices: [minIndex, j],
        comparisons,
        swaps
      })

      if (workingArray[j].originalIndex < workingArray[minIndex].originalIndex) {
        minIndex = j
      }
    }

    // 최솟값과 현재 위치 교환
    if (minIndex !== i) {
      ;[workingArray[i], workingArray[minIndex]] = [workingArray[minIndex], workingArray[i]]
      swaps += 1

      steps.push({
        array: [...workingArray],
        activeIndices: [i, minIndex],
        comparisons,
        swaps
      })
    } else {
      // 교환이 필요 없어도 현재 상태 표시
      steps.push({
        array: [...workingArray],
        activeIndices: [i, i],
        comparisons,
        swaps
      })
    }
  }

  return steps
}
