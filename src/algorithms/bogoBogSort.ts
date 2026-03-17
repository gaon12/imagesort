import type { Strip, SortStep } from './types'

const MAX_STEPS = 5000

export const generateBogoBogSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0
  let stepCount = 0

  const isSortedRange = (high: number): boolean => {
    for (let i = 0; i < high; i++) {
      comparisons++
      if (arr[i].originalIndex > arr[i + 1].originalIndex) return false
    }
    return true
  }

  const shuffleRange = (high: number) => {
    for (let i = high; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      if (i !== j) {
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
        swaps++
      }
    }
    stepCount++
    steps.push({
      array: [...arr],
      activeIndices: [0, high],
      comparisons,
      swaps,
    })
  }

  steps.push({ array: [...arr], activeIndices: null, comparisons, swaps })

  // BogoBogo: check each prefix from 1 up to n-1
  // If prefix is not sorted, shuffle entire array and restart from prefix 1
  let prefixEnd = 1
  while (prefixEnd < arr.length) {
    if (stepCount >= MAX_STEPS) break

    if (isSortedRange(prefixEnd)) {
      prefixEnd++
    } else {
      // Shuffle the entire array and restart
      shuffleRange(arr.length - 1)
      prefixEnd = 1
    }
  }

  // Final check step
  steps.push({ array: [...arr], activeIndices: null, comparisons, swaps })

  return steps
}
