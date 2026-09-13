# board-focus-fix 작업 기록

## 실제 받은 지시

> Fix ONE feature defect board focus in [기능 작업 공간] branch [기능 브랜치] start a2dacf1. Read AGENTS PLAN STATUS docs/tasks/board-focus-fix and docs/records/board-ui. Board original agent reported 7/8 tests pass, test restores focus moved card/rollback hangs. Diagnose real issue (Radix lifecycle vs immediate layout focus?) preserve tests/no skipping/no longer timeout hiding. Own board.tsx, board.test.tsx, task and docs/records/board-focus-fix.md only. Direct node_modules/.bin tests to avoid pnpm reinstall. Check docs Next local if relevant. Root does real browser flows in parallel. Commit fix(board-focus) plus actual prompt/review/tests records. No subagents. Report SHA/evidence.

## 진단·수정·리뷰

- 원본 테스트를 Node 22.13.0에서 재현: 해당 테스트 5000ms timeout, 실제 보고 시간 19768ms. 임시 DOM 로그로 이동 직후 상세 버튼에 이미 포커스가 있음을 확인했습니다. 로그는 제거했습니다.
- `waitFor` 대신 일반 assertion으로 즉시 확인하면 이동과 롤백 모두 통과했습니다. 별도 `act` 내 실제 `setTimeout(0)` 대기를 넣으면 동일하게 timeout이 발생했습니다. 따라서 누락된 최초 포커스보다 실제 타이머를 기다리는 테스트 경로의 지연이 문제였습니다. 환경 내 지연의 하위 원인을 확정한 것은 아닙니다.
- 설치된 Radix `react-focus-scope` 소스를 읽고 unmount cleanup이 `setTimeout(0)`에서 `onUnmountAutoFocus`를 호출한다는 것을 확인했습니다. Next 로컬 accessibility guide도 읽었습니다.
- 메뉴 이동을 `onSelect`에서 `onCloseAutoFocus`로 지연하는 실험은 메뉴 콜백 검사까지 실패시켰습니다. 브라우저에서 결함이 재현되지 않은 점과 함께 검토하여 해당 프로덕션 변경은 전부 되돌렸습니다.
- 최종 수정은 기존 테스트에 한정합니다. fake timers를 켜고 키보드 메뉴 선택 후 메뉴 제거/예약 타이머 존재를 확인합니다. `act` 안에서 예약 타이머를 실제 실행한 후 이동 포커스를 검사하고, rollback 후에도 타이머를 실행하고 포커스를 검사합니다. 단순히 즉시 통과하거나 timeout을 늘리는 방식이 아닙니다. afterEach에서 실제 타이머를 복원합니다.
- 기존 8개 테스트와 기존 포커스 assertion을 유지했습니다. production board.tsx는 수정하지 않았습니다. 의존성 추가·설정 변경·테스트 skip 없음.
- 통합 담당자 전달 증거: 실제 브라우저에서 상세 Enter/Escape 복귀, 단계 이동 후 상세 버튼 포커스, reload 영속 저장, 다섯 번째 API 실패 후 rollback 포커스 유지 모두 통과. 이 브라우저 확인은 통합 담당자가 수행했습니다.
- 통합 담당자도 production 변경 불필요에 동의했고, acceptance test 담당자에게 타이머 제어 방법을 공유했습니다.

## 검증

- `node_modules/.bin/eslint src/features/candidates/board.tsx src/features/candidates/board.test.tsx`: 통과.
- `node_modules/.bin/tsc --noEmit`: 통과.
- Node24 직접 Vitest 실행으로 보드 전체 및 저장소 전체 검사 진행; 최종 결과 아래 기록.

## 남은 사항

실제 타이머 지연의 하위 환경 원인은 확정하지 않았습니다. 단위 테스트에서는 예약된 Radix 종료 동작을 명시적으로 실행하여 해당 지연에 의존하지 않습니다.

## 최종 결과

- Node24 `node node_modules/vitest/vitest.mjs run src/features/candidates/board.test.tsx --maxWorkers=1 --reporter=verbose`: **8/8 통과**, 86.41s. 이후 추가한 메뉴 제거/예약 타이머 존재 assertion도 해당 테스트 단독 검사에서 통과했습니다.
- Node24 `node node_modules/vitest/vitest.mjs run --maxWorkers=1 --reporter=verbose`: **44/45 통과**, 107.72s. focus regression은 통과했습니다. 기존 `renders 250 candidates with distinct controls`가 이 실행에서 5000ms timeout(보고 실행 13648ms)으로 실패했습니다. scoped 실행에서는 같은 테스트가 통과했습니다. timeout 변경 없이 통합 담당자에게 환경 지연 및 전체 재검증 필요를 보고했습니다.
- 최종 assertion 추가 후 대상 파일 ESLint 재검사 통과.
