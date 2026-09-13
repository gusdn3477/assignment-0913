# Undo 구현 기록

## 실제 요청 / 배정
- 사용자: “후속 작업 이어서 작업하자.”
- 선택 답변: “Undo: 저장된 단계 이동 되돌리기 (추천)”
- 통합 담당 배정: “Implement Undo in fresh assigned worktree .../[기능 작업 공간] branch [기능 브랜치]. Read AGENTS/PLAN/STATUS/DECISIONS and docs/tasks/undo.md first ... Own src/features/candidates changes/tests and task + docs/records/undo.md ... Implement card-scoped last-successful-move Undo through existing mutation/locking, failure preserves history, stale history guard, accessible menu action and virtualization focus retention. Validate meaningful tests lint typecheck format; commit feature and send SHA/handoff.”
- 후속 리뷰 기준: history 참조/콜백 안정성 유지, 실행 시점 stale guard, 실패한 일반 이동의 기존 이력 보존, hook 인스턴스 간 동일 카드 잠금 공유.

## 산출물 / 결정
- QueryClient별 WeakMap의 기존 동기 잠금 저장소에 메모리 이력 Map을 함께 관리합니다. 카드 가상화/unmount에 영향받지 않고 새 QueryClient/페이지 로드에서는 비어 있습니다. Zustand/localStorage에 이력을 저장하지 않습니다.
- 일반 이동 성공만 이전 단계/저장된 단계를 기록하고 다음 성공 이동이 교체합니다. Undo는 동일 mutation/API를 이용하며 성공 시 소비합니다. 이동/Undo 실패는 카드만 롤백하고 이력은 보존합니다.
- Undo와 일반 이동이 같은 잠금을 사용합니다. 다른 카드 저장은 병렬 가능하고 이전 조회 취소 및 성공 후 저장이라는 기존 동작을 유지합니다.
- UI와 실행 시점 모두 현재 캐시 단계가 기록의 저장 단계와 일치하는지 확인합니다. 실행 시 stale/missing 카드 이력은 제거하고 API를 호출하지 않습니다.
- 카드 메뉴의 “서류검토로 되돌리기”처럼 목적 단계를 표시합니다. 기존 메뉴 키보드/저장 중 비활성화/가상화 포커스 복원 흐름을 공유합니다. 실패는 되돌리기 전용 안전한 한국어 메시지 한 번으로 전달합니다.
- 새 의존성 없음. 긴급한 잠금/저장/되돌리기를 transition에 넣지 않고 기존 검색 useDeferredValue 및 retry useTransition 계약을 유지합니다. history와 함수 참조를 안정적으로 유지하여 DeferredBoard memo를 보존합니다.
- 설치된 Next `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`를 읽고 클라이언트 경계를 유지했습니다.

## 검증 명령 / 실제 결과
- root node_modules를 워크트리에 symlink(ignored)하여 기존 설치를 공유했습니다.
- 첫 일반 `pnpm exec prettier ...` / `pnpm typecheck`: pnpm 자동 의존성 검사로 install을 시도하고 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`로 중단했습니다. 의존성 변경 없이 통합 담당이 제시한 `--config.verify-deps-before-run=false`를 후속 명령에 적용했습니다.
- `node_modules/.bin/prettier --write`(변경 3개 파일), `node_modules/.bin/tsc --noEmit`: 통과.
- `pnpm --config.verify-deps-before-run=false test src/features/candidates/queries.test.tsx`: 20/20 통과.
- `pnpm --config.verify-deps-before-run=false test src/features/candidates/candidates-app.test.tsx src/features/candidates/virtualization.test.tsx`: 19/19 통과.
- `pnpm --config.verify-deps-before-run=false test`: 6 files, **73/73 tests 통과** (기존 62 + Undo 11).
- `pnpm --config.verify-deps-before-run=false lint && pnpm --config.verify-deps-before-run=false typecheck && pnpm --config.verify-deps-before-run=false format:check`: ESLint, TypeScript strict, Prettier 모두 통과.
- 통합 담당 코드/신규 hook/UI/화면 밖 테스트 리뷰: “no blocking findings.”

## 검증 내용 / 리뷰
- 성공 전 이력 없음, 후속 성공 이력 교체, 한 번 Undo 후 소비 및 redo 없음.
- 일반 이동 실패/Undo 실패에 이력 보존, 낙관적 Undo 후 롤백 및 재시도 성공.
- hook 두 인스턴스에서 undo-first/move-first 동기 중복 방어.
- 카드 두 개 병렬 Undo의 성공/실패 완료 순서 두 가지에서 카드 데이터·이력 격리.
- 캐시 단계 불일치/카드 제거 시 action-time guard, 새 클라이언트 이력 격리 및 remount 유지.
- 실제 앱에서 키보드 End/Enter Undo, 영향받는 카드만 pending, 실패·재시도·성공 소비와 상세 버튼 포커스.
- 1,000명 가상 컬럼의 화면 밖 Undo 목적 카드 마운트/포커스, stale menu 숨김.

## 남은 작업 / 한계
- 통합 담당 production build, 브라우저 영속 저장/키보드/오류 경로 검증 및 top-level 기록 통합.
- 승인 범위대로 카드별 한 단계 Undo이며 새로고침 후 이력 유지, redo, DnD, 다중 탭 동기화는 구현하지 않습니다.
