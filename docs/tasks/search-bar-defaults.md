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
