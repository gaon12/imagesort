import { describe, it, expect } from 'vitest'
import { generateBubbleSortSteps } from '../bubbleSort'
import { generateQuickSortSteps } from '../quickSort'
import { generateMergeSortSteps } from '../mergeSort'
import { generateHeapSortSteps } from '../heapSort'
import { generateInsertionSortSteps } from '../insertionSort'
import { generateSelectionSortSteps } from '../selectionSort'
import { generateShellSortSteps } from '../shellSort'
import { generateCocktailSortSteps } from '../cocktailSort'
import { generateTreeSortSteps } from '../treeSort'
import { generateTimSortSteps } from '../timSort'
import { generateBlockMergeSortSteps } from '../blockMergeSort'
import { generateIntroSortSteps } from '../introSort'
import { generatePdqSortSteps } from '../pdqSort'
import { generateRadixSortSteps } from '../radixSort'
import { generateCountingSortSteps } from '../countingSort'
import { generateSleepSortSteps } from '../sleepSort'
import { generateGravitySortSteps } from '../gravitySort'
import { generateStoogeSortSteps } from '../stoogeSort'
import { generateBogoSortSteps } from '../bogoSort'
import { generateBogoBogSortSteps } from '../bogoBogSort'
import type { Strip, SortStep } from '../types'

// Helper: create a strip array from an array of originalIndex values
function makeStrips(order: number[]): Strip[] {
  const n = order.length
  return order.map((originalIndex) => ({
    id: originalIndex,
    originalIndex,
    offsetPercent: n <= 1 ? 0 : (originalIndex / (n - 1)) * 100,
  }))
}

// Helper: check if final step array is sorted by originalIndex
function isSorted(strips: Strip[]): boolean {
  for (let i = 0; i < strips.length - 1; i++) {
    if (strips[i].originalIndex > strips[i + 1].originalIndex) return false
  }
  return true
}

// Helper: get the last array state from steps, or the input if no steps
function getFinalState(steps: SortStep[], input: Strip[]): Strip[] {
  if (steps.length === 0) return input
  return steps[steps.length - 1].array
}

type SortFn = (items: Strip[]) => SortStep[]

const ALGORITHMS: Array<{ name: string; fn: SortFn }> = [
  { name: 'Bubble Sort', fn: generateBubbleSortSteps },
  { name: 'Quick Sort', fn: generateQuickSortSteps },
  { name: 'Merge Sort', fn: generateMergeSortSteps },
  { name: 'Heap Sort', fn: generateHeapSortSteps },
  { name: 'Insertion Sort', fn: generateInsertionSortSteps },
  { name: 'Selection Sort', fn: generateSelectionSortSteps },
  { name: 'Shell Sort', fn: generateShellSortSteps },
  { name: 'Cocktail Sort', fn: generateCocktailSortSteps },
  { name: 'Tree Sort', fn: generateTreeSortSteps },
  { name: 'Tim Sort', fn: generateTimSortSteps },
  { name: 'Block Merge Sort', fn: generateBlockMergeSortSteps },
  { name: 'Intro Sort', fn: generateIntroSortSteps },
  { name: 'PDQ Sort', fn: generatePdqSortSteps },
  { name: 'Radix Sort', fn: generateRadixSortSteps },
  { name: 'Counting Sort', fn: generateCountingSortSteps },
  { name: 'Sleep Sort', fn: generateSleepSortSteps },
  { name: 'Gravity Sort', fn: generateGravitySortSteps },
  { name: 'Stooge Sort', fn: generateStoogeSortSteps },
]

// Probabilistic algorithms (may not fully sort within step limit)
const PROBABILISTIC_ALGORITHMS: Array<{ name: string; fn: SortFn }> = [
  { name: 'Bogo Sort', fn: generateBogoSortSteps },
  { name: 'BogoBogo Sort', fn: generateBogoBogSortSteps },
]

