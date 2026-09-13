# search-bar-fixed-icons

## 실제 요청
“SearchBar도 left right 없애고 돋보기, closebutton 배치해줘.”

## 결과/리뷰
SearchBarProps에서 left/right를 Omit하고 구조분해/외부 슬롯 합성을 제거. 내부 Input의 left에는 Search 아이콘, right에는 기존 조건(onClear와 비어 있지 않은 value)의 CloseButton을 고정 배치. native onChange/ref/type/search X 억제와 disabled/readOnly/지우기 후 focus 복귀 유지. 범용 Input의 슬롯 계약은 변경하지 않음. 타입 밖 런타임 spread에도 고정 left/right가 뒤에서 적용되어 외부 덮어쓰기를 막음.

## 검증
- prettier 변경2파일, eslint ., tsc --noEmit, git diff --check 통과.
- vitest run SearchBar6/app14: 관련2 files20 tests 통과. 돋보기/CloseButton 위치/키보드/폼/native change/clear 조건/disabled/readOnly/ref 및 검색 통합 회귀 포함.
- 슬롯 override 전용 테스트는 고정 아이콘과 기본 native props 검증으로 정정.

## 인계
codex/search-bar-fixed-icons / .worktrees/search-bar-fixed-icons. 신규 의존성/미해결 기능 이슈 없음. 통합 build/browser 후 기록 추가.
