# board-handler-extraction

## 요청 / 소유권

`CandidateBoard` JSX에 인라인으로 작성된 키보드·포인터·포커스 capture 로직을 컴포넌트 상단의 이름 있는 이벤트 핸들러로 이동한다. `[기능 브랜치]` 워크트리에서 보드 컴포넌트, 관련 테스트와 작업 기록을 소유한다.

## 계약

- JSX에는 `handleBoardKeyDownCapture`, `handleBoardPointerDownCapture`, `handleBoardFocusCapture` 참조만 남긴다.
- 전체 가상 카드의 Tab/Shift+Tab 순서와 화면 밖 control 포커스 요청을 유지한다.
- portalled menu 이벤트를 보드 이벤트로 잘못 처리하지 않는다.
- pointer로 연 카드와 실제 포커스 카드의 pin 상태를 유지한다.
- prop 이름과 외부 컴포넌트 계약은 변경하지 않는다.

## 완료 기준

세 capture 핸들러를 JSX 위로 이동하고 관련 보드·가상화 테스트, format, lint와 strict typecheck를 통과한다.

## 완료 인계 (2026-09-13)

- 키보드, pointer, focus capture 로직을 각각 이름 있는 `handleBoard*Capture` 함수로 이동했다.
- JSX에는 이벤트 prop과 handler 참조만 남기고 기존 조건·탐색·포커스 동작은 변경하지 않았다.
- 대상 format/lint, strict typecheck와 보드·가상화 15 tests를 통과했다.
- 브랜치 `[기능 브랜치]`, 워크트리 `[기능 작업 공간]`.
