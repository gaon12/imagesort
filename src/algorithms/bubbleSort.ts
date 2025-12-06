import type { Strip, SortStep } from './types'

export const generateBubbleSortSteps = (items: Strip[]): SortStep[] => {
  const workingArray = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  for (let i = 0; i < workingArray.length - 1; i += 1) {
    let hasSwapped = false

    for (let j = 0; j < workingArray.length - 1 - i; j += 1) {
      comparisons += 1

      // 비교 전 상태 표시
      steps.push({
        array: [...workingArray],
        activeIndices: [j, j + 1],
        comparisons,
        swaps
      })

      if (workingArray[j].originalIndex > workingArray[j + 1].originalIndex) {
        // 교환
        ;[workingArray[j], workingArray[j + 1]] = [workingArray[j + 1], workingArray[j]]
        swaps += 1
        hasSwapped = true

        // 교환 후 상태 표시
        steps.push({
          array: [...workingArray],
          activeIndices: [j, j + 1],
          comparisons,
          swaps
        })
      }
    }

    // 이미 정렬된 경우 조기 종료
    if (!hasSwapped) break
  }

  return steps
}
