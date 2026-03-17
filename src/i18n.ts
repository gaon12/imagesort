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
