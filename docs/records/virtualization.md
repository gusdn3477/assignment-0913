# virtualization 작업 기록

## 실제 요청
사용자: “문서 보고 선택 작업도 이어서 진행(가상화 등)”

통합 배정: “Implement assigned virtualization feature in [기능 작업 공간] branch [기능 브랜치] only. Read AGENTS PLAN STATUS DECISIONS docs/tasks/virtualization.md first. Task file created uncommitted for you to own. Follow task requirements especially keyboard reachability, focus on offscreen moves/rollback/detail, filter scroll reset and 1000 items. Request dependencies from integration; do not change package/lock. Fresh independent feature session required by AGENTS. Implement and test, record actual prompt/commands and handoff, commit. I handle main scope docs and production/browser integration. No subdelegation needed.”

## 결과 / 선택
- 컬럼마다 TanStack Virtual `useVirtualizer`, stable candidate key, 실제 li 높이 측정, overscan 2. 별도 scroll 계산기를 자체 작성하지 않았습니다. 의존성 `@tanstack/react-virtual 3.14.12`는 통합 담당이 설치했습니다.
- 보드의 표시 결과를 바꾸지 않고 화면 부분만 mount합니다. 결과 개수/빈 상태/정렬은 기존 전체 데이터 기준이며 `aria-posinset`/`aria-setsize`도 전체 컬럼 기준입니다.
- 실제 모든 카드에 Tab/Shift+Tab으로 도달하도록 논리적 순서를 계산하여 필요한 카드만 mount 후 focus합니다. 마지막 카드는 외부에서 native Shift+Tab 진입을 보장하도록 유지합니다. 현재 focus 및 최근 focus request도 bounded pin하여 상세/메뉴가 scroll로 사라지지 않습니다.
- 단계 이동/롤백은 기존 board focus 판단을 유지하며 컬럼 handle에 요청합니다. 이미 처리한 요청은 unrelated update 때 다시 focus하지 않습니다. 검색 입력을 훔치지 않습니다.
- deferred search/job 조건을 resetKey로 전달하여 검색 결과 축소 시 scroll을 0으로 되돌립니다. 캐시/mutation 값은 지연시키지 않았으며 새로운 transition은 필요하지 않았습니다.
- Next 설치 guide `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`를 먼저 읽었습니다. API 참고: https://tanstack.com/virtual/latest/docs/api/virtualizer .
- 가상화 인스턴스는 mutable이므로 해당 컴포넌트에 `use no memo`를 선언하고 반환 API를 memo component에 전달하지 않습니다. 이 지점만 근거 주석으로 `react-hooks/incompatible-library` 경고를 제외했습니다.

## 리뷰와 수정
- 통합 리뷰: 처리한 request가 현재 focusId를 가리지 않도록 두 카드 pin; portal focus가 board focus state를 초기화하지 않도록 DOM contains 가드; 최종 카드 native Shift+Tab 접근 보존. 모두 반영.
- 통합 담당은 변경 소스 리뷰 완료 및 blocking finding 없음을 보고했습니다.
- 테스트는 라이브러리를 mock하지 않습니다. JSDOM의 실제 layout 부재를 보완하는 candidate-column/row 한정 geometry와 browser처럼 비동기 scroll event를 테스트 setup에 추가했습니다(통합 승인). 실제 픽셀 배치/viewport 스크롤은 integration browser 검증 대상입니다.

## 실행 / 실제 결과
작업 경로: `[기능 작업 공간]`, 브랜치 `[기능 브랜치]`.

- 일반 `pnpm exec prettier ...` 최초 실행: 공유 node_modules와 worktree package manifest 차이로 pnpm의 자동 install이 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` 실패. 공유 디렉터리를 재설치하지 않고 아래 명령에 `--config.verify-deps-before-run=false`를 사용했습니다.
- 최초 typecheck: range implicit any 수정. geometry mock scrollTo optional options type 수정.
- 최초 UI test: JSDOM height 0 때문에 가상 DOM 미생성 실패. 실제 virtualizer를 유지하면서 위 geometry 추가로 수정. 동기 scroll mock의 lifecycle flushSync 경고는 비동기 scroll event로 수정.
- `pnpm --config.verify-deps-before-run=false typecheck`: 통과.
- `pnpm --config.verify-deps-before-run=false lint`: 오류/경고 없이 통과.
- `pnpm --config.verify-deps-before-run=false test`: 6 files / 61 tests 통과 (portal menu 회귀 1개 추가 전).
- `pnpm --config.verify-deps-before-run=false format:check`: 통과.
- 신규 가상화 검증: 1,000명 DOM < 12 items, 깊은 스크롤 500번째/마지막 도달, 검색 1건 축소 및 scrollTop 0, 1,000명 모든 카드 2,000회 Tab 순회, Shift+Tab, 외부 역방향 진입, offscreen 이동/rollback/search focus, 이전 keyboard 요청 후 다른 카드 상세/scroll/닫기 focus. 추가 portal 메뉴/스크롤/닫기 trigger focus 검사.

## 남은 사항
production build와 실제 브라우저 검증은 통합 담당이 main에서 실행합니다. 기능 범위의 알려진 미해결 결함은 없습니다. Undo/DnD는 이 기능에 포함하지 않았습니다.

## 최종 리뷰 보강
- portal-menu 회귀 신규 테스트가 첫 실행에서 실패하여 추가 결함을 발견했습니다. Radix pointer open은 trigger focus를 생략할 수 있으므로 `onFocusCapture`의 DOM contains 가드만으로는 pointer로 연 카드가 pin되지 않았습니다.
- `onPointerDownCapture`에서도 클릭한 카드 ID를 보존하여 menu open 후 깊은 scroll에도 trigger가 유지되도록 수정했습니다. portal 내부 pointer/focus는 contains 가드로 무시합니다. Safari처럼 pointer click이 button focus를 만들지 않는 환경에도 적용되는 보강입니다.
- `vitest run src/features/candidates/virtualization.test.tsx -t portalled`: 해당 회귀 1개 통과, 나머지 5개는 targeted 실행으로 제외. 이어 최종 전체 suite를 실행했습니다.
- 최종 `pnpm --config.verify-deps-before-run=false typecheck`, `lint`, `format:check`: 모두 통과, lint 오류/경고 없음.
- 최종 `pnpm --config.verify-deps-before-run=false test`: **6 files / 62 tests 통과**, 전체 17.70s. 신규 6 tests 중 1,000카드 Tab 순회 10.31s. 실패·경고 없음.
- `git diff --check`: 통과.
