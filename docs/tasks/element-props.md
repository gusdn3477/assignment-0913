# element-props

## 요청
props 이름이 기본 element 이벤트 핸들러와 유사한지 점검하고 필요하면 수정(pending→loading, onValueChange→onChange).

## 소유/계약
codex/element-props / .worktrees/element-props. ui/select.tsx, toolbar 사용처, 이 task/record 소유.
Input/SearchBar/native Button props 전달과 loading 명칭 확인. Select 공개 onChange(string)를 Radix onValueChange에 연결하고 기존 prop을 공개 타입에서 제외. native DOM 이벤트를 만들어내지 않는다. onClear/onUndo/onMove 등 별도 도메인 동작, Radix open/focus lifecycle, Query mutation 콜백은 의미 유지. 제어/비제어와 keyboard/filter/reset/persist 계약 보존.

## 완료 인계
공개 SelectProps에서 onValueChange 제외, onChange(string)로 연결. Toolbar 실제 호출 갱신. Input/SearchBar onChange와 native props/ref, Button onClick/loading, Header native props 정상 확인. 의미별 도메인 액션과 라이브러리 lifecycle 콜백은 유지. lint/typecheck/관련23 tests/format/diff-check 통과. 미해결 기능 이슈 없음.
