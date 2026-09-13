# element-props

## 최종 사용자 정정
“Select는 원래 onValueChange인가? 그럼 유지해”. Radix 원본 이름임을 확인하고 앞서 추가한 Select onChange 변환과 Toolbar 변경을 원상 복원한다. 최종 소스는 작업 전과 동일하며 아래는 변경을 시도한 당시 기록이다.

## 실제 요청
“props 이름 기본적인 element 이벤트 핸들러와 유사한지 확인하고 안되어있으면 수정 (예를들어 pending -> loading, onValueChange -> onChange 등)”

## 점검/결과
- Button은 native button props 확장과 onClick, ActionButton 및 의미별 버튼은 loading 사용: 변경 불필요.
- Input/SearchBar는 native input props 및 onChange(event), ref/disabled/readOnly 유지: 변경 불필요.
- Header는 native header props 전달: 변경 불필요.
- Select에서 Radix onValueChange가 그대로 공개되어 있어 앱 공개 prop을 onChange로 변경. SelectProps는 원본 onValueChange를 Omit하고 onChange(value:string)를 정의. 내부 Radix 연결에만 원래 이름 사용, Toolbar 실제 호출 수정.
- Select는 DOM select가 아닌 복합 컨트롤이므로 선택한 문자열을 전달한다. 네이티브 이벤트를 인위적으로 만들거나 타입 단언하지 않음. value/defaultValue 및 나머지 root props는 그대로 전달.
- onClear/onUndo/onMove/onOpenDetail/onRetry/onRecover는 각각 지우기/도메인 액션/복구를 식별한다. 여러 컨트롤을 조합한 컴포넌트의 콜백을 onClick으로 바꾸면 대상이 모호하므로 유지.
- Radix onOpenChange/onOpenAutoFocus/onCloseAutoFocus 및 Query mutation lifecycle/DnD 콜백은 원본 라이브러리 의미/계약을 유지.

## 검증
- node_modules/.bin/prettier --write 변경2파일 완료.
- node_modules/.bin/eslint . 및 tsc --noEmit 통과.
- node_modules/.bin/vitest run explorer.test.tsx candidates-app.test.tsx(각 실제 경로 지정): 2 files23 tests 통과. 키보드 직무 선택/필터 조합/초기화/저장 복원/상세/조회 재시도/롤백 포함.
- git diff --check 통과. src/components의 onValueChange는 Select 내부 연결과 Omit만 존재, pending= 없음.

## 인계
codex/element-props / .worktrees/element-props. 추가 의존성/기능 이슈 없음. 통합 build/browser 추가 기록 예정.

## 정정 검증
Select 원본 onValueChange 복원 후 관련2파일 eslint, 전체 strict tsc --noEmit, explorer9 tests, diff-check 통과. git diff 2372527^ -- 두 소스 파일은 출력 없음으로 원래 코드 동일 확인. 앞서 실행한 build는 onChange 변환 중간본의 검사이며 최종 정정 검증으로 집계하지 않는다. 최종 소스 변경이 없어 추가 browser 검사는 생략한다. 미해결 이슈 없음.
