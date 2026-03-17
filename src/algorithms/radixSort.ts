import type { Strip, SortStep } from './types'

export const generateRadixSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0
  const n = arr.length

  const maxVal = Math.max(...arr.map(s => s.originalIndex))
  if (maxVal === 0) return steps

  // Counting sort by digit at given place value
  const countingByDigit = (exp: number) => {
    const output: Strip[] = new Array(n)
    const count: number[] = new Array(10).fill(0)

    // Count occurrences of each digit
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i].originalIndex / exp) % 10
      count[digit]++
      comparisons++
    }

    // Show current state during counting
    steps.push({ array: [...arr], activeIndices: [0, n - 1], comparisons, swaps })

    // Cumulative count
    for (let i = 1; i < 10; i++) count[i] += count[i - 1]

    // Build output (traverse right to left for stable sort)
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i].originalIndex / exp) % 10
      output[count[digit] - 1] = arr[i]
      count[digit]--
    }

    // Copy back and show each placement
    for (let i = 0; i < n; i++) {
      const oldIdx = arr.findIndex(s => s.id === output[i].id)
      if (arr[i].id !== output[i].id) {
        swaps++
        steps.push({
          array: [...output.slice(0, i + 1), ...arr.slice(i + 1)],
          activeIndices: [Math.min(oldIdx, i), Math.max(oldIdx, i)],
          comparisons,
          swaps,
        })
      }
      arr[i] = output[i]
    }
    steps.push({ array: [...arr], activeIndices: null, comparisons, swaps })
  }

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    countingByDigit(exp)
  }

  return steps
}
