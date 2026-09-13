# SearchBar 기본 조합 정정

## 실제 요청
사용자: “SearchBar 이거 left에 돋보기 right에 closeButton을 래핑하자는 거였어 사용하는 쪽에서 최소한의 props만 넣어도 되게 SearchBar는 당연하거잖아”.
후속 정정: “props 이름은 일반 element 요소와 최대한 비슷하게 해 SearchBar의 경우도 onChange로 하고 onClear 넘겨주면 x버튼 보이는 방식으로 구현”.

## 작업과 결과
- 독립 codex/search-bar-defaults / .worktrees/search-bar-defaults에서 수행. AGENTS/PLAN/STATUS/DECISIONS/task 및 설치된 Next `use-client.md` 확인.
- SearchBar가 Input left Search, right 공통 CloseButton과 기본 높이/배경, clear 후 입력 focus 복원을 소유. 사용처의 clearButton 객체와 기본 스타일 제거.
- native input props/onChange/value/defaultValue/ref 전달, onClear만 선택 추가. controlled 강제 및 내부 검색 상태 없음. X는 onClear가 있으면 빈값에도 표시하고 disabled/readOnly에서는 비활성화.
- clear는 부모 onClear를 한 번 호출하고 focus만 복구. 가짜 change event나 직접 DOM 값 변경 없음. additional right 슬롯과 close 공존, left 교체/제거 지원. 브라우저 기본 search cancel UI 중복 숨김.
- useCandidateSearch는 소비하는 value/onChange/clear만 반환.

## 검토와 수정 이력
- 최초 value/onValueChange 설계의 focused19 tests 및 lint/typecheck는 통과했으나 사용자 최신 정정에 따라 폐기. 해당 전체 테스트 실행은 중단했고 완료 검증으로 집계하지 않음.
- 최신 native 계약 최초 전체 테스트는 112/113: 기존 앱 테스트가 빈값에서 X가 사라짐을 기대해 실패. 최신 onClear 표시 계약에 맞춰 해당 assertion을 enabled 유지로 수정. 직무 보존/persist/no-refetch/focus assertion은 유지.
- 최종 SearchBar6 tests는 controlled native input event, Enter/Space clear와 focus/submit, optional onClear/빈값, disabled/readOnly, uncontrolled defaultValue/maxLength/refs, 좌우 확장 및 기본 아이콘을 검증.

## 검증
- 최종 전체 테스트 및 포맷/lint/typecheck 결과는 아래 인계에 기록.
- production build/browser는 통합 담당이 수행. 신규 의존성 없음.
- 최종 `node_modules/.bin/vitest run`: 13 files, 113/113 통과(68.14s). SearchBar6 + 기존 app14 포함.
- `node_modules/.bin/prettier --check src '*.ts' '*.mjs' '*.json'`, `tsc --noEmit`, `eslint .`, `git diff --check`: 모두 통과.
- 미해결 기능 이슈 없음. 전체 검사 중 source 동작 변경 없이 아이콘 버튼 textContent 단언을 정확한 빈 문자열 검사로 강화했고 해당 SearchBar6 테스트는 이후 수집/실행되어 통과.
