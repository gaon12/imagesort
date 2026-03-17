import type { Strip, SortStep } from './types'

export const generateSleepSortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  // Each strip has a "wake time" equal to its originalIndex
  // Simulate: sort by wake time and place each strip into position
  const wakeOrder = [...arr].sort((a, b) => a.originalIndex - b.originalIndex)

  // Show initial state - all strips are "sleeping"
  steps.push({ array: [...arr], activeIndices: null, comparisons, swaps })

  const result = [...arr]
  for (let i = 0; i < wakeOrder.length; i++) {
    // This strip "wakes up" and needs to go to position i
    const strip = wakeOrder[i]
    const fromIdx = result.findIndex(s => s.id === strip.id)

    comparisons++
    // Show the strip "waking up" at its current position
    steps.push({
      array: [...result],
      activeIndices: fromIdx !== i ? [fromIdx, i] : [fromIdx, fromIdx],
      comparisons,
      swaps,
    })

    if (fromIdx !== i) {
      // Bubble this strip from its current position to position i
      let cur = fromIdx
      while (cur > i) {
        ;[result[cur], result[cur - 1]] = [result[cur - 1], result[cur]]
        swaps++
        cur--
        steps.push({
          array: [...result],
          activeIndices: [cur, cur + 1],
          comparisons,
          swaps,
        })
      }
    }
  }

  return steps
}
