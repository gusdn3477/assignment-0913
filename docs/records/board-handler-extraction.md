# board-handler-extraction 작업 기록

## 실제 요청

“JSX에서 우선 빼서 위로 올려볼까”

## 구현 / 판단

- `CandidateBoard` JSX의 `onKeyDownCapture`, `onPointerDownCapture`, `onFocusCapture` 인라인 구현을 컴포넌트 상단의 이름 있는 함수로 이동했다.
- 내부 이벤트 처리 함수에는 `handleBoardKeyDownCapture`, `handleBoardPointerDownCapture`, `handleBoardFocusCapture` 이름을 사용했다.
- 이 단계에서는 별도 훅이나 순수 유틸로 더 분리하지 않고 기존 클로저와 동작을 보존해 구조 변경 위험을 제한했다.
- `onMove`, `onUndo`, `onOpenDetail` prop 계약은 변경하지 않았다.
- 전체 가상 카드 Tab 순서, portal menu 무시, pointer/focus 카드 pin, 단계 이동·롤백 후 포커스 복원 조건을 그대로 유지했다.

## 검증

- 대상 Prettier: 통과.
- 대상 ESLint: 오류/경고 없이 통과.
- `tsc --noEmit`: 통과.
- `vitest run src/components/candidate/board/candidate-board.test.tsx src/components/candidate/board/virtual-list/virtualization.test.tsx`: 2 files, 15/15 tests 통과.
- `git diff --check`: 통과.

## 남은 이슈

- 없음.
