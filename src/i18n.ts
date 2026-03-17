import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  ko: {
    translation: {
      app: {
        title: 'Image Sort Studio',
        subtitle: '다양한 정렬 알고리즘을 시각화해요.',
      },
      controls: {
        reset: '초기화',
        shuffle: '조각내고 섞기',
        stop: '정지',
        start: '정렬 시작',
        pause: '일시정지',
        continue: '계속',
        stepJump: '스텝 이동',
        compareMode: '비교 모드',
        exportResult: '결과 내보내기',
        copyLink: '링크 복사',
        copied: '복사됨!',
      },
      settings: {
        title: '설정',
        imageSelection: '이미지 선택',
        preset: '준비된 이미지',
        upload: '파일 업로드',
        url: '이미지 URL',
        uploadFile: '이미지 파일 선택',
        urlPlaceholder: 'https://example.com/image.png',
        apply: '적용',
        sortOptions: '정렬 옵션',
        stripCount: '조각 개수',
        speed: '속도',
        sound: '소리',
        soundEnabled: '효과음 켜기',
        language: '언어',
        pivotStrategy: '피벗 전략',
        pivotFirst: '첫 번째',
        pivotLast: '마지막',
        pivotMiddle: '중간값',
        pivotRandom: '랜덤',
      },
      tutorial: {
        title: '튜토리얼',
        skip: '건너뛰기',
        prev: '이전',
        next: '다음',
        finish: '시작하기',
        steps: {
          welcome: {
            title: '환영합니다!',
            content: 'Image Sort Studio에 오신 것을 환영합니다. 다양한 정렬 알고리즘을 시각적으로 체험할 수 있습니다.',
          },
          selectImage: {
            title: '이미지 선택',
            content: '오른쪽 상단의 설정 버튼을 눌러 사용할 이미지를 선택합니다. 기본 샘플로 파비콘과 Yangi 이미지를 사용할 수 있습니다.',
          },
          prepare: {
            title: '조각내고 섞기',
            content: '정렬 알고리즘과 조각 개수, 속도를 조정한 뒤 "조각내고 섞기" 버튼을 눌러 이미지를 조각내고 섞습니다.',
          },
          visualize: {
            title: '정렬 시각화',
            content: '"정렬 시작" 버튼을 눌러 알고리즘이 이미지를 어떻게 정렬하는지 시각적으로 확인해 보세요.',
          },
          consent: {
            title: '쿠키 및 분석',
            content: '더 나은 서비스를 제공하기 위해 Google Analytics를 사용하여 익명으로 사용 통계를 수집합니다. 계속 진행하시면 이에 동의하시는 것으로 간주됩니다.',
          },
        },
      },
      algorithm: {
        title: '알고리즘 설명',
        help: '알고리즘 설명',
        intro: '지금 선택된 알고리즘은 <strong>{name}</strong> 입니다. 아래 순서를 천천히 따라보면 어떻게 이미지를 정렬하는지 쉽게 이해할 수 있어요.',
        complexity: '시간 복잡도',
        understand: '이해했어요',
        prev: '이전',
        next: '다음',
        details: {
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
            subtitle: '이진 탐색 트리(BST)에 모든 원소를 삽입한 뒤, 중위 순회로 정렬된 순서를 얻어요.',
            traits: ['불안정 정렬(보통)', '제자리 아님', '트리 편향 시 O(n²) 가능'],
          },
          tim: {
            subtitle: 'Python과 Java의 기본 정렬 알고리즘으로, 삽입 정렬로 소규모 런을 정렬한 뒤 병합 정렬로 합쳐요.',
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
            subtitle: 'Rust 표준 라이브러리에서 사용되는 고급 정렬로, 패턴 감지와 피벗 선택 최적화로 인트로정렬을 개선했어요.',
            traits: ['불안정 정렬', '제자리', '실용적 최고 성능'],
          },
          radix: {
            subtitle: '원소를 직접 비교하지 않고 자릿수별로 안정 정렬을 반복해요. 정수형 데이터에 매우 빠를 수 있어요.',
            traits: ['안정 정렬', '제자리 아님', '비교 기반 아님'],
          },
          counting: {
            subtitle: '각 값의 등장 횟수를 세어 정렬된 위치를 계산해요. 값의 범위가 작을 때 매우 빠르지만, 시각적으로 직접적이에요.',
            traits: ['안정 정렬', '제자리 아님', '비교 기반 아님'],
          },
          sleep: {
            subtitle: '각 원소가 자신의 값에 비례하는 시간 동안 잠들었다가 깨어나 결과에 삽입돼요. 동시성을 이용한 독특한 알고리즘이에요.',
            traits: ['비교 기반 아님', '병렬 실행 전용', '교육용'],
          },
          gravity: {
            subtitle: '구슬(bead)을 막대에 꿰어 중력으로 자동 정렬하는 아이디어예요. 물리적 직관이 돋보이는 알고리즘이에요.',
            traits: ['비교 기반 아님', '제자리 아님', '물리 시뮬레이션'],
          },
          stooge: {
            subtitle: '배열을 3등분해 앞 2/3, 뒤 2/3, 앞 2/3 순으로 재귀 정렬해요. 이론적으로만 흥미롭고 실용성은 없어요.',
            traits: ['불안정 정렬', '제자리', 'O(n^2.7) 매우 비효율'],
          },
          bogo: {
            subtitle: '배열이 정렬될 때까지 무작위로 섞기를 반복해요. 평균 O(n·n!)으로 실용성이 전혀 없는 유머 알고리즘이에요.',
            traits: ['불안정 정렬', '제자리', '최악: 무한'],
          },
          bogobogo: {
            subtitle: '접두사가 정렬될 때마다 접두사 길이를 늘리고, 아니면 전체를 다시 섞어요. 보고 정렬보다도 더 느린 궁극의 비효율 알고리즘이에요.',
            traits: ['불안정 정렬', '제자리', '극소 입력 권장'],
          },
        },
        steps: [
          '먼저, 화면에 보이는 이미지를 여러 개의 얇은 조각으로 나누고, 이 조각들을 무작위로 섞어서 "정렬이 필요"한 상태로 만들어 둡니다.',
          '그 다음, 선택한 알고리즘이 두 조각을 비교하면서 "어느 쪽이 앞에 와야 하는지" 판단합니다. 비교하는 두 칸은 화면에서 밝게 강조돼요.',
          '자리를 바꾸어야 한다고 판단되면, 두 조각의 위치가 바뀌고, 동시에 작은 효과음(소리를 켜 둔 경우)이 나면서 현재 단계가 한 칸씩 앞으로 진전됩니다.',
          '이 과정을 왼쪽에서 오른쪽, 또는 구간을 나누어 반복하면서, 결국 왼쪽부터 오른쪽까지 조각들이 원래 이미지 순서대로 정렬됩니다.',
          '정렬이 모두 끝나면 결과 창이 나타납니다. 알고리즘을 바꿔가며 같은 이미지를 정렬해 보면, 어떤 방법이 더 빨리, 어떤 방법이 더 직관적으로 조각을 움직이는지 직접 비교해 볼 수 있어요.',
        ],
      },
      result: {
        title: '정렬 완료!',
        message: '{algorithm}로 {count}개의 조각을 정렬했습니다.',
        actualTime: '실제 시간',
        comparisons: '총 비교 횟수',
        swaps: '총 스왑/쓰기',
        close: '닫기',
      },
      error: {
        title: '오류',
        confirm: '확인',
        invalidImage: '이미지를 불러올 수 없습니다. 올바른 이미지 파일인지 확인해주세요.',
        invalidUrl: '이미지를 불러올 수 없습니다. URL이 올바른지, 또는 유효한 이미지 파일인지 확인해주세요.',
        imageFileOnly: '이미지 파일만 업로드할 수 있습니다.',
        invalidUrlFormat: '올바른 URL 형식이 아닙니다. https:// 로 시작하는 전체 URL을 입력해주세요.',
      },
      status: {
        progress: 'Progress',
        time: 'Time',
      },
      presets: {
        favicon: '파비콘 샘플',
        yangi: 'Yangi 샘플',
      },
      empty: '이미지를 선택하여 정렬 시각화를 시작하세요',
    },
  },
  en: {
    translation: {
      app: {
        title: 'Image Sort Studio',
        subtitle: 'Visualize various sorting algorithms.',
      },
      controls: {
        reset: 'Reset',
        shuffle: 'Shuffle',
        stop: 'Stop',
        start: 'Start',
        pause: 'Pause',
        continue: 'Continue',
        stepJump: 'Jump to Step',
        compareMode: 'Compare Mode',
        exportResult: 'Export Result',
        copyLink: 'Copy Link',
        copied: 'Copied!',
      },
      settings: {
        title: 'Settings',
        imageSelection: 'Image Selection',
        preset: 'Preset Images',
        upload: 'Upload File',
        url: 'Image URL',
        uploadFile: 'Select Image File',
        urlPlaceholder: 'https://example.com/image.png',
        apply: 'Apply',
        sortOptions: 'Sort Options',
        stripCount: 'Strip Count',
        speed: 'Speed',
        sound: 'Sound',
        soundEnabled: 'Enable Sound',
        language: 'Language',
        pivotStrategy: 'Pivot Strategy',
        pivotFirst: 'First',
        pivotLast: 'Last',
        pivotMiddle: 'Median',
        pivotRandom: 'Random',
      },
      tutorial: {
        title: 'Tutorial',
        skip: 'Skip',
        prev: 'Previous',
        next: 'Next',
        finish: 'Get Started',
        steps: {
          welcome: {
            title: 'Welcome!',
            content: 'Welcome to Image Sort Studio. Experience various sorting algorithms visually.',
          },
          selectImage: {
            title: 'Select Image',
            content: 'Click the settings button in the top right to select an image. You can use the default samples: Favicon and Yangi.',
          },
          prepare: {
            title: 'Shuffle',
            content: 'Adjust the sorting algorithm, strip count, and speed, then click the "Shuffle" button to slice and shuffle the image.',
          },
          visualize: {
            title: 'Visualize',
            content: 'Click the "Start" button to see how the algorithm sorts the image visually.',
          },
          consent: {
            title: 'Cookies & Analytics',
            content: 'We use Google Analytics to collect anonymous usage statistics to provide better service. By continuing, you agree to this.',
          },
        },
      },
      algorithm: {
        title: 'Algorithm Explanation',
        help: 'Algorithm Info',
        intro: 'The selected algorithm is <strong>{name}</strong>. Follow the steps below to understand how it sorts the image.',
        complexity: 'Time Complexity',
        understand: 'Got it',
        prev: 'Previous',
        next: 'Next',
        details: {
          quick: {
            subtitle: 'Based on divide-and-conquer, very fast on average, but can be O(n²) in the worst case depending on pivot selection.',
            traits: ['Unstable sort', 'In-place (usually)', 'Most widely used in practice'],
          },
          merge: {
            subtitle: 'Always O(n log n) stable performance, clear merging process suitable for visualization.',
            traits: ['Stable sort', 'Not in-place', 'Consistent performance on large data'],
          },
          heap: {
            subtitle: 'Uses heap data structure to guarantee O(n log n), but visually has many jumps.',
            traits: ['Unstable sort', 'In-place', 'Related to priority queue'],
          },
          bubble: {
            subtitle: 'One of the most intuitive sorting methods, continuously swapping adjacent elements.',
            traits: ['Stable sort', 'In-place', 'Very slow but easy to implement'],
          },
          insertion: {
            subtitle: 'Especially efficient when dealing with partially sorted data.',
            traits: ['Stable sort', 'In-place', 'Strong in partial sorting'],
          },
          selection: {
            subtitle: 'Selects the minimum value at each step and moves it forward, minimizing swap count.',
            traits: ['Unstable sort', 'In-place', 'Minimizes swaps'],
          },
          shell: {
            subtitle: 'Compares distant elements first and reduces the gap, a faster variant of insertion sort.',
            traits: ['Unstable sort', 'In-place', 'Gap design is important'],
          },
          cocktail: {
            subtitle: 'Bidirectional extension of bubble sort, scanning left and right alternately.',
            traits: ['Stable sort', 'In-place', 'Bidirectional scan'],
          },
          tree: {
            subtitle: 'Inserts all elements into a Binary Search Tree (BST), then extracts them via in-order traversal for a sorted sequence.',
            traits: ['Unstable (usually)', 'Not in-place', 'O(n²) if tree is skewed'],
          },
          tim: {
            subtitle: "Python's and Java's default sort. Sorts small runs with insertion sort, then merges them using merge sort.",
            traits: ['Stable sort', 'Not in-place', 'Optimized for real data'],
          },
          blockMerge: {
            subtitle: 'In-place merge sort using block-based merging with no extra memory. Also known as WikiSort.',
            traits: ['Stable sort', 'In-place', 'Complex implementation'],
          },
          intro: {
            subtitle: 'Starts with quicksort, falls back to heapsort when recursion depth is exceeded, uses insertion sort for small ranges.',
            traits: ['Unstable sort', 'In-place', 'Worst-case prevention'],
          },
          pdq: {
            subtitle: "Used in Rust's standard library. Improves introsort with pattern detection and optimized pivot selection.",
            traits: ['Unstable sort', 'In-place', 'Best practical performance'],
          },
          radix: {
            subtitle: 'Sorts by each digit position without comparing elements directly. Can be very fast for integer data.',
            traits: ['Stable sort', 'Not in-place', 'Non-comparison based'],
          },
          counting: {
            subtitle: 'Counts occurrences of each value and computes sorted positions. Very fast when value range (k) is small.',
            traits: ['Stable sort', 'Not in-place', 'Non-comparison based'],
          },
          sleep: {
            subtitle: 'Each element "sleeps" for a duration proportional to its value, then wakes up and inserts itself into the result.',
            traits: ['Non-comparison based', 'Concurrent only', 'Educational'],
          },
          gravity: {
            subtitle: 'Simulates beads threaded on rods that fall under gravity to sort automatically. A physically intuitive algorithm.',
            traits: ['Non-comparison based', 'Not in-place', 'Physical simulation'],
          },
          stooge: {
            subtitle: 'Recursively sorts the first 2/3, last 2/3, and first 2/3 of the array again. Theoretically interesting but impractical.',
            traits: ['Unstable sort', 'In-place', 'O(n^2.7) very slow'],
          },
          bogo: {
            subtitle: 'Repeatedly shuffles the array at random until it happens to be sorted. Average O(n·n!) — a humor algorithm with no practical use.',
            traits: ['Unstable sort', 'In-place', 'Worst case: infinite'],
          },
          bogobogo: {
            subtitle: 'Extends bogo sort by recursively checking sorted prefixes. Even slower than bogo sort — the ultimate inefficiency.',
            traits: ['Unstable sort', 'In-place', 'Tiny inputs recommended'],
          },
        },
        steps: [
          'First, divide the image into multiple thin strips and shuffle them randomly to create a state that "needs sorting".',
          'Next, the selected algorithm compares two strips to determine "which should come first". The two strips being compared are highlighted on the screen.',
          'If they need to be swapped, the positions of the two strips are swapped, and a small sound effect plays (if sound is enabled) as the current step progresses.',
          'This process repeats from left to right, or by dividing sections, until the strips are sorted in the original image order from left to right.',
          'When sorting is complete, a result window appears. By trying different algorithms on the same image, you can directly compare which method is faster or more intuitive in moving the strips.',
        ],
      },
      result: {
        title: 'Sorting Complete!',
        message: 'Sorted {count} strips using {algorithm}.',
        actualTime: 'Actual Time',
        comparisons: 'Total Comparisons',
        swaps: 'Total Swaps/Writes',
        close: 'Close',
      },
      error: {
        title: 'Error',
        confirm: 'OK',
        invalidImage: 'Cannot load image. Please check if it is a valid image file.',
        invalidUrl: 'Cannot load image. Please check if the URL is correct or if it is a valid image file.',
        imageFileOnly: 'Only image files can be uploaded.',
        invalidUrlFormat: 'Invalid URL format. Please enter a full URL starting with https://.',
      },
      status: {
        progress: 'Progress',
        time: 'Time',
      },
      presets: {
        favicon: 'Favicon Sample',
        yangi: 'Yangi Sample',
      },
      empty: 'Select an image to start sorting visualization',
    },
  },
}

void i18n.use(initReactI18next).init({
  resources,
  lng: (typeof navigator !== 'undefined' && navigator.language?.startsWith('en')) ? 'en' : 'ko',
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
