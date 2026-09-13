# candidate-scroll-restoration 작업 기록

## 실제 요청

“ㅇㅇ useScrollRestoration? 뭐 이런식으로 ㄱㄱ”

## 구현 / 판단

- `VirtualCandidateList`에 섞여 있던 두 `useLayoutEffect`를 `useCandidateScrollRestoration`으로 이동했다.
- 범용 브라우저 스크롤 훅이 아니라 후보자 가상 목록의 reset과 focus 요청을 함께 조정하므로 도메인과 동작을 드러내는 이름을 사용했다.
- 검색·직무 조건의 `resetKey`가 바뀌면 맨 위로 이동하는 동작을 유지했다.
- 화면 밖 카드의 행을 pin한 뒤 `scrollToIndex`, control focus, `scrollIntoView`로 보정하는 기존 접근성 계약을 유지했다.
- 재렌더에서 같은 focus 요청이 반복되어 다른 입력의 포커스를 빼앗지 않도록 처리 완료 ref를 훅 내부로 이동했다.
- 컴포넌트 전용 동작이므로 전역 hooks가 아니라 `components/candidate/board/virtual-list`에 함께 배치했다.
- 새 Client Component 경계를 만들지 않고 기존 client entry 아래에서 사용하는 훅으로 유지했다. 설치된 Next `use client` 가이드를 확인했다.

## 검증

- 대상 Prettier: 통과.
- 대상 ESLint: 오류/경고 없이 통과.
- `tsc --noEmit`: 통과.
- `vitest run src/components/candidate/board/virtual-list/virtualization.test.tsx`: 1 file, 7/7 tests 통과.
- `git diff --check`: 통과.

## 남은 이슈

- 없음.
