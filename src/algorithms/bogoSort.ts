import type { Strip, SortStep } from './types'

const MAX_STEPS = 8000

export const generateBogoSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  const isSorted = (): boolean => {
    for (let i = 0; i < arr.length - 1; i++) {
      comparisons++
      if (arr[i].originalIndex > arr[i + 1].originalIndex) return false
    }
    return true
  }

  const shuffle = () => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      if (i !== j) {
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
        swaps++
      }
    }
    steps.push({ array: [...arr], activeIndices: [0, arr.length - 1], comparisons, swaps })
  }

  steps.push({ array: [...arr], activeIndices: null, comparisons, swaps })

  while (!isSorted()) {
    if (steps.length >= MAX_STEPS) {
      // Force sort to stop - show final state
      steps.push({ array: [...arr], activeIndices: null, comparisons, swaps })
      break
    }
    shuffle()
  }

  return steps
}
