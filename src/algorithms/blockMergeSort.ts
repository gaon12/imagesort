import type { Strip, SortStep } from './types'

export const generateBlockMergeSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0
  const n = arr.length

  // Insertion sort for small blocks
  const insertionSort = (low: number, high: number) => {
    for (let i = low + 1; i <= high; i++) {
      let j = i
      while (j > low) {
        comparisons++
        steps.push({ array: [...arr], activeIndices: [j - 1, j], comparisons, swaps })
        if (arr[j - 1].originalIndex <= arr[j].originalIndex) break
        ;[arr[j - 1], arr[j]] = [arr[j], arr[j - 1]]
        swaps++
        steps.push({ array: [...arr], activeIndices: [j - 1, j], comparisons, swaps })
        j--
      }
    }
  }

  // Move arr[from] to arr[to] by shifting elements rightward (from > to)
  const insertAt = (from: number, to: number) => {
    const temp = arr[from]
    for (let k = from; k > to; k--) {
      arr[k] = arr[k - 1]
    }
    arr[to] = temp
    swaps++
    steps.push({ array: [...arr], activeIndices: [to, from], comparisons, swaps })
  }

  // In-place merge [left..mid-1] and [mid..right] using insertion
  const inPlaceMerge = (left: number, mid: number, right: number) => {
    if (left >= mid || mid > right) return
    let i = left
    let j = mid
    while (i < j && j <= right) {
      comparisons++
      steps.push({ array: [...arr], activeIndices: [i, j], comparisons, swaps })
      if (arr[i].originalIndex <= arr[j].originalIndex) {
        i++
      } else {
        insertAt(j, i)
        i++; j++
      }
    }
  }

  // Block size: sqrt(n)
  const blockSize = Math.max(1, Math.floor(Math.sqrt(n)))

  // Step 1: sort each block with insertion sort
  for (let i = 0; i < n; i += blockSize) {
    insertionSort(i, Math.min(i + blockSize - 1, n - 1))
  }

  // Step 2: merge blocks bottom-up
  for (let size = blockSize; size < n; size *= 2) {
    for (let left = 0; left < n - size; left += 2 * size) {
      const mid = left + size
      const right = Math.min(left + 2 * size - 1, n - 1)
      inPlaceMerge(left, mid, right)
    }
  }

  return steps
}
