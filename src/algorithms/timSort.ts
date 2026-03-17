import type { Strip, SortStep } from './types'

const RUN = 32

export const generateTimSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0
  const n = arr.length

  // Insertion sort a run from left to right
  const insertionSortRun = (left: number, right: number) => {
    for (let i = left + 1; i <= right; i++) {
      const key = arr[i]
      let j = i - 1
      while (j >= left) {
        comparisons++
        steps.push({
          array: [...arr],
          activeIndices: [j, j + 1],
          comparisons,
          swaps,
        })
        if (arr[j].originalIndex > key.originalIndex) {
          arr[j + 1] = arr[j]
          swaps++
          j--
        } else {
          break
        }
      }
      arr[j + 1] = key
      if (j + 1 !== i) {
        steps.push({
          array: [...arr],
          activeIndices: [j + 1, i],
          comparisons,
          swaps,
        })
      }
    }
  }

  // Merge two sorted halves [left..mid] and [mid+1..right]
  const merge = (left: number, mid: number, right: number) => {
    const leftPart = arr.slice(left, mid + 1)
    const rightPart = arr.slice(mid + 1, right + 1)
    let i = 0, j = 0, k = left
    while (i < leftPart.length && j < rightPart.length) {
      comparisons++
      steps.push({
        array: [...arr],
        activeIndices: [left + i, mid + 1 + j],
        comparisons,
        swaps,
      })
      if (leftPart[i].originalIndex <= rightPart[j].originalIndex) {
        arr[k] = leftPart[i]; i++
      } else {
        arr[k] = rightPart[j]; j++
        swaps++
      }
      k++
      steps.push({
        array: [...arr],
        activeIndices: [k - 1, k - 1],
        comparisons,
        swaps,
      })
    }
    while (i < leftPart.length) { arr[k++] = leftPart[i++] }
    while (j < rightPart.length) { arr[k++] = rightPart[j++] }
    steps.push({
      array: [...arr],
      activeIndices: [left, right],
      comparisons,
      swaps,
    })
  }

  // Sort each run with insertion sort
  for (let i = 0; i < n; i += RUN) {
    insertionSortRun(i, Math.min(i + RUN - 1, n - 1))
  }

  // Merge runs
  for (let size = RUN; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1)
      const right = Math.min(left + 2 * size - 1, n - 1)
      if (mid < right) {
        merge(left, mid, right)
      }
    }
  }

  return steps
}
