# board-ui 작업 기록

## 실제 받은 지시

> Implement ONE feature board-ui in worktree /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/board-ui branch codex/board-ui, start 12ed483. Read AGENTS.md PLAN.md STATUS.md docs/SESSION_GUIDE.md docs/tasks/board-ui.md. Build polished Korean hiring board, 5 stage columns/card/menu, callbacks only, accessible focus continuity, relevant tests. Shared shadcn installed and node_modules linked. IMPORTANT expose card detail button data-candidate-detail={id} for explorer focus return, move trigger data-candidate-move={id}. Ownership per task; no shared/app/package edits. Write actual received prompt & review/test evidence docs/records/board-ui.md; update task handoff; commit feat(board-ui). Do not spawn agents. Final path/branch/SHA/tests/issues.

## 구현·리뷰

CandidateBoard 계약 구현. 5단계·카운트·빈 컬럼 유지, 지원일 내림차순/id 오름차순. 흰 카드와 단계별 색상, 아바타·직무·지원일. 상세와 이동은 별도 버튼이며 중첩 없음. shadcn 메뉴는 현재단계와 pending 이동 차단. Query/persist는 부모 책임. memo 카드/메모된 그룹/안정적 이동 콜백. 카드 재마운트 시 상세 버튼 포커스 복원, 외부 검색 포커스 유지.

통합 리뷰 반영: 단계 h3, 컬럼 목록 독립 스크롤 max min(60vh,720px), 목록 탭 포커스와 이름 제공. 메뉴는 nonmodal로 카드 재배치 포커스와 modal trap 충돌 가능성을 줄임.

## 검증

- pnpm typecheck는 링크된 node_modules 자동 install 시도 중 ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY. 의존성 변경 없이 직접 바이너리 사용.
- node_modules/.bin/tsc --noEmit: 명시적 Record 초기화 수정 후 통과.
- node_modules/.bin/eslint src/features/candidates/board.tsx src/features/candidates/board.test.tsx: 통과.
- Vitest 보드 8개 중 6개 통과; 메뉴 user-event 2개 timeout(Node22/24, forks/threads). 상세 Enter/Tab 단독 150ms 통과.
- 메뉴 입력을 직접 keyDown으로 검증하도록 수정 후 현재단계 비활성/면접 콜백 테스트 통과. 이동·롤백 포커스 테스트 실행 지연은 통합 진단 필요.
- 임시 콘솔 로그와 act 전역 설정 제거. 중단한 작업 뒤 프로세스 목록으로 이전 테스트 worker 없음 확인.
- 통합 지시에 따라 공유 shadcn cn import를 로컬 @/lib/utils로 수정했지만 해당 공유 파일은 커밋 제외(통합에서 동일 변경 소유).

## 남은 사항

통합 전체 테스트와 실제 브라우저 키보드 메뉴·이동/롤백 포커스·스크롤 검증 필요. 공유 UI 로컬 변경과 node_modules 링크는 커밋 제외.
