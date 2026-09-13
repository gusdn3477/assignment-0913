# 세션 인계 / 현재 상태

## 현재 결론
필수 기능, concurrent-feedback, virtualization, Undo 및 DnD 완료. 사용자 후속 승인으로 **재사용 UI와 지원자 폴더·Query·훅 구조 정리 진행 중**. 기존 기준은 `81e7a91`이며 새 독립 세션 `reusable-ui`, `candidate-structure`를 통합 담당이 관리합니다.

## 최종 요구사항 재감사 (2026-09-13)
- 초기 커밋 `12ed483`의 PLAN과 현재 승인 범위, 구현·테스트·기능별 기록을 대조했습니다. 필수 기능의 누락이나 승인 범위 위반을 발견하지 못했습니다.
- 기준 코드 `2878f98`에서 `pnpm format:check && pnpm verify` 재실행: 포맷/lint/strict typecheck/**7 files, 87/87 tests**/production build 모두 통과.
- 이번에는 코드 검토와 자동 검사를 재수행했습니다. 실제 브라우저 검증은 동일 코드의 기존 production 기록을 검토했으며 새로 수행한 것으로 집계하지 않습니다.
- 초기 제외 범위와 과거 50 tests 기록을 현재 상태로 오해하지 않도록 문서 제목/설명을 정리했습니다. 코드 변경 없음. 상세: `docs/records/final-audit.md`.

## 최신 DnD 검증 (2026-09-13)
- 기능 `ca7687a`, main 통합 `d4ea5f8`. 브랜치 `codex/dnd`, 워크트리 `.worktrees/dnd`.
- 전용 손잡이로 단계 간 native 드래그, 목적지 강조, 가장자리 가로 스크롤, 원본 가상화 보존. 기존 메뉴/잠금/롤백/Undo 경로 재사용.
- main `pnpm format:check && pnpm verify`: 포맷/lint/strict typecheck/**87/87 tests**/production build 통과.
- 실제 브라우저 드래그 성공·실패 롤백·재시도, 키보드 Undo/포커스, reload 후 저장 유지, 390px 메뉴 확인. console error/warn 없음.
- 테스트 카드는 원래 단계로 복구하고 검색 초기화, 서버 종료/viewport 초기화. 종료된 개발 오류 탭은 도구 URL 정책으로 닫기가 차단되어 턴 종료 자동 정리 대상.
- 상세: `docs/records/dnd.md`, `docs/records/dnd-integration.md`. 아래 수치는 각 기능 완료 당시 기록입니다.

## 최신 Undo 검증 (2026-09-13)
- 기능 `a3c8274`, main 통합 `57cbfa0`. 브랜치 `codex/undo`, 워크트리 `.worktrees/undo`.
- 카드별 마지막 성공 이동 한 번 되돌리기, 실패 시 롤백·이력 보존·재시도. 같은 카드 잠금과 다른 카드 병렬 유지. 이력은 페이지 새로고침 시 초기화.
- main `pnpm format:check && pnpm verify`: 포맷/lint/strict typecheck/**73/73 tests**/production build 통과.
- production 브라우저: 키보드 Undo·포커스 복귀·성공 이력 소모·되돌린 단계의 reload 후 유지, 390px 메뉴와 Undo 확인. 일반 이동 실패도 실제 발생하여 롤백/재시도 확인. console error/warn 없음.
- 테스트한 카드는 원래 단계로 되돌렸고 검색 초기화로 250명 복구. 임시 탭/서버 및 viewport override 정리 완료.
- 상세: `docs/records/undo.md`, `docs/records/undo-integration.md`. 아래 이전 검증 수치는 각 기능 완료 당시의 기록입니다.

## 최신 가상화 검증 (2026-09-13)
- 기능 `2c0a912`, main 통합 `da3da3f`. 브랜치 `codex/virtualization`, 워크트리 `.worktrees/virtualization`.
- TanStack Virtual 컬럼별 가상화, 전체 Tab/Shift+Tab 탐색, 상세·메뉴·단계 이동·롤백 포커스 보존, 검색/직무 변경 스크롤 초기화. 기본 250명 유지.
- main `pnpm format:check && pnpm verify`: 포맷/lint/strict typecheck/**62/62 tests**/production build 통과.
- production 1,000명 초기 카드 DOM 30개, 끝 스크롤/검색 축소/키보드 경계/화면 밖 이동/저장 영속성/오류 재시도/빈 상태 확인. 390px document/350px board, console error/warn 없음.
- QA 데이터 250명 원복, 임시 파일/탭/검증 서버 정리 완료.
- 상세: `docs/records/virtualization.md`, `docs/records/virtualization-integration.md`. 아래 50 tests는 이전 필수 기능 완료 시점의 기록입니다.

