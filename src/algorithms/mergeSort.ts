import type { Strip, SortStep } from './types'

export const generateMergeSortSteps = (items: Strip[]): SortStep[] => {
  const workingArray = [...items]
  const bufferArray = [...items]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  const mergeRange = (start: number, end: number) => {
    if (start >= end) return

    const mid = Math.floor((start + end) / 2)

    // 왼쪽 절반 정렬
    mergeRange(start, mid)

    // 오른쪽 절반 정렬
    mergeRange(mid + 1, end)

    // 병합 과정
    let left = start
    let right = mid + 1
    let write = start

    // 두 부분을 병합
    while (left <= mid || right <= end) {
      if (left > mid) {
        // 왼쪽이 모두 소진됨
        bufferArray[write] = workingArray[right]
        right += 1
      } else if (right > end) {
        // 오른쪽이 모두 소진됨
        bufferArray[write] = workingArray[left]
        left += 1
      } else {
        // 두 값을 비교
        comparisons += 1

        steps.push({
          array: [...workingArray],
          activeIndices: [left, right],
          comparisons,
          swaps
        })

        if (workingArray[left].originalIndex <= workingArray[right].originalIndex) {
          bufferArray[write] = workingArray[left]
          left += 1
        } else {
          bufferArray[write] = workingArray[right]
          right += 1
        }
      }
      write += 1
    }

    // 버퍼의 내용을 원본 배열로 복사
    for (let i = start; i <= end; i += 1) {
      if (workingArray[i] !== bufferArray[i]) {
        swaps += 1
      }

      workingArray[i] = bufferArray[i]

      // 병합된 부분 표시
      steps.push({
        array: [...workingArray],
        activeIndices: [i, i],
        comparisons,
        swaps
      })
    }
  }

  if (items.length > 0) {
    mergeRange(0, items.length - 1)
  }

  return steps
}
