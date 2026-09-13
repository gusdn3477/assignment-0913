# search-bar-defaults

## 사용자 정정
SearchBar는 Input left의 돋보기와 right의 CloseButton을 직접 래핑하여 사용처가 최소 props만 전달해야 한다. 기존 외부 clearButton/onClear 조립이 의도에 맞지 않았음.

## 소유권/계약
- 독립 codex/search-bar-defaults / .worktrees/search-bar-defaults.
- 소유 SearchBar 구현/테스트, CandidateToolbar 및 useCandidateSearch, 필요 관련 tests, task/record. 공통 Input은 기본 슬롯 API 유지. root는 README/최상위 문서/통합 담당.
- SearchBar controlled API: value:string + onValueChange(value:string). native input props/ref 전달, native onChange 관찰은 실제 타이핑에만 전달 가능. clear는 onValueChange("") 한 번 호출하며 가짜 ChangeEvent 생성 금지.
- Input left 기본 Search 아이콘, right 실제 공통 CloseButton 조합. clearButton 설정은 사용처에서 제거. 값 없거나 disabled/readOnly면 지우기 액션 숨김. 검색 지우기 기본 접근성 이름, type=button/키보드 지우기/입력 focus 복귀, native 중복 검색 X 숨김.
- 기본 h10/슬롯 wrapper 스타일을 SearchBar가 소유하여 toolbar 반복 props 제거. left/right 확장 가능하되 추가 right와 기본 close 공존. 검색 상태와 무관한 후보 전용 maxLength/placeholder 등만 외부 지정.
- useCandidateSearch는 소비하지 않는 onChange/clear 제거, value/setValue 중심. toolbar는 state props+도메인별 필수 설정만 전달. label 접근성 유지.
- 기존 공통 Input clearButton은 다른 일반 Input 사용 계약이므로 이 변경에서 무리하게 제거하지 않음.
- 실제 제어 입력/ref/native form/기본 icon+close/disabled/readOnly/빈값/slot override를 의미 있는 tests로 검증. 기존 후보 clear+job 유지+persistence 회귀 유지.
- Next 설치 docs 읽기, lint/typecheck/format 및 전체 tests. 한글 커밋 후 인계. 통합 build/browser.

## 최신 사용자 정정 (이전 충돌 계약보다 우선)
사용자: “props 이름은 일반 element 요소와 최대한 비슷하게 해 SearchBar의 경우도 onChange로 하고 onClear 넘겨주면 x버튼 보이는 방식으로 구현”.
- onValueChange 제거. native input onChange/event/value/defaultValue/ref를 그대로 지원하고 onClear?:()=>void만 추가.
- 최종 추가 정정: “onClear가 있고, value.length > 0일때로 변경”. X는 onClear와 명시 value가 있고 String(value).length > 0일 때 표시. disabled/readOnly이면 버튼 비활성화. defaultValue만 있는 native uncontrolled 입력은 지원하되 X 표시용 내부 상태는 추가하지 않음.
- clear 클릭은 onClear 한 번 후 focus 복원. native onChange를 만들어 호출하지 않음.
- toolbar는 onChange/onClear 직접 전달하고 clearButton 설정 객체/기본 스타일 반복 제거. hook은 실제 소비 value/onChange/clear 반환.
- 앞선 value/onValueChange API는 유지하지 않음. native controlled/uncontrolled, optional clear 및 빈값 숨김, disabled/readOnly, 키보드/form/ref, slot 조합으로 검증.

## 기능 인계
- 구현 완료: native onChange 전달, optional onClear가 right 공통 CloseButton 표시를 결정. left 돋보기/기본 스타일/focus는 SearchBar 내부. value/defaultValue/ref와 좌우 추가 슬롯 유지.
- toolbar clearButton 객체와 스타일 제거, hook 미사용 setValue 반환 제거. 최종 추가 정정에 따라 빈값에서 X를 숨기도록 app clear assertion 복원.
- 전체13 files113 tests, lint/typecheck/format/diff check 통과. 신규 의존성/미해결 기능 이슈 없음. production build/browser는 통합 담당.
- 구현 커밋만 main에 cherry-pick하며, 이 브랜치의 scope 동기화589cf4d는 main4cb60a6과 동일 목적이므로 별도 통합하지 않음.
- 최종 value 조건 correction: 관련20/20 tests, tsc/eslint/format 통과. onClear가 있어도 명시 value가 없거나 빈 문자열이면 X를 렌더하지 않음.
