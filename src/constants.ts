import faviconSample from '/favicon.png'
import yangiSample from './assets/yangi.png'
import {
  generateBubbleSortSteps,
  generateMergeSortSteps,
  generateQuickSortSteps,
  generateHeapSortSteps,
  generateInsertionSortSteps,
  generateSelectionSortSteps,
  generateShellSortSteps,
  generateCocktailSortSteps,
} from './algorithms'
import type { PresetImage, SortAlgorithm, AlgorithmDetail, SortAlgorithmId } from './types'

export const PRESET_IMAGES: PresetImage[] = [
  { id: 'favicon', label: 'favicon', url: faviconSample },
  { id: 'yangi', label: 'yangi', url: yangiSample },
]

export const THEME_STORAGE_KEY = 'image-sort-studio-theme'
export const TUTORIAL_STORAGE_KEY = 'image-sort-studio-tutorial-seen'

export const SORT_ALGORITHMS: SortAlgorithm[] = [
  { id: 'quick', name: 'Quick Sort', description: '빠른 분할 정복', complexity: 'O(n log n)', tone: 'sharp', generateSteps: generateQuickSortSteps },
  { id: 'merge', name: 'Merge Sort', description: '안정적인 분할 정복', complexity: 'O(n log n)', tone: 'sharp', generateSteps: generateMergeSortSteps },
  { id: 'heap', name: 'Heap Sort', description: '힙 자료구조 기반', complexity: 'O(n log n)', tone: 'sharp', generateSteps: generateHeapSortSteps },
  { id: 'bubble', name: 'Bubble Sort', description: '인접 요소 교환', complexity: 'O(n²)', tone: 'soft', generateSteps: generateBubbleSortSteps },
  { id: 'insertion', name: 'Insertion Sort', description: '삽입하며 정렬', complexity: 'O(n²)', tone: 'soft', generateSteps: generateInsertionSortSteps },
  { id: 'selection', name: 'Selection Sort', description: '최솟값 선택 정렬', complexity: 'O(n²)', tone: 'soft', generateSteps: generateSelectionSortSteps },
  { id: 'shell', name: 'Shell Sort', description: '간격을 줄여가며 삽입 정렬', complexity: 'O(n log² n) 정도', tone: 'sharp', generateSteps: generateShellSortSteps },
  { id: 'cocktail', name: 'Cocktail Shaker Sort', description: '양방향 버블 정렬', complexity: 'O(n²)', tone: 'soft', generateSteps: generateCocktailSortSteps },
]

export const QUICK_SORT_PIVOT_STORAGE_KEY = 'image-sort-studio-pivot'

export const ALGORITHM_DETAILS: Record<SortAlgorithmId, AlgorithmDetail> = {
  quick: {
    subtitle: '분할 정복 기반으로 평균적으로 매우 빠르지만, 피벗 선택에 따라 최악의 경우 O(n²)가 될 수 있어요.',
    traits: ['불안정 정렬', '제자리(보통)', '실무에서 가장 많이 쓰이는 편'],
  },
  merge: {
    subtitle: '항상 O(n log n)의 안정적인 성능을 내며, 병합 과정이 명확해 시각화에 잘 어울려요.',
    traits: ['안정 정렬', '제자리 아님', '큰 데이터에서도 일정한 성능'],
  },
  heap: {
    subtitle: '힙 자료구조를 이용해 항상 O(n log n)을 보장하지만, 시각적으로는 다소 튀는 점프가 많아요.',
    traits: ['불안정 정렬', '제자리', '우선순위 큐와 연관 깊음'],
  },
  bubble: {
    subtitle: '가장 직관적인 정렬 방식 중 하나로, 인접한 두 칸을 계속 바꾸면서 정렬해요.',
    traits: ['안정 정렬', '제자리', '매우 느리지만 구현이 쉬움'],
  },
  insertion: {
    subtitle: '이미 어느 정도 정렬된 데이터를 다룰 때 특히 효율적인 방식이에요.',
    traits: ['안정 정렬', '제자리', '부분 정렬에 강함'],
  },
  selection: {
    subtitle: '매 단계에서 최솟값을 골라 앞으로 보내는 방식으로, 교환 횟수가 적은 편이에요.',
    traits: ['불안정 정렬', '제자리', '교환 횟수 최소화'],
  },
  shell: {
    subtitle: '멀리 떨어진 원소부터 비교해 간격을 줄여가며 정렬해, 삽입 정렬을 더 빠르게 만든 변형이에요.',
    traits: ['불안정 정렬', '제자리', '간격(gap) 설계가 중요'],
  },
  cocktail: {
    subtitle: '버블 정렬을 양방향으로 확장한 방식으로, 왼쪽·오른쪽으로 번갈아가며 정렬해요.',
    traits: ['안정 정렬', '제자리', '앞뒤 양방향 스캔'],
  },
}
