import type { Strip, SortStep } from './types'

const INSERTION_THRESHOLD = 16

export const generateIntroSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0
  const maxDepth = Math.floor(2 * Math.log2(arr.length || 1))

  const insertionSort = (low: number, high: number) => {
    for (let i = low + 1; i <= high; i++) {
      const key = arr[i]
      let j = i - 1
      while (j >= low) {
        comparisons++
        steps.push({ array: [...arr], activeIndices: [j, j + 1], comparisons, swaps })
        if (arr[j].originalIndex > key.originalIndex) {
          arr[j + 1] = arr[j]
          swaps++
          j--
        } else break
      }
      arr[j + 1] = key
      steps.push({ array: [...arr], activeIndices: [Math.max(low, j + 1), i], comparisons, swaps })
    }
  }

  const heapify = (n: number, i: number, offset: number) => {
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2
    if (left < n) {
      comparisons++
      if (arr[offset + left].originalIndex > arr[offset + largest].originalIndex) largest = left
    }
    if (right < n) {
      comparisons++
      if (arr[offset + right].originalIndex > arr[offset + largest].originalIndex) largest = right
    }
    if (largest !== i) {
      steps.push({ array: [...arr], activeIndices: [offset + i, offset + largest], comparisons, swaps })
      ;[arr[offset + i], arr[offset + largest]] = [arr[offset + largest], arr[offset + i]]
      swaps++
      steps.push({ array: [...arr], activeIndices: [offset + i, offset + largest], comparisons, swaps })
      heapify(n, largest, offset)
    }
  }

  const heapSort = (low: number, high: number) => {
    const n = high - low + 1
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i, low)
    for (let i = n - 1; i > 0; i--) {
      steps.push({ array: [...arr], activeIndices: [low, low + i], comparisons, swaps })
      ;[arr[low], arr[low + i]] = [arr[low + i], arr[low]]
      swaps++
      steps.push({ array: [...arr], activeIndices: [low, low + i], comparisons, swaps })
      heapify(i, 0, low)
    }
  }

  const medianOfThree = (low: number, high: number): number => {
    const mid = Math.floor((low + high) / 2)
    if (arr[low].originalIndex > arr[mid].originalIndex) {
      ;[arr[low], arr[mid]] = [arr[mid], arr[low]]; swaps++
    }
    if (arr[low].originalIndex > arr[high].originalIndex) {
      ;[arr[low], arr[high]] = [arr[high], arr[low]]; swaps++
    }
    if (arr[mid].originalIndex > arr[high].originalIndex) {
      ;[arr[mid], arr[high]] = [arr[high], arr[mid]]; swaps++
    }
    ;[arr[mid], arr[high - 1]] = [arr[high - 1], arr[mid]]; swaps++
    return arr[high - 1].originalIndex
  }

  const partition = (low: number, high: number): number => {
    const pivot = medianOfThree(low, high)
    let i = low - 1
    for (let j = low; j < high; j++) {
      comparisons++
      steps.push({ array: [...arr], activeIndices: [j, high], comparisons, swaps })
      if (arr[j].originalIndex <= pivot) {
        i++
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]; swaps++
          steps.push({ array: [...arr], activeIndices: [i, j], comparisons, swaps })
        }
      }
    }
    ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; swaps++
    steps.push({ array: [...arr], activeIndices: [i + 1, high], comparisons, swaps })
    return i + 1
  }

  const introSortImpl = (low: number, high: number, depth: number) => {
    const size = high - low + 1
    if (size <= 1) return
    if (size <= INSERTION_THRESHOLD) {
      insertionSort(low, high)
      return
    }
    if (depth === 0) {
      heapSort(low, high)
      return
    }
    const pi = partition(low, high)
    introSortImpl(low, pi - 1, depth - 1)
    introSortImpl(pi + 1, high, depth - 1)
  }

  introSortImpl(0, arr.length - 1, maxDepth)
  return steps
}
