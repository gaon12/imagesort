import type { Strip, SortStep } from './types'

export type QuickSortPivot = 'first' | 'last' | 'middle' | 'random'

export const generateQuickSortSteps = (items: Strip[], pivotStrategy: QuickSortPivot = 'last'): SortStep[] => {
  const workingArray = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  const selectPivotIndex = (low: number, high: number): number => {
    switch (pivotStrategy) {
      case 'first': return low
      case 'middle': return Math.floor((low + high) / 2)
      case 'random': return low + Math.floor(Math.random() * (high - low + 1))
      case 'last':
      default: return high
    }
  }

  const partition = (low: number, high: number): number => {
    // Move pivot to end
    const pivotIdx = selectPivotIndex(low, high)
    if (pivotIdx !== high) {
      ;[workingArray[pivotIdx], workingArray[high]] = [workingArray[high], workingArray[pivotIdx]]
      swaps += 1
    }

    const pivot = workingArray[high].originalIndex
    let i = low - 1

    for (let j = low; j < high; j += 1) {
      comparisons += 1
      steps.push({
        array: [...workingArray],
        activeIndices: [j, high],
        comparisons,
        swaps,
      })

      if (workingArray[j].originalIndex < pivot) {
        i += 1
        if (i !== j) {
          ;[workingArray[i], workingArray[j]] = [workingArray[j], workingArray[i]]
          swaps += 1
          steps.push({
            array: [...workingArray],
            activeIndices: [i, j],
            comparisons,
            swaps,
          })
        }
      }
    }

    if (i + 1 !== high) {
      ;[workingArray[i + 1], workingArray[high]] = [workingArray[high], workingArray[i + 1]]
      swaps += 1
      steps.push({
        array: [...workingArray],
        activeIndices: [i + 1, high],
        comparisons,
        swaps,
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