describe('Sorting Algorithms - Correctness', () => {
  for (const { name, fn } of ALGORITHMS) {
    describe(name, () => {
      it('sorts a reversed array', () => {
        const input = makeStrips([7, 6, 5, 4, 3, 2, 1, 0])
        const steps = fn(input)
        expect(isSorted(getFinalState(steps, input))).toBe(true)
      })

      it('sorts a shuffled array', () => {
        const input = makeStrips([3, 0, 5, 1, 7, 2, 6, 4])
        const steps = fn(input)
        expect(isSorted(getFinalState(steps, input))).toBe(true)
      })

      it('handles already sorted array', () => {
        const input = makeStrips([0, 1, 2, 3, 4, 5, 6, 7])
        const steps = fn(input)
        expect(isSorted(getFinalState(steps, input))).toBe(true)
      })

      it('handles single element', () => {
        const input = makeStrips([0])
        const steps = fn(input)
        expect(steps.length).toBeGreaterThanOrEqual(0)
        expect(isSorted(getFinalState(steps, input))).toBe(true)
      })

      it('handles two elements', () => {
        const input = makeStrips([1, 0])
        const steps = fn(input)
        expect(isSorted(getFinalState(steps, input))).toBe(true)
      })

      it('generates steps with valid structure', () => {
        const input = makeStrips([2, 0, 1])
        const steps = fn(input)
        for (const step of steps) {
          expect(step).toHaveProperty('array')
          expect(step).toHaveProperty('comparisons')
          expect(step).toHaveProperty('swaps')
          expect(Array.isArray(step.array)).toBe(true)
          expect(typeof step.comparisons).toBe('number')
          expect(typeof step.swaps).toBe('number')
          expect(step.comparisons).toBeGreaterThanOrEqual(0)
          expect(step.swaps).toBeGreaterThanOrEqual(0)
        }
      })

      it('comparison count is non-decreasing through steps', () => {
        const input = makeStrips([4, 2, 0, 3, 1])
        const steps = fn(input)
        for (let i = 1; i < steps.length; i++) {
          expect(steps[i].comparisons).toBeGreaterThanOrEqual(steps[i - 1].comparisons)
        }
      })
    })
  }
})

describe('QuickSort Pivot Strategies', () => {
  const input = makeStrips([5, 3, 1, 4, 0, 2])

  it('first pivot produces sorted result', () => {
    const steps = generateQuickSortSteps(input, 'first')
    expect(isSorted(getFinalState(steps, input))).toBe(true)
  })

  it('last pivot produces sorted result', () => {
    const steps = generateQuickSortSteps(input, 'last')
    expect(isSorted(getFinalState(steps, input))).toBe(true)
  })

  it('middle pivot produces sorted result', () => {
    const steps = generateQuickSortSteps(input, 'middle')
    expect(isSorted(getFinalState(steps, input))).toBe(true)
  })

  it('random pivot produces sorted result', () => {
    const steps = generateQuickSortSteps(input, 'random')
    expect(isSorted(getFinalState(steps, input))).toBe(true)
  })
})

describe('Probabilistic Algorithms - Structure', () => {
  for (const { name, fn } of PROBABILISTIC_ALGORITHMS) {
    describe(name, () => {
      it('returns steps with valid structure', () => {
        const input = makeStrips([2, 0, 1])
        const steps = fn(input)
        expect(steps.length).toBeGreaterThan(0)
        for (const step of steps) {
          expect(step).toHaveProperty('array')
          expect(step).toHaveProperty('comparisons')
          expect(step).toHaveProperty('swaps')
          expect(Array.isArray(step.array)).toBe(true)
        }
      })

      it('handles empty array', () => {
        const steps = fn([])
        expect(steps.length).toBe(0)
      })

      it('handles single element', () => {
        const input = makeStrips([0])
        const steps = fn(input)
        expect(isSorted(getFinalState(steps, input))).toBe(true)
      })
    })
  }
})

describe('Edge Cases', () => {
  it('empty array returns no steps for all deterministic algorithms', () => {
    for (const { fn } of ALGORITHMS) {
      const steps = fn([])
      expect(steps.length).toBe(0)
    }
  })
})
