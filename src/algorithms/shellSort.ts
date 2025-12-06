import type { Strip, SortStep } from './types'

export const generateShellSortSteps = (items: Strip[]): SortStep[] => {
  const workingArray = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  const n = workingArray.length
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i += 1) {
      const temp = workingArray[i]
      let j = i

      // 비교 및 교환
      while (j >= gap) {
        comparisons += 1

        steps.push({
          array: [...workingArray],
          activeIndices: [j - gap, j],
          comparisons,
          swaps,
        })

        if (workingArray[j - gap].originalIndex > temp.originalIndex) {
          // 교환 방식으로 변경 - 참조 중복 방지
          ;[workingArray[j], workingArray[j - gap]] = [workingArray[j - gap], workingArray[j]]
          swaps += 1

          steps.push({
            array: [...workingArray],
            activeIndices: [j - gap, j],
            comparisons,
            swaps,
          })

          j -= gap
        } else {
          break
        }
      }
    }
  }

  return steps
}
