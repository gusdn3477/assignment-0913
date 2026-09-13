# dnd-kit-migration

## 요청/소유권

사용자: DnD 직접 구현 코드가 늘어 @dnd-kit 등을 고려하는 방향으로 구현. 최신 공식 @dnd-kit/react 우선 검토 후 적합한 API로 실제 전환.
독립 codex/dnd-kit-migration/.worktrees/dnd-kit-migration. 소유: candidate-board/**, candidate-card/**, hooks/use-candidate-drag.ts 및 새 DnD 전용 파일, candidates-app.test.tsx, 이 task/record. candidates-app.tsx, 상세, 공통 buttons/guard, 최상위 문서/package/lock은 수정 금지. 패키지는 통합 담당 설치.

## 계약

- native dataTransfer/token/setDragImage/수동 edge scrolling 제거, 라이브러리 sensor/collision/feedback/autoscroll 사용. 줄수만 숨기지 말고 실제 책임/코드 감소 기록.
- 단계 간 이동만. 기존 mutation 호출/동일 카드 잠금/다른 카드 병렬/rollback/Undo/메뉴/가상화 focus 유지. source drag 동안 원본 보존.
- source 삭제/단계 변경/필터 변경/pending 시작 등 stale drag는 거부하고 재등장해도 오래된 세션 활성화하지 않기. outside/same-stage/cancel/duplicate end는 저장하지 않음.
- 전용 handle 유지, keyboard 및 touch 센서는 적합한 라이브러리 기본으로 지원하거나 기존 메뉴 보장. 자동 announcement 한국어/접근성 유지. 불필요한 sortable/reorder 없음.
- 기존 native 이벤트 tests를 실제 library sensor/behavior 검증으로 바꾸고 실제 mutation app integration도 수정. 라이브러리 전체를 mock한 테스트만 남기지 않음. 의미 있는 실패/취소/격리/가상화 회귀 보존.
- installed Next docs/공식 DnD docs 읽기. lint/typecheck/tests/format 후 실제 record/task handoff 갱신 및 commit. 접두사/scope 영어, 설명 한글. main은 통합 담당.

## 인계

- 구현 완료: @dnd-kit/react/dom 0.5.0 provider+hooks, 기본 sensors/collision/clone/autoscroll, 한국어 안내, domain stale session만 유지.
- native token/drag image/manual scrolling 삭제. 기존 same-card exclusion/다른 카드 병렬/rollback/Undo/가상화 포커스 유지.
- src/test/setup.ts ResizeObserver shim 소유권을 통합 담당이 추가 승인. 그 외 공통/최상위/package 파일 변경 없음.
- 소유 파일 eslint/tsc/prettier 통과. 실제 sensor 기반 DnD11/app14 통과. 전체 검사 결과 record 참조.
- 통합 담당이 production webpack build와 실제 pointer browser 검증 수행 중. package/lock 및 main 병합은 통합 담당.
