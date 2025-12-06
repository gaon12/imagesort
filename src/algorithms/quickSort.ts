import type { Strip, SortStep } from './types'

export const generateQuickSortSteps = (items: Strip[]): SortStep[] => {
  const workingArray = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  const partition = (low: number, high: number): number => {
    const pivot = workingArray[high].originalIndex
    let i = low - 1

    // Pivot과 비교
    for (let j = low; j < high; j += 1) {
      comparisons += 1

      // 비교 중인 요소 표시
      steps.push({
        array: [...workingArray],
        activeIndices: [j, high],
        comparisons,
        swaps
      })

      if (workingArray[j].originalIndex < pivot) {
        i += 1
        if (i !== j) {
          ;[workingArray[i], workingArray[j]] = [workingArray[j], workingArray[i]]
          swaps += 1

          // 교환 후 상태 표시
          steps.push({
            array: [...workingArray],
            activeIndices: [i, j],
            comparisons,
            swaps
          })
        }
      }
    }

    // Pivot을 올바른 위치로 이동
    if (i + 1 !== high) {
      ;[workingArray[i + 1], workingArray[high]] = [workingArray[high], workingArray[i + 1]]
      swaps += 1

      steps.push({
        array: [...workingArray],
        activeIndices: [i + 1, high],
        comparisons,
        swaps
      })
    }

    return i + 1
  }

  const quickSort = (low: number, high: number) => {
    if (low < high) {
      const pi = partition(low, high)
      quickSort(low, pi - 1)
      quickSort(pi + 1, high)
    }
  }

  if (items.length > 0) quickSort(0, items.length - 1)
  return steps
}
