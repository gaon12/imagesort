import type { Strip, SortStep } from './types'

const INSERTION_THRESHOLD = 24
const NINJA_THRESHOLD = 128

export const generatePdqSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  const insertionSort = (low: number, high: number) => {
    for (let i = low + 1; i <= high; i++) {
      const key = arr[i]
      let j = i - 1
      while (j >= low) {
        comparisons++
        steps.push({ array: [...arr], activeIndices: [j, j + 1], comparisons, swaps })
        if (arr[j].originalIndex > key.originalIndex) {
          arr[j + 1] = arr[j]; swaps++; j--
        } else break
      }
      arr[j + 1] = key
      steps.push({ array: [...arr], activeIndices: [Math.max(low, j + 1), i], comparisons, swaps })
    }
  }

  const heapify = (n: number, i: number, offset: number) => {
    let largest = i
    const l = 2 * i + 1, r = 2 * i + 2
    if (l < n) { comparisons++; if (arr[offset+l].originalIndex > arr[offset+largest].originalIndex) largest = l }
    if (r < n) { comparisons++; if (arr[offset+r].originalIndex > arr[offset+largest].originalIndex) largest = r }
    if (largest !== i) {
      steps.push({ array: [...arr], activeIndices: [offset+i, offset+largest], comparisons, swaps })
      ;[arr[offset+i], arr[offset+largest]] = [arr[offset+largest], arr[offset+i]]; swaps++
      steps.push({ array: [...arr], activeIndices: [offset+i, offset+largest], comparisons, swaps })
      heapify(n, largest, offset)
    }
  }

  const heapSort = (low: number, high: number) => {
    const n = high - low + 1
    for (let i = Math.floor(n/2)-1; i >= 0; i--) heapify(n, i, low)
    for (let i = n-1; i > 0; i--) {
      ;[arr[low], arr[low+i]] = [arr[low+i], arr[low]]; swaps++
      steps.push({ array: [...arr], activeIndices: [low, low+i], comparisons, swaps })
      heapify(i, 0, low)
    }
  }

  // Check if already sorted (pattern detection)
  const isAlreadySorted = (low: number, high: number): boolean => {
    for (let i = low; i < high; i++) {
      comparisons++
      if (arr[i].originalIndex > arr[i+1].originalIndex) return false
    }
    return true
  }

  // Check if reverse sorted
  const isReverseSorted = (low: number, high: number): boolean => {
    for (let i = low; i < high; i++) {
      comparisons++
      if (arr[i].originalIndex < arr[i+1].originalIndex) return false
    }
    return true
  }

  const medianOf3 = (a: number, b: number, c: number): number => {
    comparisons += 3
    if ((arr[a].originalIndex < arr[b].originalIndex) !== (arr[a].originalIndex < arr[c].originalIndex)) return a
    if ((arr[b].originalIndex < arr[a].originalIndex) !== (arr[b].originalIndex < arr[c].originalIndex)) return b
    return c
  }

  const partition = (low: number, high: number): number => {
    const mid = Math.floor((low + high) / 2)
    const pivotIdx = medianOf3(low, mid, high)
    ;[arr[pivotIdx], arr[high]] = [arr[high], arr[pivotIdx]]; swaps++
    const pivot = arr[high].originalIndex
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
    ;[arr[i+1], arr[high]] = [arr[high], arr[i+1]]; swaps++
    steps.push({ array: [...arr], activeIndices: [i+1, high], comparisons, swaps })
    return i + 1
  }

  const pdq = (low: number, high: number, depthLimit: number, badPartitions: number) => {
    const size = high - low + 1
    if (size <= 1) return
    if (size <= INSERTION_THRESHOLD) { insertionSort(low, high); return }
    if (depthLimit === 0) { heapSort(low, high); return }

    // Pattern detection
    if (size < NINJA_THRESHOLD) {
      if (isAlreadySorted(low, high)) return
      if (isReverseSorted(low, high)) {
        // Reverse the range
        let l = low, r = high
        while (l < r) {
          ;[arr[l], arr[r]] = [arr[r], arr[l]]; swaps++
          steps.push({ array: [...arr], activeIndices: [l, r], comparisons, swaps })
          l++; r--
        }
        return
      }
    }

    const pi = partition(low, high)
    const leftSize = pi - low
    const rightSize = high - pi

    // Bad partition detection: if one side is less than 1/8 of the range
    const newBadPartitions = (leftSize < size / 8 || rightSize < size / 8) ? badPartitions + 1 : badPartitions

    pdq(low, pi - 1, depthLimit - 1, newBadPartitions)
    pdq(pi + 1, high, depthLimit - 1, newBadPartitions)
  }

  const depthLimit = Math.floor(2 * Math.log2(arr.length || 1))
  pdq(0, arr.length - 1, depthLimit, 0)
  return steps
}
