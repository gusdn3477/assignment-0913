# DnD 라이브러리 전환 기록

## 실제 요청

사용자: “dnd의 경우 구현 코드가 너무 늘어난다고 판단되어 @dnd-kit 등을 고려하는 방향으로 구현”. 커밋은 접두사/scope 영어, 설명 한글.
통합 배정: 독립 `codex/dnd-kit-migration` 워크트리에서 board/card/DnD hook/tests 소유, 기존 mutation/Undo/가상화/잠금 계약 유지. 패키지 설치와 main build/browser는 통합 담당.

## 산출물과 검토

- 최신 `@dnd-kit/react` 0.5.0 DragDropProvider/useDraggable/useDroppable로 전환. 한국어 Accessibility와 Feedback 설정을 위해 `@dnd-kit/dom` 0.5.0도 직접 의존성으로 요청, 통합 담당 설치 완료.
- native DataTransfer/token/setDragImage/수동 가장자리 scroll 제거. 기본 Pointer/Keyboard sensors, collision, clone feedback, autoscroller 사용. sortable/컬럼 내부 reorder 없음.
- hook에는 도메인 세션만 유지. source 삭제/단계/필터/pending 변경 시 영구 무효화, end에서 세션 먼저 소비 후 기존 mutation 호출. 외부/동일 단계/취소/반복 end는 저장 없음.
- 전용 handle button, pending disabled 및 touch-none. 기존 Tab 순회/키보드 메뉴 계약 보존을 위해 handle tabIndex=-1 유지. 키보드 메뉴는 발견 가능한 기본 경로이며 handle에 초점이 있을 때 라이브러리 Space/방향키/Escape도 작동.
- clone 및 기존 dragId pinning으로 가상화 source 유지. mutation과 rollback/Undo focus 경로 변경 없음.
- 라이브러리 PluginRegistry는 constructor로 deduplicate하고 나중 descriptor options를 적용함을 설치 소스로 검토. defaults + configure는 중복 plugin instance를 만들지 않음.

## 실제 코드 감소

동일 prettier 기준 변경 전 `use-candidate-drag.ts` 144 + board 260 + card 201 = 605행. 변경 후 60 + 302 + 203 = 565행. DnD hook 84행 감소, 세 production 파일 합계 40행 감소. 별도 테스트 helper는 이 수치에 포함하지 않음. 이벤트 처리를 다른 사용자 소스 파일로 숨기지 않고 sensor/feedback/autoscroll 책임을 라이브러리로 이전.

## 참고 문서

- 설치 Next `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` 읽음. 브라우저 상호작용은 기존 client board 안에 유지.
- https://dndkit.com/react/hooks/use-draggable/ : handleRef 및 disabled 계약.
- https://dndkit.com/react/components/drag-drop-provider/ : provider events/plugins 설정.
- 설치 `@dnd-kit/react/index.d.ts`, `@dnd-kit/dom/index.d.ts` 및 구현, abstract PluginRegistry 검토.

## 검증 과정

- 기존 native-event/token 위조 tests를 실제 library keyboard sensor와 collision 기반 tests로 교체. 공급자 전체 mock 없음. 실제 app mutation 테스트도 sensor를 통해 이동.
- JSDOM에는 ResizeObserver가 없어 공통 test setup에 최소 no-op shim 추가(통합 소유권 승인). DnD 한정 helper에 viewport/rect/IntersectionObserver/animation/matchMedia/elementFromPoint 구현. JSDOM이 파싱하지 못하는 library @layer 안 popover reset만 test stylesheet에서 제외하며 나머지 CSS와 실제 feedback 유지. 브라우저 rendering을 대신 검증했다고 주장하지 않음.
- 초기 fixture 실패: board rect가 240px여서 다른 컬럼이 clipping 처리됨. board ancestor rect=1600으로 수정. Outside 이동은 각 sensor key를 async act로 반영 후 종료해야 함을 확인. 실패를 provider mock으로 우회하지 않음.
- targeted board DnD11 + app14 = 25 tests 통과. 동일 단계/외부/end 반복/Escape/목적지 진입 뒤 밖으로 이동, stale4종, pending 격리, 1000-card source pinning, 실제 실패 rollback/다른 카드 성공/Undo 검증.
- direct `node_modules/.bin/eslint` 소유 파일, `node_modules/.bin/tsc --noEmit` 통과. 워크트리 node_modules는 통합 root를 공유해 pnpm 워크트리 manifest validation 대신 direct binary 사용.
- 전체 검사 결과와 최종 인계는 아래에 추가.

## 최종 검사와 한계

- 전체 `vitest run --maxWorkers=1` 1차: 105/106. real app drag 시작 timing 1건 실패, 단독 app14 통과. 다음 드래그 시작 전에 library feedback 종료를 기다리는 fixture 보완.
- 전체 2차: DnD/app 포함 105/106. 기존 1000-card 전체 Tab 순회만 20초 timeout. 같은 테스트는 전체1차 18.7초 통과했으며 동시 작업 머신 부하 영향을 기록. 테스트를 생략하거나 timeout 값을 늘리지 않음.
- 최종 소유 파일 eslint/tsc/prettier 통과. 전체 clean pass는 통합 담당의 단독 main verify에서 다시 확인.
- 통합 담당 browser 전달 결과: production webpack build 통과, 실제 pointer 단계 이동/저장 중 잠금/포커스/outside drop 취소 확인. Undo 및 첫 복구 저장은 mock random failure로 rollback, 재시도 저장 성공으로 원래 review 복구. 250명 초기화, console 빈 배열, 임시 탭/서버 종료. 기능 세션이 직접 browser 실행했다고 집계하지 않음.
- 기존 virtualization 단독 재확인: 7/7 통과(전체 Tab 8.4초, suite 9.8초). 동일 테스트의 부하 의존 timeout임을 확인했으며 코드/timeout 변경 없음.
