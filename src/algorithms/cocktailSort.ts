import type { Strip, SortStep } from './types'

export const generateCocktailSortSteps = (items: Strip[]): SortStep[] => {
  const workingArray = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  let start = 0
  let end = workingArray.length - 1
  let swapped = true

  while (swapped) {
    swapped = false

    for (let i = start; i < end; i += 1) {
      comparisons += 1
      steps.push({
        array: [...workingArray],
        activeIndices: [i, i + 1],
        comparisons,
        swaps,
      })

      if (workingArray[i].originalIndex > workingArray[i + 1].originalIndex) {
        ;[workingArray[i], workingArray[i + 1]] = [workingArray[i + 1], workingArray[i]]
        swaps += 1
        swapped = true

        steps.push({
          array: [...workingArray],
          activeIndices: [i, i + 1],
          comparisons,
          swaps,
        })
      }
    }

    if (!swapped) break

    swapped = false
    end -= 1

    for (let i = end - 1; i >= start; i -= 1) {
      comparisons += 1
      steps.push({
        array: [...workingArray],
        activeIndices: [i, i + 1],
        comparisons,
        swaps,
      })

      if (workingArray[i].originalIndex > workingArray[i + 1].originalIndex) {
        ;[workingArray[i], workingArray[i + 1]] = [workingArray[i + 1], workingArray[i]]
        swaps += 1
        swapped = true

        steps.push({
          array: [...workingArray],
          activeIndices: [i, i + 1],
          comparisons,
          swaps,
        })
      }
    }

    start += 1
  }

  return steps
}
