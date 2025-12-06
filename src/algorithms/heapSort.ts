import type { Strip, SortStep } from './types'

export const generateHeapSortSteps = (items: Strip[]): SortStep[] => {
  const workingArray = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  const heapify = (n: number, i: number) => {
    let largest = i
    const left = 2 * i + 1
    const right = 2 * i + 2

    // 왼쪽 자식과 비교
    if (left < n) {
      comparisons += 1
      steps.push({
        array: [...workingArray],
        activeIndices: [largest, left],
        comparisons,
        swaps
      })

      if (workingArray[left].originalIndex > workingArray[largest].originalIndex) {
        largest = left
      }
    }

    // 오른쪽 자식과 비교
    if (right < n) {
      comparisons += 1
      steps.push({
        array: [...workingArray],
        activeIndices: [largest, right],
        comparisons,
        swaps
      })

      if (workingArray[right].originalIndex > workingArray[largest].originalIndex) {
        largest = right
      }
    }

    // 최댓값이 루트가 아니면 교환
    if (largest !== i) {
      ;[workingArray[i], workingArray[largest]] = [workingArray[largest], workingArray[i]]
      swaps += 1

      steps.push({
        array: [...workingArray],
        activeIndices: [i, largest],
        comparisons,
        swaps
      })

      // 재귀적으로 영향받은 서브트리를 heapify
      heapify(n, largest)
    }
  }

  const n = workingArray.length

  // Max heap 구성
  for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
    heapify(n, i)
  }

  // 하나씩 힙에서 요소 추출
  for (let i = n - 1; i > 0; i -= 1) {
    // 현재 루트(최댓값)를 끝으로 이동
    ;[workingArray[0], workingArray[i]] = [workingArray[i], workingArray[0]]
    swaps += 1

    steps.push({
      array: [...workingArray],
      activeIndices: [0, i],
      comparisons,
      swaps
    })

    // 축소된 힙에 대해 heapify 호출
    heapify(i, 0)
  }

  return steps
}
