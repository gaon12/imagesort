import type { Strip, SortStep } from './types'

export const generateGravitySortSteps = (items: Strip[]): SortStep[] => {
  if (items.length === 0) return []
  const arr = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0
  const n = arr.length

  // Values are originalIndex (0..n-1)
  // Represent as a grid of beads: grid[i][j] = 1 if bead exists at row i, column j
  const maxVal = Math.max(...arr.map(s => s.originalIndex))

  // Create bead grid: each row corresponds to a strip's value
  const grid: number[][] = Array.from({ length: n }, () => new Array(maxVal + 1).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < arr[i].originalIndex; j++) {
      grid[i][j] = 1
    }
    comparisons++
  }

  steps.push({ array: [...arr], activeIndices: null, comparisons, swaps })

  // Let beads fall column by column
  for (let col = 0; col <= maxVal; col++) {
    // Count beads in this column
    let beadCount = 0
    for (let row = 0; row < n; row++) {
      beadCount += grid[row][col]
    }
    // Beads fall to bottom
    for (let row = 0; row < n; row++) {
      const newVal = row >= n - beadCount ? 1 : 0
      grid[row][col] = newVal
    }
    comparisons++
  }

  // Read sorted values from grid (each row's bead count = its value)
  const sortedValues: number[] = []
  for (let row = 0; row < n; row++) {
    let beads = 0
    for (let col = 0; col <= maxVal; col++) {
      beads += grid[row][col]
    }
    sortedValues.push(beads)
  }

  // Map sorted values back to strips
  const valueCounts = new Map<number, Strip[]>()
  for (const strip of arr) {
    if (!valueCounts.has(strip.originalIndex)) valueCounts.set(strip.originalIndex, [])
    valueCounts.get(strip.originalIndex)!.push(strip)
  }

  const sortedStrips: Strip[] = sortedValues.map(v => {
    const available = valueCounts.get(v)!
    return available.shift()!
  })

  // Animate placement
  const result = [...arr]
  for (let i = 0; i < sortedStrips.length; i++) {
    const fromIdx = result.findIndex(s => s.id === sortedStrips[i].id)
    if (fromIdx !== i) {
      steps.push({ array: [...result], activeIndices: [fromIdx, i], comparisons, swaps })
      ;[result[fromIdx], result[i]] = [result[i], result[fromIdx]]
      swaps++
      steps.push({ array: [...result], activeIndices: [fromIdx, i], comparisons, swaps })
    }
  }

  return steps
}
