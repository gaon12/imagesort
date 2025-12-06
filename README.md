# Image Sort Studio

다양한 정렬 알고리즘을 시각적으로 체험할 수 있는 인터랙티브 웹 애플리케이션입니다. 이미지를 조각내고 섞은 뒤, 여러 정렬 알고리즘이 어떻게 동작하는지 시각적으로 확인할 수 있습니다.

## 주요 기능

### 8가지 정렬 알고리즘 지원
- **Quick Sort** - O(n log n) - 빠른 분할 정복
- **Merge Sort** - O(n log n) - 안정적인 분할 정복
- **Heap Sort** - O(n log n) - 힙 자료구조 기반
- **Bubble Sort** - O(n²) - 인접 요소 교환
- **Insertion Sort** - O(n²) - 삽입하며 정렬
- **Selection Sort** - O(n²) - 최솟값 선택 정렬
- **Shell Sort** - O(n log² n) - 간격을 줄여가며 삽입 정렬
- **Cocktail Shaker Sort** - O(n²) - 양방향 버블 정렬

### 이미지 소스 옵션
- 준비된 샘플 이미지 사용
- 로컬 파일 업로드
- 외부 이미지 URL 사용

### 커스터마이징
- 조각 개수 조절 (8 ~ 160개)
- 정렬 속도 조절 (8ms ~ 80ms)
- 효과음 켜기/끄기
- 다크/라이트 테마

### 시각화 및 통계
- 실시간 정렬 과정 애니메이션
- 비교 중인 요소 하이라이트
- 알고리즘 특성에 맞는 효과음
- 정렬 완료 시 통계 표시 (시간, 비교 횟수, 스왑 횟수)

## 시작하기

### 필요 사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/gaon12/imagesort.git
cd imagesort

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

## 사용 방법

1. **이미지 선택**: 설정 버튼(⚙️)을 눌러 사용할 이미지를 선택합니다.
2. **조각내고 섞기**: 알고리즘과 조각 개수, 속도를 조정한 뒤 "조각내고 섞기" 버튼을 클릭합니다.
3. **정렬 시작**: "정렬 시작" 버튼을 눌러 알고리즘이 이미지를 정렬하는 과정을 시각적으로 확인합니다.
4. **일시정지/계속**: 정렬 중 언제든지 일시정지하거나 다시 재생할 수 있습니다.
5. **정지**: "정지" 버튼을 눌러 정렬을 중단하고 초기 상태로 되돌립니다.

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **CSS Variables** - 테마 시스템
- **Web Audio API** - 효과음

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── TutorialModal.tsx
│   ├── AlgorithmModal.tsx
│   ├── SettingsModal.tsx
│   ├── ResultModal.tsx
│   └── ErrorModal.tsx
├── hooks/              # 커스텀 훅
│   └── useAudio.ts
├── algorithms/         # 정렬 알고리즘 구현
│   ├── bubbleSort.ts
│   ├── mergeSort.ts
│   ├── quickSort.ts
│   └── ...
├── types.ts            # TypeScript 타입 정의
├── constants.ts        # 상수 및 설정
├── utils.ts            # 유틸리티 함수
├── App.tsx             # 메인 앱 컴포넌트
└── main.tsx            # 엔트리 포인트
```

## 메모리 최적화

이 프로젝트는 대량의 정렬 단계를 처리하면서도 메모리 효율성을 유지하기 위해 다음과 같은 최적화를 적용했습니다:

- **Object URL 정리**: 업로드된 이미지의 Blob URL을 적절히 해제하여 메모리 누수 방지
- **배열 참조 공유**: 정렬 단계 간 변경되지 않은 배열은 참조를 공유하여 메모리 사용량 감소
- **명시적 메모리 해제**: 초기화 시 배열을 명시적으로 비워 가비지 컬렉션 지원

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여하기

기여는 언제나 환영합니다! 이슈를 등록하거나 Pull Request를 보내주세요.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 링크

- [GitHub Repository](https://github.com/gaon12/imagesort)
- [Live Demo](https://imagesort.rasca99.dev)

## 문의

문제가 발생하거나 제안 사항이 있으시면 [Issues](https://github.com/gaon12/imagesort/issues)에 등록해주세요.
