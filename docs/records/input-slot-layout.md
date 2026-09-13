# input-slot-layout

## 실제 요청
“if (!hasSlots) return input; 이거 변경 가능하면 변경해줘 slot 있든 없든 우선 UI는 같게. 다만 slot 있으면 좌측 혹은 우측 여백 생기고 거기에 아이콘 들어오는 구조 가능한가”

## 결과/리뷰
- hasSlots 및 조기 반환, 분기별 input 스타일 제거. 항상 동일 wrapper/input 구조.
- 외곽 border/background/focus/invalid/disabled는 wrapper, input은 native props/ref 및 텍스트 스타일만 담당. 클래스 계약(className=input, wrapperClassName=외곽) 유지.
- 좌/우 슬롯은 전달된 경우에만 DOM에 추가. flex의 실제 슬롯 너비와 gap으로 공간 확보, 없는 쪽은 기본 패딩만 유지.
- 동적 슬롯 변경에도 동일 input 노드/값/선택범위/focus/ref 보존하도록 기존 테스트 강화. SearchBar left=null 검사는 wrapper 없음 대신 left 슬롯 없음으로 변경.

## 검증
- prettier 변경3파일, eslint ., tsc --noEmit, git diff --check 통과.
- vitest run Input6/SearchBar6/app14: 3 files26 tests 통과. 슬롯 추가/제거 시 DOM identity/비제어 입력값/selection/focus, native 제약/폼/검색/지우기 검증.
- 임시 실제 Input 비교 route(커밋 제외)로 슬롯 없음/왼쪽/오른쪽/양쪽 브라우저 확인. 네 조합 모두448×38px, 1px border, radius8px, 투명 배경 동일. 슬롯 없는 쪽 input offset13px, 슬롯 있는 쪽37px(기본13+아이콘16+gap8) 확인. screenshot으로 아이콘과 텍스트 배치 검토. console error/warn [].
- 첫 browser navigation은 dev 최초18.2초 컴파일 중 timeout, 이후 정상 로딩으로 확인. 임시 route/탭/서버 정리.

## 인계
[기능 브랜치] / [기능 작업 공간]. 의존성 추가 없음. 미해결 기능 이슈 없음. 통합 build 후 기록 추가.

## 통합 build 완료
기능13ab27a / main e39199c. main build는 다른 실행 중 build 잠금으로 중단. src/package/lock/Next/TS config의 main 대비 diff가 없음을 확인한 워크트리에서 production build 수행. 첫 시도는 삭제한 임시 비교 route의 .next/dev/types 잔여 참조로 typecheck 실패. 해당 생성 캐시만 제거하고 next build --webpack 재실행 성공. 최종 route는 / 및 /_not-found만 존재. 작업트리 clean 및 main 코드 동일 재확인. 실제 UI는 동일 코드의 임시 dev 비교 화면으로 검증했으며 production UI를 별도로 검증한 것으로 집계하지 않는다. 미해결 이슈 없음.
