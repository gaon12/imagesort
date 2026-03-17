import type { Strip, SortStep } from './types'

export const generateStoogeSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  const stoogeSort = (low: number, high: number) => {
    if (low >= high) return

    comparisons++
    steps.push({ array: [...arr], activeIndices: [low, high], comparisons, swaps })

    if (arr[low].originalIndex > arr[high].originalIndex) {
      ;[arr[low], arr[high]] = [arr[high], arr[low]]
      swaps++
      steps.push({ array: [...arr], activeIndices: [low, high], comparisons, swaps })
    }

    if (high - low + 1 > 2) {
      const third = Math.floor((high - low + 1) / 3)
      stoogeSort(low, high - third)         // sort first 2/3
      stoogeSort(low + third, high)          // sort last 2/3
      stoogeSort(low, high - third)          // sort first 2/3 again
    }
  }

  stoogeSort(0, arr.length - 1)
  return steps
}
