import type { Strip, SortStep } from './types'

export const generateCountingSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0
  const n = arr.length

  const maxVal = Math.max(...arr.map(s => s.originalIndex))
  const count: number[] = new Array(maxVal + 1).fill(0)

  // Count phase - show active comparisons
  for (let i = 0; i < n; i++) {
    count[arr[i].originalIndex]++
    comparisons++
    steps.push({
      array: [...arr],
      activeIndices: i > 0 ? [i - 1, i] : null,
      comparisons,
      swaps,
    })
  }

  // Build output array
  const output: Strip[] = []
  for (let v = 0; v <= maxVal; v++) {
    for (let c = 0; c < count[v]; c++) {
      const strip = arr.find(s => s.originalIndex === v)!
      output.push(strip)
    }
  }

  // Placement phase - show each strip being placed
  const result = [...arr]
  for (let i = 0; i < output.length; i++) {
    const fromIdx = result.findIndex(s => s.id === output[i].id)
    if (fromIdx !== i) {
      steps.push({
        array: [...result],
        activeIndices: [fromIdx, i],
        comparisons,
        swaps,
      })
      ;[result[fromIdx], result[i]] = [result[i], result[fromIdx]]
      swaps++
      steps.push({
        array: [...result],
        activeIndices: [fromIdx, i],
        comparisons,
        swaps,
      })
    }
  }

  return steps
}