## 새 세션 시작 순서
1. `AGENTS.md` → `PLAN.md` → 이 문서 → `DECISIONS.md`를 읽습니다.
2. `git status`와 최신 main을 확인합니다. 완료한 과거 기능 브랜치에서 그대로 재개하지 않습니다.
3. 새 요청이 있으면 기능 단위를 정의하고 최신 main에서 새 `codex/<feature>` 브랜치·워크트리·독립 세션을 만듭니다.
4. 기능별 계약은 `docs/tasks`, 실제 프롬프트·검증은 `PROMPTS.md`와 `docs/records`에서 확인합니다.

## 완료된 세션
| 기능 | 브랜치 | 기능 커밋 | 최종 상태 |
|---|---|---|---|
| mock-api | codex/mock-api | 540d933 | 지연/실패/저장/검증, 17 tests |
| board-ui | codex/board-ui | 67b4202, 83422ff | 보드/메뉴/키보드, 8 tests |
| explorer | codex/explorer | 57ca2e9 | Zustand/검색/필터/상세, 9 tests |
| optimistic-update | codex/optimistic-update | 63a3abe | Query/카드별 롤백/잠금, 11 tests |
| board-focus-fix | codex/board-focus-fix | 1d41614 | 메뉴 종료 후 포커스 검증 보강 |
| acceptance-tests | codex/acceptance-tests | a0755c8 | 실제 통합 UI 상태, 5 tests |
| concurrent-feedback | codex/concurrent-feedback | 4ceb4f7 | 동시 렌더링·재시도·갱신 피드백, app 11 tests / 전체 56 tests |
| virtualization | codex/virtualization | 2c0a912 | 1,000건 가상화/키보드/포커스, 전체 62 tests |
| undo | codex/undo | a3c8274 | 카드별 성공 이동 되돌리기/실패 재시도, 전체 73 tests |
| dnd | codex/dnd | ca7687a | 단계 간 드래그/취소·stale 방어/가상화 유지, 전체 87 tests |

## 초기 필수 기능 완료 당시 검증 (후속 기능 추가 전)
- `pnpm format:check`: 통과.
- `pnpm verify`: lint → TypeScript strict → 50 tests → production build 전체 통과.
- `next start --port 3101`: 빌드 결과 실행, 250명 렌더/검색/상세/초기화 확인. error/warn 없음. 검증 서버는 종료했습니다.
- 브라우저: 검색·복합 필터·빈 검색·키보드 상세·포커스 복귀·저장중·새로고침 유지·실제 조회 실패 재시도·저장 실패 롤백·모바일390 확인.
- 통합 중 테스트 timeout은 nwsapi@2.2.27 선택자 재진입으로 확인, `jsdom>nwsapi:2.2.23` 고정 후 50/50 통과. 실패/진단 이력은 기록에 남겼습니다.
- Turbopack production CSS 내부 포트 오류 때문에 build는 공식 `--webpack` 옵션을 사용합니다.

## 실행과 다음 작업
2026-09-13 선택사항 가상화·Undo·DnD까지 구현했습니다. 새 세션은 main에서 시작하고, 완료된 기능 세션을 다른 기능에 재사용하지 않습니다.

개발 미리보기는 `pnpm dev --port 3100`으로 실행합니다. 기본 실행은 `pnpm install` → `pnpm dev`입니다. 이번 production 검증 서버는 종료했습니다.

필수 미완료와 알려진 결함은 없습니다. 기존 선택사항은 모두 구현했습니다. 새로운 기능은 별도 범위를 정해 시작합니다. 로그인·실제 백엔드·다중 탭 동기화·공개 저장소 생성/푸시/배포는 승인 범위 밖입니다.
