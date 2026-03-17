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
  generateTreeSortSteps,
  generateTimSortSteps,
  generateBlockMergeSortSteps,
  generateIntroSortSteps,
  generatePdqSortSteps,
  generateRadixSortSteps,
  generateCountingSortSteps,
  generateSleepSortSteps,
  generateGravitySortSteps,
  generateStoogeSortSteps,
  generateBogoSortSteps,
  generateBogoBogSortSteps,
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
  { id: 'tree', name: 'Tree Sort', description: 'BST 기반 정렬', complexity: 'O(n log n)', tone: 'sharp', generateSteps: generateTreeSortSteps },
  { id: 'tim', name: 'Tim Sort', description: '삽입+병합 하이브리드', complexity: 'O(n log n)', tone: 'sharp', generateSteps: generateTimSortSteps },
  { id: 'blockMerge', name: 'Block Merge Sort', description: '블록 단위 제자리 병합', complexity: 'O(n log n)', tone: 'sharp', generateSteps: generateBlockMergeSortSteps },
  { id: 'intro', name: 'Intro Sort', description: '퀵+힙+삽입 하이브리드', complexity: 'O(n log n)', tone: 'sharp', generateSteps: generateIntroSortSteps },
  { id: 'pdq', name: 'Pattern-Defeating Quicksort', description: '패턴 감지 퀵정렬', complexity: 'O(n log n)', tone: 'sharp', generateSteps: generatePdqSortSteps },
  { id: 'radix', name: 'Radix Sort', description: '자릿수 기반 정렬', complexity: 'O(nk)', tone: 'soft', generateSteps: generateRadixSortSteps },
  { id: 'counting', name: 'Counting Sort', description: '계수 기반 정렬', complexity: 'O(n+k)', tone: 'soft', generateSteps: generateCountingSortSteps },
  { id: 'sleep', name: 'Sleep Sort', description: '값 비례 지연 정렬', complexity: 'O(max)', tone: 'soft', generateSteps: generateSleepSortSteps },
  { id: 'gravity', name: 'Gravity Sort', description: '구슬 낙하 정렬', complexity: 'O(S)', tone: 'soft', generateSteps: generateGravitySortSteps },
  { id: 'stooge', name: 'Stooge Sort', description: '3분할 재귀 정렬', complexity: 'O(n^2.7)', tone: 'soft', generateSteps: generateStoogeSortSteps },
  { id: 'bogo', name: 'Bogo Sort', description: '무작위 셔플 정렬', complexity: 'O(n·n!)', tone: 'soft', generateSteps: generateBogoSortSteps },
  { id: 'bogobogo', name: 'BogoBogo Sort', description: '재귀적 보고 정렬', complexity: 'O((n+1)!)', tone: 'soft', generateSteps: generateBogoBogSortSteps },
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
  tree: {
    subtitle: '이진 탐색 트리(BST)에 모든 원소를 삽입한 뒤, 중위 순회(in-order traversal)로 정렬된 순서를 얻어요.',
    traits: ['불안정 정렬(보통)', '제자리 아님', '트리 편향 시 O(n²) 가능'],
  },
  tim: {
    subtitle: 'Python과 Java의 기본 정렬 알고리즘으로, 삽입 정렬로 소규모 런(run)을 정렬한 뒤 병합 정렬로 합쳐요.',
    traits: ['안정 정렬', '제자리 아님', '실제 데이터에 최적화'],
  },
  blockMerge: {
    subtitle: '추가 메모리 없이 블록 단위로 병합하는 제자리 병합 정렬이에요. WikiSort라고도 불려요.',
    traits: ['안정 정렬', '제자리', '복잡한 구현'],
  },
  intro: {
    subtitle: '퀵 정렬로 시작해 재귀 깊이 초과 시 힙 정렬, 소규모 구간에는 삽입 정렬로 전환하는 하이브리드예요.',
    traits: ['불안정 정렬', '제자리', '최악의 경우 방지'],
  },
  pdq: {
    subtitle: 'Rust 표준 라이브러리에 사용되는 고급 정렬로, 패턴 감지와 피벗 선택 최적화로 인트로정렬을 개선했어요.',
    traits: ['불안정 정렬', '제자리', '실용적 최고 성능'],
  },
  radix: {
    subtitle: '원소를 직접 비교하지 않고 자릿수별로 안정 정렬을 반복해요. 정수형 데이터에 매우 빠를 수 있어요.',
    traits: ['안정 정렬', '제자리 아님', '비교 기반 아님'],
  },
  counting: {
    subtitle: '각 값의 등장 횟수를 세어 정렬된 위치를 계산해요. 값의 범위(k)가 작을 때 O(n+k)로 매우 빠르지만, 시각적으로 다소 직접적이에요.',
    traits: ['안정 정렬', '제자리 아님', '비교 기반 아님'],
  },
  sleep: {
    subtitle: '각 원소가 자신의 값에 비례하는 시간 동안 "잠들었다가" 깨어나 결과에 삽입돼요. 동시성을 이용한 독특한 알고리즘이에요.',
    traits: ['비교 기반 아님', '병렬 실행 전용', '교육용'],
  },
  gravity: {
    subtitle: '구슬(bead)을 막대에 꿰어 중력으로 자동 정렬하는 아이디어예요. 물리적 직관이 돋보이는 알고리즘이에요.',
    traits: ['비교 기반 아님', '제자리 아님', '물리 시뮬레이션'],
  },
  stooge: {
    subtitle: '배열을 3등분해 앞 2/3, 뒤 2/3, 앞 2/3 순으로 각각 재귀 정렬해요. 이론적으로만 흥미롭고 실용성은 없어요.',
    traits: ['불안정 정렬', '제자리', 'O(n^2.7) 매우 비효율'],
  },
  bogo: {
    subtitle: '배열이 정렬될 때까지 무작위로 섞기를 반복해요. 평균 O(n·n!) 으로 실용성이 전혀 없는 유머 알고리즘이에요.',
    traits: ['불안정 정렬', '제자리', '최악: 무한'],
  },
  bogobogo: {
    subtitle: '접두사가 정렬될 때마다 접두사 길이를 늘리고, 아니면 전체를 다시 섞어요. 보고 정렬보다도 더 느린 궁극의 비효율 알고리즘이에요.',
    traits: ['불안정 정렬', '제자리', '극소 입력 권장'],
  },
}
