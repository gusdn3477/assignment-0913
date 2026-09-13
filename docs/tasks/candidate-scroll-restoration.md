# candidate-scroll-restoration

## 요청 / 소유권

가상 지원자 목록 컴포넌트에 직접 작성된 스크롤·포커스 복원 effect를 의도가 드러나는 전용 훅으로 분리한다. `codex/candidate-scroll-restoration` 워크트리에서 가상 목록, 인접 훅, 관련 테스트와 작업 기록을 소유한다.

## 계약

- 검색·직무 필터의 `resetKey` 변경 시 각 컬럼의 스크롤을 맨 위로 복원한다.
- 가상화로 화면 밖에 있는 카드도 키보드 탐색과 단계 이동·롤백 후 포커스 복원이 가능해야 한다.
- 이미 처리한 요청을 재실행해 검색창이나 다른 카드의 포커스를 빼앗지 않는다.
- mutable TanStack Virtual 인스턴스의 React Compiler 제외와 안정적인 `rangeExtractor` 계약을 유지한다.
- 컴포넌트 전용 동작은 `virtual-list` 폴더에 함께 둔다.

## 완료 기준

스크롤·포커스 복원 effect를 `useCandidateScrollRestoration`으로 분리하고 기존 가상화 회귀 테스트, lint, strict typecheck와 format 검사를 통과한다.

## 완료 인계 (2026-09-13)

- `VirtualCandidateList`의 스크롤 초기화와 가상 카드 포커스 복원 effect를 인접한 `useCandidateScrollRestoration` 훅으로 분리했다.
- 이미 처리한 요청 차단, `scrollToIndex` 후 control focus 및 근거리 보정 스크롤 동작을 유지했다.
- 대상 Prettier/ESLint, strict typecheck와 가상화 7 tests를 통과했다.
- 브랜치 `codex/candidate-scroll-restoration`, 워크트리 `.worktrees/candidate-scroll-restoration`.
