# search-board-polish

## 요청 / 소유권
사용자: 카드 영역 height가 좁고 하단 잘림, Input left/right에 돋보기/clearButton을 넣어 SearchBar처럼 확장 가능하게 구성, ResetButton/ReloadButton 추상화.
새 codex/search-board-polish, .worktrees/search-board-polish 기능 세션이 src/**와 본 task/docs/records/search-board-polish.md를 소유합니다. 통합 담당은 상위 기록·설치·build/browser·main 병합을 담당합니다. 새 의존성 불필요.

## 계약
- Input은 native input props/ref를 유지하고 left/right ReactNode 슬롯을 실제 지원. 좌우 슬롯 크기에 따라 입력과 겹치지 않는 레이아웃. 기존 clearButton API 호환하며 clear는 right 슬롯 조합을 활용; disabled/readOnly/빈 값/keyboard/native form 동작 보존.
- SearchBar 공통 컴포넌트는 Input을 조합해 돋보기/clearButton을 제공하고 CandidateToolbar에 실제 적용. 외부에서 absolute Search icon/pl-9 구현 제거. label은 접근 가능하게 유지, controlled update 즉시/persist/refetch 없음 보존.
- ResetButton 기존 실제 사용 유지. ReloadButton 추가하여 background refresh 사용. 최초 조회 실패/렌더 실패는 RetryButton 유지. pending/native props/ref 의미 보존.
- 카드 영역은 기존 max-height min(60vh,720px)보다 넉넉하게(기본 약 720px 이상 가용 공간), 목록 마지막 카드와 focus outline이 끝에서 잘리지 않도록 실제 가상화 padding/scroll 여유 보장. 고정 카드 높이 가정으로 텍스트를 자르지 않고 측정/키보드/드래그/스크롤 유지.
- 관련 meaningful input 슬롯/긴 adornment/clear/focus, 버튼 pending, 가상화 끝 카드 접근 회귀 검증. 기존 tests/lint/typecheck/format 통과. Next 설치 docs 먼저 읽기.
- 실제 prompt/output/review/commands/results/decisions/issues 기록 및 task handoff 갱신 후 커밋. main에는 통합 담당만 병합.
