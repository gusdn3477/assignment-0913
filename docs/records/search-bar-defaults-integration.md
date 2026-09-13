# SearchBar 기본 조합 정정 통합 기록

## 실제 사용자 요청
“SearchBar 이거 left에 돋보기 right에 closeButton을 래핑하자는 거였어 사용하는 쪽에서 최소한의 props만 넣어도 되게”.

기존 구현은 돋보기만 기본값으로 두고 clearButton/onClear를 소비처가 조립해 사용자 의도를 충분히 반영하지 못했음을 인정하고 정정.

## 배정/계약
- 시작 main7c42f0b clean. 범위5f01a99, 독립 [기능 브랜치]/[기능 작업 공간]. 기능 SearchBar/toolbar/search hook/tests/task/record, 통합 README/최상위 기록/리뷰/build/browser.
- 초기 제안(아래 최신 사용자 정정으로 대체): value/onValueChange로 입력/지우기 동작. SearchBar 내부 Input left Search/right CloseButton. 기존 Input 옵션 API는 유지. native props/ref/keyboard/form/focus와 후보 검색/직무/persist 유지.

## 검토/검증
- 최종 구현19e5d07을 main a8f2722로 cherry-pick. native onChange forwarding, onClear 콜백만 호출, Input right 실제 공통 CloseButton, native cancel 중복 숨김, controlled 강제 없음 확인.
- 기능 최종13 files113 tests 통과(68.14초), lint/typecheck/format 통과. 앱 기존 clear assertion만 최신 빈값에서도 X 표시 계약에 맞춰 변경; 직무/persist/no-refetch/focus 검증 유지.
- 별도 작업의 빈 결과 Guard/검색 외 transition 제거가 main에 함께 통합되어 최신 main pnpm format:check && pnpm verify 재검증. 해당 기능 source/문서 수정은 보존.

## 진행 중 사용자 정정
사용자: “props 이름은 일반 element 요소와 최대한 비슷하게 해 SearchBar의 경우도 onChange로 하고 onClear 넘겨주면 x버튼 보이는 방식으로 구현”.
- 진행 중 value/onValueChange 구현을 취소하고 native onChange/optional onClear 계약으로 수정 지시. native controlled/uncontrolled/value/defaultValue를 지원하고 X는 onClear 전달 여부로 표시. disabled/readOnly에서 비활성화. 사용처 clearButton 설정 객체는 제거.
- 이전 계약 테스트 통과 결과는 최종 구현 검증으로 집계하지 않음.

## 마지막 표시 조건 정정
- 이전 native 계약 main a8f2722에서 pnpm format:check && pnpm verify 전체113 tests(57.26초)/format/lint/typecheck/build 통과.
- 이후 사용자 “onClear가 있고, value.length > 0일때로 변경” 요청. 최종 X 표시 조건을 콜백 존재 + 명시 value의 길이>0으로 수정. 가짜 내부 입력 상태 없이 native props 유지, clear 후 버튼 숨김/focus 복귀. 이 correction은 관련 SearchBar/app 테스트와 build/browser로 검증.

- 최종 조건 correction e9c2baf를 main cc2c7f5로 반영. 기능 관련20tests/lint/tsc/format 통과. main에는 동시에 e07e5ff(Zustand/loading) 변경이 반영되어 관련 SearchBar/app20tests 및 build를 다시 실행. 최초 pnpm test -- 필터 호출은 -- 전달로 전체 suite가 시작되어 중단 후 direct vitest run에 경로를 지정해 바로잡음(해당 중단은 테스트 실패로 집계하지 않음).

- 최종 main 관련20tests 통과(6.58초) 및 production build 성공. production3103에서 빈 검색 X0개→검색 입력 후 left SVG/right 검색어 지우기 버튼 표시→Tab/Enter 지우기 후 value 빈 문자열/X제거/input focus/250명 복구 확인. console error/warn[]. 임시 탭/서버 종료. 미해결 SearchBar 이슈 없음.
