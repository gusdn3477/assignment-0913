# 프롬프트와 검증 기록

기능별 실제 지시, 출력 요지, 검증 결과와 판단을 기록합니다. 사용자 검증과 에이전트 검증을 구분하며 수행하지 않은 검증은 기록하지 않습니다.

## 재사용성과 구조 정리 — 추가 승인 (2026-09-13)
사용자 요청: “선택사항 추가” — Input clearButton 및 의미별 Button 래퍼, left/center/right Header, 필요시 세분화된 skeleton; 컴포넌트별 폴더와 상수·유틸·타입·훅·API·query key 분리; 가능한 useSuspenseQuery/queryOptions 적용; 입력 onChange 등의 간단한 훅 추상화(억지로 하지 않음).

독립 `reusable-ui` 및 `candidate-structure` 세션에 공통 UI와 도메인 구조를 각각 배정했습니다. 통합 기록은 [reusability-integration](docs/records/reusability-integration.md), 실제 기능별 지시는 [reusable-ui task](docs/tasks/reusable-ui.md), [candidate-structure task](docs/tasks/candidate-structure.md)를 참조합니다.

완료: 기능 `9f97bae`/`2bd8ad9`, 실제 사용처 연결 `4f36d6f`. 100 tests, 포맷/lint/typecheck/build 통과. production clear/닫기 포커스, 저장 복원, 390px 배치 확인. [UI 기능 원문](docs/records/reusable-ui.md), [구조 정리 원문](docs/records/candidate-structure.md). useSuspenseQuery는 기존 취소 계약 때문에 보류하고 queryOptions는 적용했습니다. 공통 ref 토글 결함은 검토 중 발견해 회귀 테스트로 보강했습니다.

## 최종 요구사항 재감사 (2026-09-13)
- 사용자: “더 진행할 거 없나? 마지막으로 초기 요구사항에 어긋난 거 있는지 확실히 확인해”
- 초기 `12ed483:PLAN.md`와 현재 구현·후속 승인·검증 기록을 대조했습니다. 필수 누락이나 승인 범위 위반을 발견하지 못했습니다.
- 코드 `2878f98`에서 포맷/lint/strict typecheck/87 tests/production build 재통과. 브라우저는 동일 코드의 기존 production 기록을 검토했으며 이번 재실행은 아닙니다.
- 초기 제외 및 과거 테스트 수의 시점을 문서에 명확히 표시했습니다. 코드 변경 없음. [요구사항별 대조와 실제 명령](docs/records/final-audit.md).

## setup — 공통 기반

### 사용자 지시
“PLEASE IMPLEMENT THIS PLAN: 채용 보드 — TypeScript 기반 병렬 개발 계획.” 핵심 제약: TypeScript strict, Next App Router, Tailwind/cn, shadcn, TanStack Query, Zustand, 기능당 독립 세션과 워크트리, 기능별 커밋, 6시간 내 필수 구현 및 검증.

### 출력 요지
공통 도메인 계약과 프로젝트·테스트 환경을 먼저 구성하고 이후 독립 세션에서 구현합니다.

### 리뷰 / 검증
초기 저장소에 커밋과 코드가 없음을 확인했습니다. 의존성 설치·실행 검증은 아래 후속 기록에 실제 결과로 추가합니다.

pnpm install과 shadcn CLI 컴포넌트 생성을 완료했습니다. pnpm typecheck 통과, lint의 PostCSS 익명 export 경고를 명명된 config로 수정했습니다. pnpm의 build script 정책은 esbuild/unrs-resolver만 명시적으로 허용했습니다. Jest DOM 6.10 deprecation 경고를 확인해 6.9.1로 고정했습니다.

### 추가 사용자 지시
“중간 중간 문서를 업데이트 해줘서 새 세션에서 뭘 하면 될 지 바로 참고할 수 있게 해줘” — STATUS와 기능별 작업/기록 문서를 추가했습니다.
“AGENTS.md 나 Plan.md는 따로 필요 없나? 잘 몰라서” — 공통 작업 규칙 AGENTS.md, 승인 범위 PLAN.md를 추가하고 변경되는 진행 상황과 분리했습니다.

## 공통 기반 후속 검토
- shadcn CLI 생성물에서 외부 `cn` 패키지 import를 발견했습니다. 요구한 로컬 `cn()`을 사용하도록 전체 primitive를 수정하고 불필요한 패키지를 제거했습니다. `74e4736`에 수정 이력을 보존했습니다.
- 통합 테스트에서 pnpm 로컬 캐시의 프로젝트 복사본이 중복 수집되는 것을 발견했습니다. Vitest 수집 범위를 `src/**/*.test.{ts,tsx}`로 제한하고 lint/tsc에서도 캐시를 제외했습니다. 중복 집계 결과를 최종 테스트 수로 사용하지 않습니다.

## 기능별 원문과 검증
아래 기록은 기능 완료 때 병합한 원문이며 개별 기록 파일을 유지합니다.
- [mock-api](docs/records/mock-api.md): 17개 테스트, empty 배열 검증 조건 수정, 타입/lint 통과.
- [explorer](docs/records/explorer.md): 9개 테스트, persist 복원/손상/실패, 키보드 필터/상세 검증.

<!-- GENERATED-FEATURE-RECORDS -->

## 초기 필수 기능 완료 당시 검증 및 기능별 원문

최종 pnpm verify/format:check 통과, 50 tests 통과. 아래 기록의 중간 실패는 당시의 실제 관찰이며 최종 해결은 test-environment-fix와 STATUS.md에 정리되어 있습니다. 사용자 본인의 검증으로 가장하지 않고 에이전트 실행 결과로 기록합니다.

---

# mock-api 실행 기록

## 실제 받은 작업 지시
> Implement ONE feature mock-api in worktree /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/mock-api branch codex/mock-api, start 12ed483. Read AGENTS.md PLAN.md STATUS.md docs/SESSION_GUIDE.md docs/tasks/mock-api.md. Own only files in task. Implement robust browser mock API + deterministic 250 seed + tests. Shared node_modules already linked. Run pnpm test targeted/typecheck/lint; write actual received prompt and evidence in docs/records/mock-api.md, update task handoff, commit feat(mock-api). Do not change shared/package/app files. Do not spawn subagents. Final report path/branch/SHA/tests/open issues. Root integrates independently.

추가 검토 지시:
> Please change validation to allow any valid array length including [] (seed is 250 but valid stored empty supports required whole-empty UI and avoids conflating seed size with schema). Keep uniqueness, fields and version validation. Add empty persistence read test before commit. Known jobs restriction okay but unknown user corrupted reject explicit.

## 구현 결과
- `createSeedCandidates`: 한국어 이름 250개, 고유 ID/이름, 직무 5개 × 단계 5개별 각 10명. 호출마다 새 객체를 반환합니다.
- `createMockApi` / `candidateApi`: 조회와 단계 변경, 200~800ms 지연과 15% 미만 난수 실패, 주입 가능한 storage getter/random/sleep.
- 조회는 AbortSignal을 지원하고 취소 시 타이머/리스너를 정리합니다. 주입한 sleep이 signal을 무시하더라도 대기 후 취소를 재확인합니다.
- 저장 키 `hiring-pipeline:candidates:v1`; `{ version: 1, candidates }`를 저장합니다. 버전, 필드 형식, 날짜, 알려진 직무/단계, ID 중복을 검사합니다. 손상 데이터는 오류로 보고하고 덮어쓰지 않습니다.
- 최초 조회는 시드만 반환합니다. 성공한 변경만 저장하며, 지연 뒤 최신 저장 값을 동기적으로 읽고 대상 카드만 변경하므로 다른 카드의 먼저 완료된 변경을 보존합니다.
- 같은 ID의 진행 중 변경은 busy 오류로 제외합니다. finally에서 잠금을 풀어 실패 후 재시도를 허용합니다.
- 저장소 접근/읽기/쓰기 오류는 명시적인 MockApiError로 전달합니다. 의존성/공유 타입 변경 없음.

## 검토 및 결정
- 최초 구현은 저장 배열 길이도 250으로 제한했으나 통합 검토에 따라 빈 배열을 포함한 모든 배열 길이를 허용했습니다. 시드 크기와 저장 스키마를 분리하고 전체 빈 상태를 지원합니다.
- 저장소에 접근할 수 없을 때 메모리 성공으로 위장하지 않고 실패 처리하여 영속 저장 계약을 지킵니다.
- 조회 시 저장하지 않아 초기 렌더 또는 실패 요청이 영속 상태를 변경하지 않습니다.
- UI 낙관적 반영과 카드 단위 롤백은 통합 담당자의 Query 계층 책임입니다.

## 실행 명령과 결과
- `pnpm test src/features/candidates/mock-api.test.ts`: pnpm의 공유 node_modules 사전 검사에서 자동 install을 시도하다 ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY로 중단.
- `pnpm --config.verify-deps-before-run=false test src/features/candidates/mock-api.test.ts`: 최초 **17 tests passed**.
- `pnpm --config.verify-deps-before-run=false typecheck`: 최초 **통과**, tsc --noEmit.
- `pnpm --config.verify-deps-before-run=false lint`: 최초 **통과**, eslint .
- 최종 검토 수정 후 `./node_modules/.bin/vitest run src/features/candidates/mock-api.test.ts`: **17 tests passed**, 1 file, 1.85s.
- `./node_modules/.bin/tsc --noEmit`: **통과**.
- `./node_modules/.bin/eslint src/features/candidates/mock-api.ts src/features/candidates/seed.ts src/features/candidates/mock-api.test.ts`: **통과**.
- 테스트: 시드 결정성/독립성, 성공 저장과 재로드, 실패 경계/무저장, 역순 완료/같은 카드 배제, 손상 JSON·버전·단계·중복 ID·날짜, 유효 빈 배열, 저장 접근/쓰기 실패 후 재시도, 미존재 ID/잘못된 입력, 사전/진행 중 취소, signal 무시 sleep, 지연 최솟값/최댓값.

## 남은 사항
기능 범위 미완료 없음. production build, 브라우저 검증, Query 롤백과 UI 연결은 통합 담당자가 수행합니다. 다중 탭 동기화는 승인 범위 밖입니다.


---

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

최종 실행 결과: Node24 `vitest run src/features/candidates/board.test.tsx --maxWorkers=1 --reporter=verbose`는 **7 passed, 1 failed**, 55.41s. 유일한 실패는 `restores focus to the moved card and again on rollback` (5000ms timeout, 보고된 실행 40866ms). 실패 테스트를 유지하여 통합 진단에 제공함. 마지막 tsc 재실행 통과.


---

# explorer 작업 기록

## 실제 받은 지시
> Implement ONE feature explorer (search/filter/detail UI state) in worktree /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/explorer branch codex/explorer start 12ed483. Read AGENTS.md PLAN.md STATUS.md docs/SESSION_GUIDE.md docs/tasks/explorer.md. Own only task files. Build Zustand provider persist safely at mount validating stored UI data + filter helper + polished toolbar + shadcn detail Sheet. Card detail buttons expose data-candidate-detail=id for focus return. Shared UI and node_modules ready. Test persist/bad storage/filter/detail; run checks, log actual received prompt and evidence docs/records/explorer.md, update task handoff, commit feat(explorer). No shared/app/package edits, no agents. Final path/branch/SHA/tests/issues.

후속 지시:
> Use direct ./node_modules/.bin/vitest /tsc /eslint for checks; pnpm in worktree may try reinstall linked node_modules. Root foundation build passed. Root app uses all contracts exactly as task.

## 구현 및 검토
- provider마다 독립 Zustand store; SSR 초기값 이후 mount에서 persist.rehydrate 실행.
- hiring-pipeline-ui 키에 search/job만 저장. 저장된 selectedId/hydrated/action 무시. search 타입/길이, job 목록 검사. JSON 손상 및 localStorage 접근/할당 오류에서도 메모리 상태 이용 가능.
- 이름 trim/대소문자 무시 부분 검색과 직무 AND 필터.
- shadcn Input/Select/Button 도구, 접근 가능한 label, 결과 수 live region, 초기화.
- shadcn Sheet 이름/직무/지원일/단계/이메일/소개. 한국어 닫기, Escape, 포커스 잠금 및 data-candidate-detail 버튼 포커스 복귀.
- 지원자 객체를 UI store에 포함하지 않아 낙관적 Query 데이터 저장 방지.
- 저장된 임의 action/선택을 펼치지 않고 허용 필드만 병합. localStorage 불능이 기능 사용을 막지 않음.
- 고정 공유 JOBS로 저장 직무 검증. 향후 동적 직무 도입 시 정책 조정 필요.
- 속성 selector에 ID를 삽입하지 않아 escaping 의존성 없음.

## 검증 명령 / 결과
- `pnpm test`: 연결된 node_modules 재설치 시도, ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY. 의존성 변경 없이 직접 바이너리 사용.
- `./node_modules/.bin/vitest run`: 1 파일 / 9 테스트 통과 (AND 필터, 복원, 선택 비영속, 손상 JSON/타입/null, 리마운트/초기화, 키보드 직무 선택, 저장소 예외, 상세 포커스).
- `./node_modules/.bin/tsc --noEmit`: exit 0.
- `./node_modules/.bin/eslint src/features/candidates`: exit 0.
- git add 최초 실행은 worktree git index sandbox 제한으로 실패, 승인된 escalation 경로로 재시도.
- 브라우저 및 production build는 통합 담당.

## 인계
기능 미완료 없음. 앱에서 Provider 아래 Toolbar/Detail 연결, 보드 상세 버튼 data-candidate-detail=id 계약 유지 필요.
워크트리 /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/explorer, 브랜치 codex/explorer.


---

# optimistic-update 작업 기록

## 실제 작업 지시

> Implement ONE feature optimistic-update in /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/optimistic-update branch codex/optimistic-update start 74e4736. Read AGENTS.md PLAN.md STATUS.md docs/SESSION_GUIDE.md docs/tasks/optimistic-update.md. Existing candidateApi mock ready. Implement queries.ts hooks exactly task contract plus strong deterministic hook tests of optimistic apply, isolated rollback, overlap/duplicate prevention, reverse success. Direct ./node_modules/.bin/{vitest,tsc,eslint} recommended to avoid pnpm linked-dir auto-install. Own queries/tests/task/record only. Record actual prompt & tests, commit feat(optimistic-update), report SHA/evidence. No agents. Root handles integration app.

추가로 DECISIONS.md와 mock-api 구현 및 공통 Providers 설정을 읽었습니다.

## 구현 산출물

- `queries.ts`: CANDIDATES_QUERY_KEY, useCandidates, useMoveCandidate 계약 구현.
- 목록 요청에 Query의 AbortSignal 전달. 이동 시작 시 실행 중 목록 요청 취소 후 해당 카드만 낙관 갱신.
- QueryClient별 WeakMap 저장소 + useSyncExternalStore로 동일 tick·다른 hook·재마운트에도 공유되는 동기 잠금 제공. pendingIds는 변경 때마다 새 Set을 만들어 이전 스냅샷을 보존.
- 다른 카드 요청은 병렬 허용. 성공 응답은 해당 카드만 patch, 실패는 해당 카드의 이전 값만 복구하고 한국어 sonner 오류 알림.
- Hook-level mutation lifecycle로 컴포넌트 unmount 이후에도 성공·실패 및 잠금 해제 처리. mutation 호출별 콜백에는 의존하지 않음.
- 현재 단계 이동, 없는 카드 및 아직 읽지 않은 목록에는 요청하지 않음. 저장은 기존 candidateApi에 위임하며 Zustand/localStorage에 낙관적 상태를 쓰지 않음.

## 검토와 결정

- 전체 목록 snapshot 복구 대신 카드 단위 snapshot을 사용해 다른 카드의 성공이나 진행 중 변경을 보존.
- useState/useRef의 훅별 잠금 대신 QueryClient 범위 잠금을 사용해 중복 훅과 재마운트의 빈틈을 방지.
- 완료마다 invalidateQueries를 하지 않아 다른 카드의 낙관적 상태가 목록 재요청으로 덮이는 것을 방지. API의 성공 응답을 정본으로 캐시에 반영.
- 추가 의존성/공유 파일 변경 없음. API·UI와의 계약 변경 없음.

## 실행한 검증과 실제 결과

- `./node_modules/.bin/vitest run src/features/candidates/queries.test.tsx`: 1 파일, 11 테스트 통과.
- `./node_modules/.bin/tsc --noEmit`: 종료 0.
- `./node_modules/.bin/eslint src/features/candidates/queries.ts src/features/candidates/queries.test.tsx`: 종료 0, 오류/경고 없음.
- `./node_modules/.bin/vitest run`: 2 파일, 28 테스트 통과(기존 mock API 17 + 훅 11).
- 테스트는 임의 지연 대신 수동 resolve/reject 가능한 promise로 실행 순서를 제어함.
- 훅 검증 범위: AbortSignal 전달·진행 중 목록 취소와 늦은 응답 무시, 표준 query 성공, 완료 전 낙관 반영, 서버 응답 patch, 불변 pending snapshot, 실패 롤백·재시도, A 실패/B 성공 양쪽 완료 순서, 동일 tick/다른 훅의 중복 차단, 역순 성공, 성공/실패 각각 unmount·remount, no-op 입력.

## 인계

워크트리: `/Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/optimistic-update`

브랜치: `codex/optimistic-update`

완료: 기능 구현·독립 검증. 미완료/알려진 문제 없음. 통합 담당자가 앱 연결, production build, 브라우저 검증, STATUS 및 PROMPTS 갱신을 수행합니다.


---

# board-focus-fix 작업 기록

## 실제 받은 지시

> Fix ONE feature defect board focus in /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/board-focus-fix branch codex/board-focus-fix start a2dacf1. Read AGENTS PLAN STATUS docs/tasks/board-focus-fix and docs/records/board-ui. Board original agent reported 7/8 tests pass, test restores focus moved card/rollback hangs. Diagnose real issue (Radix lifecycle vs immediate layout focus?) preserve tests/no skipping/no longer timeout hiding. Own board.tsx, board.test.tsx, task and docs/records/board-focus-fix.md only. Direct node_modules/.bin tests to avoid pnpm reinstall. Check docs Next local if relevant. Root does real browser flows in parallel. Commit fix(board-focus) plus actual prompt/review/tests records. No subagents. Report SHA/evidence.

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


---

# Acceptance test record

## Actual assignment

“Implement ONE feature integration acceptance tests in /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/acceptance-tests branch codex/acceptance-tests start a2dacf1. Read AGENTS PLAN STATUS and app source. Own ONLY src/features/candidates/candidates-app.test.tsx, docs/tasks/acceptance-tests.md, docs/records/acceptance-tests.md. Test real CandidatesApp+Providers with mocked candidateApi deterministic promises: initial loading, query failure+retry, empty dataset vs filtered empty, search/filter composition, failed save UI rollback+toast if manageable; preserve actual UI not mock hooks/children. No fragile long waits, no package changes. Existing board focus bug being fixed independently, don't edit board. Run your targeted tests, write actual prompt/evidence, commit test(acceptance). No agents. Report SHA/tests/issues.”

## Output and review

Added five full client-screen tests using production Providers, Query hooks, Zustand provider, toolbar, board, and Sonner toaster. Only API methods are mocked. Deferred promises expose loading and mutation transitions without random network delays. Tests assert visible columns, explicit retry, differing empty messages, combined filters/reset, pending-card exclusion, rollback and error toast. Read the installed Next.js Vitest guide before implementation. No async server component is under test.

Initial retry assertion expected a disabled retry button, but actual query state returns to the loading skeleton; corrected the expectation to the observed UI. Filter selection uses native events and controlled Radix timers. No hooks or child components are replaced. Production source and shared config remain untouched.

## Commands and actual results

- `pnpm test src/features/candidates/candidates-app.test.tsx`: aborted because pnpm attempted automatic dependency installation against the shared node_modules symlink and required TTY confirmation. Did not reinstall or change dependencies.
- `node_modules/.bin/vitest run src/features/candidates/candidates-app.test.tsx -t 'composes|initial|query failure|empty dataset' --maxWorkers=1 --reporter=verbose`: four passed, movement excluded by selector, 4.08 seconds (final recorded run).
- Full file: four passed, movement timed out. Separate movement runs also stalled after opening the real menu and beginning async state updates. Tried real timers, limited fake timers, and explicit pending-timer drains; unresolved. Interrupted stalled diagnostic runs.
- `node_modules/.bin/eslint src/features/candidates/candidates-app.test.tsx`: passed.
- `node_modules/.bin/tsc --noEmit --incremental false`: passed.

## Coordination and remaining issue

Integration explicitly requested retaining the movement regression rather than hiding or skipping it. Board focus agent reports synchronous board tests pass with controlled timers, but acceptance also crosses asynchronous Query mutation lifecycle. The movement test remains unskipped for integration to diagnose. This record does not claim the entire file passed. Browser validation and production build remain integration-owned.


---

# integration 실행 기록

## 실제 사용자 지시
승인된 TypeScript 기반 병렬 개발 계획을 구현하며 한 기능당 새 세션·워크트리를 사용하고 중간 문서를 갱신하라는 요청입니다. 기능 분할은 유동적입니다.

## 구현과 검토
- 공통 기반 후 mock-api, board-ui, explorer를 독립 세션에 분배하고 API 병합 후 새로운 optimistic-update 세션을 시작했습니다.
- 통합 페이지는 기능의 공유 계약을 그대로 사용해 Query 데이터·Zustand 필터·보드·상세를 연결합니다.
- Orbit 헤더, 전체/진행/합격 요약, 조회 로딩/오류/빈 상태, Next 렌더 오류 경계를 추가했습니다.
- 최초 lint에서 홈 anchor 지적을 확인해 Next Link로 수정했습니다.
- 250명 시드와 저장 스키마의 길이 제한을 혼동한 제안을 수정 요청했습니다.
- shadcn 외부 cn import 및 캐시 중복 테스트 수집을 발견해 수정 커밋으로 보존했습니다.

## 검증
- 기반 production build 통과.
- mock API + explorer + queries 통합 37 tests 통과.
- board 기능은 7개 통과/포커스 1개 timeout을 보고했습니다. 통과로 간주하지 않고 후속 수정 세션에서 진단합니다.
- localhost:3100 브라우저에서 250명/150명 진행/50명 합격, 5컬럼·검색 도구·컬럼 스크롤이 렌더된 것을 시각 확인했습니다.

## 다음 검증
보드 포커스 timeout, 검색·필터·이동·새로고침·상세 실제 조작, 반응형 및 최종 빌드.

## 최종 결과
- 메뉴 테스트 지연은 실제 앱 결함으로 단정하지 않고 CPU profile로 추적하여 nwsapi/JSDOM 재진입을 확인했습니다. 하위 의존성 override 후 원래 50개 테스트 모두 통과했습니다.
- 포맷팅으로 줄이 바뀐 테스트의 @ts-expect-error 위치를 수정한 뒤 pnpm format:check와 pnpm verify 전체 통과했습니다.
- Webpack production build 및 next start 브라우저 smoke도 통과했습니다. 필수 미완료 없음.
- 기능 워크트리는 정리하고 브랜치·커밋·기능 기록은 보존했습니다.


---

# 테스트 환경 지연 원인과 수정

## 지시와 접근
남은 통합/보드 테스트 timeout을 생략·시간 제한 증가 없이 해결한다는 승인된 검증 기준에 따라 진단했습니다.

## 실제 관찰
- 실제 브라우저에서는 키보드 메뉴 이동·rollback·포커스·알림이 정상 동작했습니다.
- JSDOM 통합 테스트에서는 메뉴 선택 및 mock API 호출까지 진행된 뒤 100ms 타이머도 약 26~29초 후 실행됐습니다.
- 보드 세션은 Radix close 타이머를 명시적으로 flush하는 검증을 추가했지만 전체 환경의 간헐적 지연은 남았습니다.
- 임시 CPU profile을 생성해 hot frames를 집계했습니다. nwsapi@2.2.27의 get 5.2s, has 4.4s, isFullscreen 2.6s, Element.matches/matchesNative 등 선택자 처리에서 대부분의 시간이 소모됐습니다.
- 설치된 소스에서 isFullscreen → matchesNative(node, ':fullscreen') → JSDOM Element.matches → nwsapi라는 재진입 경로를 확인했습니다. 브라우저 네이티브 matches를 가정한 경로가 JSDOM에서는 동일 엔진으로 돌아옵니다.

## 채택 / 기각
- 채택: pnpm overrides에서 `jsdom>nwsapi`만 2.2.23으로 고정. 앱 런타임 의존성에는 영향을 주지 않습니다.
- 기각: 프로덕션 onMove 타이밍 변경, 실패 테스트 제외, timeout 증가, 낙관적 저장 단계 검증 축소. 최종 acceptance 테스트는 원래 deferred API·저장중 잠금·rollback·알림 검증을 모두 유지했습니다.
- 임시 console 계측과 축소 테스트는 제거했습니다. CPU profile은 추적하지 않는 artifacts에만 있습니다.

## 결과
`pnpm test`: 5 files / **50 tests passed**, **3.91s**. board 8개 모두 통과(250명 렌더 1.26s), acceptance 5개 모두 통과(문제였던 optimistic/rollback 372ms).
위 비교는 이 개발 환경의 관찰 결과이며 모든 버전/환경에 대한 일반 성능 보장은 아닙니다.


---

# 브라우저 검증 기록

2026-09-13, Codex in-app browser, http://localhost:3100, 기본 viewport와 390×844에서 실제 UI 조작으로 확인했습니다. 테스트 대상은 생성된 데모 지원자입니다.

## 수행과 결과
1. 최초 로딩 스켈레톤 이후 250명/진행 150명/합격 50명, 5단계 컬럼이 표시됐습니다.
2. 이름 `최서연` 검색 시 250명 중 1명으로 필터됐습니다.
3. 상세 버튼 Enter로 Sheet를 열어 이름/직무/단계/날짜/이메일/요약을 확인했습니다. Escape 후 상세 버튼으로 포커스가 돌아왔습니다.
4. 단계 메뉴 Enter → 면접 Enter 조작 직후 UI에 면접과 저장 중이 표시됐고 메뉴가 닫혔습니다. 포커스는 이동한 카드의 상세 버튼에 유지됐습니다.
5. 새로고침 후 검색어 `최서연`과 면접 단계가 유지됐습니다.
6. 직무 프론트엔드 개발자를 추가 선택해 복합 조건 0명과 검색 결과 없음 안내를 확인했습니다. 검색 조건 초기화 후 250명으로 복원됐습니다.
7. viewport 390×844: documentWidth 375 ≤ viewport390, boardWidth335 < boardScrollWidth1240. 페이지 전체 넘침 없이 보드 가로스크롤을 확인했습니다. 모바일 상세 Sheet는 화면 너비에 맞춰 표시됐습니다.
8. `최지우` 카드로 서류검토↔면접 이동을 반복했습니다. 4회 성공 후 5번째 면접 이동에서 기본 15% 실패가 발생했습니다. 카드가 서류검토로 복구됐고 "단계 이동을 저장하지 못했습니다. 다시 시도해 주세요." 알림이 표시됐습니다. 포커스도 최지우 상세 버튼에 유지됐습니다.
9. 개발 브라우저 error/warn 로그는 비어 있었습니다.
10. 새로고침을 통한 초기 조회에서도 기본 실패를 재현했습니다(두 번째 조회). 오류 설명과 다시 불러오기 버튼을 확인하고 클릭한 뒤 로딩 → 250명 보드 복원을 확인했습니다.

11. `next start --port 3101`로 최종 Webpack build 결과를 실행했습니다. 250명 렌더, 김서준 검색·상세·초기화를 확인했고 error/warn 로그는 비어 있었습니다. 검증 후 서버와 임시 탭을 종료했습니다.

## 정리 / 한계
검색 조건을 초기화하고 viewport override를 해제했습니다. 최서연의 면접 이동은 해당 브라우저 origin의 데모 저장소에 남아 있습니다. 다른 브라우저/포트의 초기 데이터에는 영향을 주지 않습니다.
전체 빈 데이터·손상 데이터는 자동 테스트와 README 재현 절차로 검증합니다. 이 기록은 수동 UI 관찰이며 성능 수치 벤치마크를 의미하지 않습니다.


---

## 후속 승인 기능: concurrent-feedback (2026-09-13)

# concurrent-feedback 실행 기록

## 실제 요청과 배정
사용자: `useTransition. useDeffredValue 같은 동시성 기능 적극 활용도 좀 넣고 에러 처리나 로딩 처리도 좀 깔끔하게`, 이어서 `작업 시작`.

통합 에이전트 배정: `Implement bounded feature in /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/concurrent-feedback on codex/concurrent-feedback.` 검색/직무의 안정된 값을 지연하고 메모 경계를 두되 mutation 데이터/잠금은 즉시 반영한다. 명시적 조회 재시도에는 React async Action을 적용한다. 최초 skeleton/안전한 오류 복구, 배경 갱신 중 데이터 유지, 저장 중 갱신 제외, 관련 회귀 검증을 소유한다.

## 읽은 자료
- 주 체크아웃의 최신 AGENTS.md 및 이 워크트리의 PLAN.md, STATUS.md, DECISIONS.md, docs/tasks/concurrent-feedback.md.
- frontend-fundamentals readability SKILL.md: 오류/갱신 UI를 별도 작은 컴포넌트로 분리하고 복합 상태에 이름 부여.
- 설치된 Next `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`: 예상 가능한 요청 실패는 명시적 UI로 처리, 렌더 예외 경계는 기존 경계 유지.
- 통합 에이전트가 React 공식 useTransition/useDeferredValue 문서 확인. 실제 공유 설치 React 19.3.0, Next 16.3.5, Query 5.102.8.

## 결과와 결정
- 검색/직무 객체를 useMemo + useDeferredValue로 처리. 입력은 Zustand에 즉시 반영. 필터 개수/빈 상태/보드는 동일한 지연 필터 결과를 사용. CandidateBoard에 memo 경계를 두어 긴 보드가 긴급 입력에 따라 불필요하게 재렌더하지 않음.
- 카드 데이터/잠금은 지연하지 않음. 서로 다른 카드 병렬 저장, 같은 카드 요청 제외 및 카드별 롤백은 기존 계약 유지.
- 명시적 목록 retry/refresh를 useTransition async Action으로 추적. Query의 외부 상태 변경을 비차단 상태로 취급하지 않으며 ref 잠금을 별도로 사용. 저장 중 목록 갱신을 막고 기존 mutation의 query 취소를 유지.
- 첫 로딩 skeleton을 실제 보드의 5열/최소 너비와 일치. 최초 실패는 retry 버튼을 로딩 중에도 유지. 재시도 성공 시 없어진 버튼의 포커스를 검색창으로 복구하되 사용자가 다른 요소에 둔 포커스를 훔치지 않음.
- 배경 갱신 실패는 기존 카드/검색/상세를 유지하며 작은 오류와 재시도 제공. MockApiError의 storage/corrupt-storage 코드에 맞는 안전한 복구 안내, 임의 내부 error.message 노출 없음.
- 검색 개수는 aria-live=off인 명명된 상태로 두어 키 입력마다 읽지 않음. 지연 결과의 aria-busy/시각 피드백 제공. 조회 pending은 별도의 작은 live status.
- 공통 Input/Button은 기존 native props 확장/전달 구현을 유지; 추가 의존성 없음.

## 검토와 수정
- 통합 리뷰: paragraph의 aria-label 대신 role=status + aria-live=off를 사용해 유효한 의미론 유지. 적용.
- 통합 리뷰: 최초 retry 성공 후 포커스 복구, 반복 실패, 저장/목록 갱신 경쟁, 안전한 저장소 오류 분류를 확인. 구현 및 테스트 적용.
- 최초 실행 5개 기존 app 테스트 통과 후 회귀 항목을 추가. 테스트를 생략하거나 timeout을 늘리지 않음.

## 실제 명령 / 결과
- `pnpm exec prettier --write ...`: symlink node_modules에서 pnpm 자동 install 시도 후 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` 발생. 공유 의존성을 변경하지 않고 설치된 바이너리로 실행.
- `node_modules/.bin/prettier --write` (소유 TSX 4개): 통과.
- `node_modules/.bin/vitest run src/features/candidates/candidates-app.test.tsx`: 11/11 통과.
- `node_modules/.bin/eslint .`: 통과.
- `node_modules/.bin/tsc --noEmit`: 통과.
- `node_modules/.bin/vitest run`: 5 files, 56/56 통과. 기존 50개 + 새 6개 (it.each 포함).
- `node_modules/.bin/prettier --check` (소유 TSX 4개): 통과.
- `git diff --check`: 통과.

## 인계 / 남은 일
기능 코드와 자동 검증 완료. 통합 에이전트가 main 통합 후 production build와 실제 브라우저 확인, STATUS/PROMPTS를 갱신한다. 알려진 기능 미해결 없음. 강제 지연/성능 수치 테스트 대신 실제 비동기 요청과 최종 UI 일관성 검증을 사용했다. 검색은 250명 범위이며 가상화는 원래 제외 범위다.

---

# 동시 렌더링·상태 피드백 통합 기록

## 실제 사용자 지시
> AGENTS.md와 STATUS.md를 읽고 현재 완료 상태를 파악해줘.
> 추가로 하나만 더. 공통 컴포넌트(input, button 등은 기본 element를 확장시킨 방식으로 구현하자)
> 추가로 동시성 기능이 필요한 곳에 적극적으로 올바르게 활용

> useTransition. useDeffredValue 같은 동시성 기능 적극 활용도 좀 넣고
> 에러 처리나 로딩 처리도 좀 깔끔하게

> 작업 시작

## 초기 확인과 구현 범위
- 기존 `main` HEAD `0cad6b2`. 첫 상태 확인 때 작업 트리는 깨끗했고, 이후 AGENTS/DECISIONS/STATUS에 사용자 요청을 기록했습니다.
- Input/Button은 native element props를 확장하고 props/ref를 전달하는 구현입니다.
- 검색은 useMemo만 사용하고 조회 오류가 기존 데이터의 보드까지 가리는 분기였습니다.
- AGENTS의 기능당 독립 세션·워크트리 규칙에 따라 `codex/concurrent-feedback`을 만들고 기능 세션에 구현·테스트·기능 기록을 맡겼습니다. 통합은 main에서 문서·리뷰·전체 검증을 맡습니다.
- readability 스킬을 읽고 로딩·오류·결과 분기를 분리하도록 적용했습니다. 설치된 Next use-client 가이드를 확인했습니다.
- React 공식 [useTransition](https://react.dev/reference/react/useTransition), [useDeferredValue](https://react.dev/reference/react/useDeferredValue)를 확인했습니다. 비동기 Action의 pending과 결과 렌더링 지연을 구분하며 외부 store 변경이 자동으로 transition이 된다고 가정하지 않습니다.

## 검증 진행
- 구현 전 문서 변경 `git diff --check`: 통과.
- 기능 `4ceb4f7`을 main에 `b02690c`로 병합. 문서 외 실행 코드에 통합 추가 수정 없음.
- main `pnpm format:check && pnpm verify`: format/lint/strict typecheck/56 tests/webpack production build 모두 통과. 테스트 5 files, 56 passed, 12.90s. 성능 벤치마크가 아닌 해당 환경의 테스트 실행 시간입니다.
- 최초 `pnpm start --port 3101`은 sandbox listen EPERM으로 실패. 자동 승인 검토를 거친 `pnpm start --hostname 127.0.0.1 --port 3101` 실행 성공. 첫 연결 실패 탭 대신 새 탭에서 준비된 서버를 확인했습니다.

## 실제 production 브라우저 확인
2026-09-13, Codex in-app browser, `http://127.0.0.1:3101`.
- 초기 skeleton 이후 250명 표시. `김서준` 검색 1명, 빈 검색 결과와 초기화 후 250명 복원.
- 새로고침 직후 pending 안내와 기존 카드가 동시에 보임. 추가 새로고침 두 번째 시도에서 기본 확률 실패 재현, 오류 안내와 250개 카드 유지. 다시 불러오기 성공 후 정상 버튼과 250개 카드 확인.
- 상세 버튼 Enter로 Sheet 열기, Escape 후 해당 상세 버튼의 aria-label을 가진 요소로 포커스 복귀 확인.
- 390×844에서 document 폭 390, main 폭 390, toolbar/board 폭 350 확인. 기본 viewport로 복원. 데스크톱 screenshot 시각 확인.
- 페이지 새로고침 두 번째에서 초기 조회 실패 재현. Enter 재시도 직후 pending/버튼 비활성 확인. 첫 retry도 기본 확률 실패여서 searchbox 대기 timeout이 발생했으나 화면을 재확인해 retry 가능 상태임을 확인. 두 번째 retry 성공 후 activeElement가 INPUT[type=search]인 것을 확인.
- 필터 초기화 후 `전체 250명 중 250명`. 앱 error/warn logs `[]`.
- QA 탭을 닫고 임시 production 서버를 Ctrl-C로 종료했습니다. 이전 연결 실패 임시 탭의 닫기 호출은 브라우저 data URL 정책으로 거절되어 자동 정리에 맡겼습니다. 사용자 기존 dev 서버는 종료하지 않았습니다.

## 결론과 한계
승인된 추가 기능과 검증 완료. 알려진 기능 이슈 없음. 이전 기능의 카드별 rollback/같은 카드 잠금/다른 카드 병렬 저장은 전체 자동 테스트에서 재검증했습니다. React 지연 렌더링의 시간·성능 향상 수치를 측정한 것은 아니며, 250명 동작 및 입력/결과 일관성을 확인했습니다. 다중 탭·가상화 등 기존 제외 범위는 유지합니다.


---

# virtualization 작업 기록

## 실제 요청
사용자: “문서 보고 선택 작업도 이어서 진행(가상화 등)”

통합 배정: “Implement assigned virtualization feature in /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/virtualization branch codex/virtualization only. Read AGENTS PLAN STATUS DECISIONS docs/tasks/virtualization.md first. Task file created uncommitted for you to own. Follow task requirements especially keyboard reachability, focus on offscreen moves/rollback/detail, filter scroll reset and 1000 items. Request dependencies from integration; do not change package/lock. Fresh independent feature session required by AGENTS. Implement and test, record actual prompt/commands and handoff, commit. I handle main scope docs and production/browser integration. No subdelegation needed.”

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
작업 경로: `/Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/virtualization`, 브랜치 `codex/virtualization`.

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


---

# 가상화 통합 기록

## 실제 요청
> 문서 보고 선택 작업도 이어서 진행(가상화 등)

## 범위와 분담
- 시작 HEAD `03e73bc`, main 깨끗함 확인. AGENTS/PLAN/STATUS/DECISIONS 및 이전 기능 인계/기록 확인.
- 문서의 1,000건 가상화를 이번 독립 기능으로 선정. 기본 250명 시드는 유지. Undo/DnD는 다음 후보.
- AGENTS의 독립 세션·워크트리 규칙에 따라 `.worktrees/virtualization`, `codex/virtualization` 생성. 기능 세션은 보드·가상 목록·회귀 테스트·기능 기록, 통합은 의존성·상위 문서·리뷰·production 검증.
- 실제 위임: task 계약을 읽고 컬럼별 가상화, Tab 전체 접근, 화면 밖 이동/롤백/상세 포커스, 검색 후 스크롤 회복을 구현·검증·커밋하도록 요청.
- `pnpm add @tanstack/react-virtual`: 3.14.12 설치. package/lockfile 통합 담당 변경. 기존 eslint/whatwg-encoding deprecated 경고 확인.
- rg 미설치로 find 사용. 첫 일반 git commit은 .git/index.lock sandbox EPERM, 같은 범위 git 명령을 require_escalated로 실행해 성공.
- 실제 browser 1,000건 검증을 위해 public에 임시 QA HTML 준비. 버튼으로 기존 localStorage를 sessionStorage에 백업한 뒤 합성 1,000건 적용, 복원 버튼 제공. 앱 기본 데이터/실패율은 변경하지 않음. 검증 종료 후 데이터 복원 확인 및 임시 파일 삭제 완료.

## 리뷰 기준
- [TanStack 공식 Virtualizer 문서](https://tanstack.com/virtual/latest/docs/api/virtualizer)의 measureElement/rangeExtractor/scrollToIndex 계약 확인. 실제 크기 측정, 화면 밖 포커스 대상의 추가 렌더링, 해당 index 스크롤을 조합합니다.
- 중간 리뷰에서 이전 키보드 요청 ID가 이후 마우스 상세 카드의 pin을 가리는 문제를 지적했고, 현재 focus ID도 함께 보존하도록 기능 담당에게 전달했습니다.
- JSDOM은 레이아웃을 계산하지 않으므로 virtualizer를 통째로 mock하지 않고 관련 요소의 geometry/scroll만 한정하여 지원하도록 요청했습니다. 실제 화면 측정은 production browser로 별도 확인합니다.

## 검증
- 기능 `2c0a912`를 main `da3da3f`로 병합. 추가 실행 코드 수정 없음.
- main `pnpm format:check && pnpm verify`: format/lint/strict typecheck/**62 tests**/webpack production build 모두 통과. 6 test files, 12.58s.
- 최초 sandbox server listen EPERM. require_escalated로 `pnpm start --hostname 127.0.0.1 --port 3101` 실행 성공.

## 실제 production 브라우저 (2026-09-13)
Codex in-app browser, 127.0.0.1:3101, 기본 viewport 1280×720.
- 기본 250명, 초기 실제 카드 DOM **30개**, 각 컬럼 viewport 432px 확인.
- 임시 QA 버튼으로 합성 1,000명(컬럼별 200명) 적용. 전체 결과 1,000명, 초기 실제 카드 DOM **30개**. DOM 수 측정이며 처리 시간 벤치마크는 아닙니다.
- 서류검토 컬럼 실제 wheel scroll 100 pages: scrollTop 36222, 196~200번째 카드 표시, 전체 DOM 29개. 첫 Control+End는 문서만 이동했고 AX 대상이 자식에 가려져 coordinate wheel로 전환했습니다.
- 깊은 스크롤에서 가상지원자0100 검색: 결과 1명/카드 1개/scrollTop 0. Enter 상세 열기, Escape 닫기 후 같은 상세 버튼 focus 복귀.
- 초기화 후 컬럼에서 Tab 및 추가 12회 Tab: 처음 가시 범위 밖의 7번째 상세 버튼 focus, scrollTop 748, DOM 32개. 전체 1,000명 순회는 자동 테스트에서 확인했습니다.
- 불합격 마지막 카드 qa-1000을 서류검토로 이동: 즉시 상세 focus, 목적지 scrollTop 36322, 해당 카드 저장 중 표시. 완료 후 서류검토 유지/버튼 복구. reload 후 검색해 저장 영속성 확인.
- reload 및 원복 후 로드에서 각각 기본 15% 확률의 최초 조회 실패가 발생해 searchbox 대기 timeout. 에러 DOM 확인 후 다시 불러오기 각 1회로 복구. 실패율은 변경하지 않았습니다.
- 390×844: document width 390, board width 350, 컬럼 높이 506, DOM 35개. 모바일 screenshot 배치 확인. viewport override 원복.
- 빈 이름 검색: 결과 0명과 빈 안내 일치. browser error/warn logs `[]`.
- QA 버튼으로 기존 localStorage 복원, 전체 250명 복구 확인. 임시 tab 닫기, production 서버 Ctrl-C 종료, public QA 파일 삭제 완료.

## 결론 / 남은 사항
가상화 구현·리뷰·자동/production 검증 완료. 알려진 미해결 결함 없음. 기본 시드는 250명이며 1,000건은 합성 QA 데이터로 확인했습니다. Undo/DnD는 다음 독립 기능 후보입니다.


---

# Undo 구현 기록

## 실제 요청 / 배정
- 사용자: “후속 작업 이어서 작업하자.”
- 선택 답변: “Undo: 저장된 단계 이동 되돌리기 (추천)”
- 통합 담당 배정: “Implement Undo in fresh assigned worktree .../.worktrees/undo branch codex/undo. Read AGENTS/PLAN/STATUS/DECISIONS and docs/tasks/undo.md first ... Own src/features/candidates changes/tests and task + docs/records/undo.md ... Implement card-scoped last-successful-move Undo through existing mutation/locking, failure preserves history, stale history guard, accessible menu action and virtualization focus retention. Validate meaningful tests lint typecheck format; commit feature and send SHA/handoff.”
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


---

# Undo 통합 기록

## 실제 요청 / 범위
사용자 원문: “후속 작업 이어서 작업하자.”
상태 문서에서 필수 기능과 가상화 완료, Undo/DnD 후보를 확인한 뒤 선택 질문을 제시했습니다. 사용자 답변: “Undo: 저장된 단계 이동 되돌리기 (추천)”.

- 시작 main `a8be3cc`, git 작업 트리 깨끗함.
- AGENTS/PLAN/STATUS/DECISIONS, 이전 optimistic-update/virtualization task와 통합 기록 확인.
- AGENTS의 독립 기능 세션 규칙에 따라 `.worktrees/undo`, `codex/undo` 생성. 기능 담당은 후보 모듈·테스트·기능 기록, 통합은 상위 문서·리뷰·build·browser를 소유.
- 실제 위임: `docs/tasks/undo.md`의 카드별 마지막 성공 이동 Undo 계약 구현, 기존 잠금/롤백/성공 저장/가상화 접근성 유지, 테스트·lint·typecheck·format 및 커밋 인계.
- 통합 리뷰 지시: Undo 이력 참조를 안정적으로 유지하여 deferred board memo를 보존하고 실행 시점에도 현재 단계를 검증. 정상 이동 실패의 기존 이력 보존, 여러 hook 간 잠금 공유 확인.
- rg 미설치로 find 사용. 추가 의존성 없음.

## 검토
- QueryClient별 메모리 이력과 카드별 pending store를 공유합니다. 성공 일반 이동만 이전/저장 단계를 기록하고 성공 Undo만 해당 이력을 제거합니다.
- 메뉴에서 목적 단계가 명확하며 실행 불가한 Undo는 메뉴 닫기 후 기존 트리거 포커스 동작을 유지합니다. 실제 이동은 가상화 목록의 기존 포커스 요청 경로를 사용합니다.

## 검증 / 인계
- 기능 `a3c8274`를 main `57cbfa0`으로 no-ff 병합. 초기 git merge는 ORIG_HEAD.lock sandbox EPERM으로 실패, 같은 병합을 require_escalated로 실행해 성공.
- main `pnpm format:check && pnpm verify`: 포맷/lint/strict typecheck/**6 files, 73/73 tests**/webpack production build 모두 통과. 테스트 17.11s. 추가 코드 수정 없음.
- 최초 `pnpm start --hostname 127.0.0.1 --port 3101`은 listen EPERM, require_escalated 실행 성공.
- 브라우저 기본 250명, 최서연(서류검토) 검색. 면접 이동 직후 저장 중 버튼/새로고침 비활성화와 카드 상세 포커스 확인.
- 성공 후 메뉴에 `서류검토로 되돌리기` 표시. Enter로 메뉴 열기, End로 Undo 포커스, Enter 실행. 저장 완료 후 상세 포커스 복귀, Undo 메뉴 소모 확인.
- 페이지 reload 후 최서연이 서류검토 목록에 유지되어 되돌린 단계의 영속 저장 확인. 이력의 새 QueryClient 초기화는 hook 테스트로 확인.
- 390×844 모바일 메뉴 screenshot으로 폭/배치 확인. 새 일반 이동이 실제 기본 실패 확률로 한 번 실패하여 한국어 오류 알림과 서류검토 롤백 관찰. 재시도 성공 후 Undo 메뉴가 화면 안에 표시됨을 확인하고 Undo로 원래 단계 복구.
- 검색 초기화로 전체 250명 복구, console error/warn `[]`. viewport override 초기화, 임시 탭 닫기, 검증 서버 Ctrl-C 종료.
- Undo 실패/재시도는 결정적인 자동 테스트로 확인했으며 production에서는 일반 이동 실패를 관찰했습니다. 실패 확률/지연과 기본 시드를 변경하지 않았습니다.
- 알려진 미해결 결함 없음. DnD는 다음 후보이며 이번에는 구현하지 않았습니다.


---

# DnD 기능 기록

## 실제 요청 / 배정

사용자: “선택사항 이어서 진행하자”.

통합 담당의 배정: “Implement assigned DnD feature in /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/dnd branch codex/dnd. Read AGENTS.md PLAN STATUS DECISIONS docs/tasks/dnd.md and relevant installed Next docs first. Own src/features/candidates implementation/tests + docs/tasks/dnd.md docs/records/dnd.md only. Integration (me) handles top docs and main browser/build. No new dependencies unless coordinated. Use native drag handle desktop DnD and existing accessible menu for keyboard/touch; guard external/same-stage/pending/canceled/stale drag, preserve virtualization and focus, reuse onMove for rollback and Undo. Add meaningful board DnD and app integration tests. Run lint/typecheck/tests/format (symlink deps use pnpm --config.verify-deps-before-run=false). Commit feature after records/handoff. Do not edit main. Report SHA and evidence.”

## 읽은 자료 / 결정

- AGENTS.md, PLAN.md, STATUS.md, DECISIONS.md, docs/tasks/dnd.md.
- 설치된 Next.js `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`: 브라우저 이벤트/상태 코드는 기존 client boundary 안에서 구현.
- `frontend-fundamentals:readability` SKILL.md: 통합 리뷰가 지적한 중첩 삼항을 if 분기와 목적지 변수로 정리.
- `frontend-fundamentals:coupling` SKILL.md: 반환 필드가 많은 훅을 검토. 모든 필드는 하나의 보드 내부 드래그 세션에서 파생되는 상태/이벤트이고 저장·조회 책임은 포함하지 않으므로 분할 없이 유지.
- 의존성 추가 없음. 별도 native draggable 손잡이를 제공하고 키보드·터치는 기존 단계 메뉴를 사용. 손잡이는 Tab 순서와 접근성 트리에 추가하지 않으며 상세 버튼과 형제 요소로 분리.
- 내부 드래그 세션과 일회 토큰을 함께 검사. 외부 데이터, 같은 단계, 중복 drop, 저장 중 카드, Escape/dragend 취소, 필터 변경/원본 제거/원본 단계 변경 이후의 오래된 드래그를 거부.
- 드래그의 시각 상태는 React의 즉시 상태로 처리. 드롭은 기존 onMove와 Query 동기 잠금·낙관적 변경·성공 저장·카드별 롤백·Undo 경로를 재사용. 요청에 transition을 적용하지 않음.
- 가상화 range에 원본 카드 한 개를 별도로 고정. 드래그 중에도 기존 포커스 핀은 유지. 보드 양쪽 가장자리 dragover에서 가로 스크롤하여 숨은 목적지 접근.

## 산출물 / 리뷰와 수정

- `use-candidate-drag.ts`: 세션 시작/검증/취소/드롭과 목적지 상태 및 보드 가장자리 스크롤.
- `board.tsx`: 오른쪽 위 전용 손잡이, 드래그 원본 투명도, 목적지 강조와 status 안내. 메뉴와 상세 버튼의 기본 키보드 동작 보존.
- `virtual-candidate-list.tsx`: 드래그 원본만 추가로 유지.
- `candidates-app.tsx`: 드래그 및 메뉴 이동·되돌리기 안내.
- `dnd.test.tsx`: 13개 결정적 테스트. 카드 1,000명에서 소스 고정/DOM 제한, 가로 스크롤, 중복·취소·외부·stale·pending 방어.
- `candidates-app.test.tsx`: 실제 Query mutation 연결을 통한 드래그 이동, 같은 카드 잠금, 다른 카드 병렬, 실패 카드만 복구, 다른 카드 포커스 유지, 성공 후 Undo 검사.
- 통합 브라우저 1280px 검사에서 하단 손잡이가 단계 배지/메뉴 글자를 줄바꿈시키는 회귀를 발견. 손잡이를 오른쪽 위로 이동하고 상세 제목 영역의 오른쪽 공간을 확보. 통합 담당이 수정 스크린샷에서 하단 복구를 확인.
- DnD 후 Undo 테스트에서 기존 “면접로 되돌리기” 조사가 발견되어 통합 요청에 따라 모든 단계에 “단계로 되돌리기”로 통일하고 기존 Undo 테스트의 기대 문구도 갱신. 동작 변경 없음.
- 통합 담당의 개발 브라우저 확인: native 드래그 서류검토→면접과 역이동, 즉시 저장 중 피드백/상세 포커스/상세 열기와 닫기 정상. production 전체 검증은 통합 기록에 추가 예정.

## 실행한 검증 / 결과

워크트리의 node_modules는 통합이 마련한 링크를 사용하므로 모든 pnpm 명령에 `--config.verify-deps-before-run=false`를 적용.

- `pnpm ... lint`: 통과.
- `pnpm ... typecheck`: strict typecheck 통과.
- `pnpm ... test`: 7 files, **87/87 tests 통과** (기존 73 + 새 14).
- 손잡이 위치 수정 뒤 `pnpm ... exec vitest run src/features/candidates/board.test.tsx src/features/candidates/dnd.test.tsx src/features/candidates/candidates-app.test.tsx`: 34/34 통과.
- 손잡이 위치 수정 뒤 lint/typecheck 재실행 통과.
- 최종 Undo 문구와 테스트 가독성 수정 후 DnD/app 관련 26/26 tests, typecheck, format:check 재통과.
- `pnpm ... format:check`: 통과. 기록과 인계 수정 뒤에도 다시 확인.

## 인계 / 남은 사항

기능 구현 완료. 알려진 기능 결함 없음. native DnD가 지원되는 데스크톱 입력을 대상으로 하며 터치·키보드는 기존 메뉴 경로 사용. 컬럼 내 순서 변경은 범위 밖. production build와 실제 브라우저 최종 Undo·모바일·저장 검증, main 통합/최상위 문서 갱신은 통합 담당이 수행.

워크트리: `/Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/dnd`, 브랜치: `codex/dnd`.


---

# DnD 통합 기록

## 요청과 배정
- 사용자 원문: “선택사항 이어서 진행하자”. STATUS에서 가상화·Undo 완료 및 다음 독립 후보 DnD 확인, 남은 선택사항을 DnD로 해석해 진행.
- 시작 main `ba34e22`, 작업 트리 깨끗함. AGENTS/PLAN/STATUS/DECISIONS와 Undo task/통합 기록 확인.
- 범위 커밋 `8203cf3`, 새 `.worktrees/dnd` / `codex/dnd` 생성. AGENTS의 독립 기능 세션 규칙에 따라 기능 에이전트 배정.
- 실제 위임: `docs/tasks/dnd.md` 읽기, 후보 기능/테스트·task·기록만 소유, native drag handle/기존 메뉴와 mutation 재사용, 외부·같은 단계·저장 중·취소·stale drag 방어, 가상화/포커스/Undo 유지, lint/typecheck/test/format과 커밋 인계.
- git 최초 쓰기 sandbox EPERM은 require_escalated로 재실행 성공. rg 미설치로 find 사용. 추가 의존성 없음.

## 통합 검토와 검증
- 저장·이력 코드는 수정하지 않고 기존 onMove를 재사용함을 확인. 보드 내부 세션 토큰을 소비한 드롭만 이동하고 source 단계/filter/pending 변경 시 취소. 가상 목록은 드래그 원본을 별도로 보존.
- 첫 브라우저 1280px에서 footer에 추가한 손잡이가 단계 badge/메뉴 문구를 두 줄로 만드는 문제 발견. 기능 담당에 수정 요청, 손잡이를 카드 우측 상단으로 옮긴 뒤 screenshot에서 해결 확인.
- 실제 마우스로 최서연 서류검토→면접 드래그 성공, 저장 중 메뉴/새로고침 비활성화와 해당 상세 버튼 포커스 확인. 상세 열기/Escape 복귀 확인. 개발 서버 HMR과 Undo 실행이 겹쳐 Undo 검증은 production에서 다시 수행하기로 함.
- 수정한 상단 손잡이로 면접→서류검토 드래그 성공. reload 후 서류검토 유지 확인, 검색 초기화로 250명 복구. 3102 개발 서버 종료.
- 개발 서버 최초 listen EPERM 후 require_escalated로 실행. webpack 개발 모드 사용, 초기 컴파일 동안 탭 navigation timeout은 기존 생성 탭을 재연결하여 복구.
- 새 앱 테스트 리뷰에서 기존 Undo 문구 “면접로” 발견, “면접 단계로”처럼 단계 이름 뒤 동일 문구를 사용하도록 수정 요청.
- 기능 `ca7687a`를 main `d4ea5f8`로 no-ff 통합. `pnpm format:check && pnpm verify`: format/lint/strict typecheck/7 files **87/87 tests**/production webpack build 통과. tests 16.93s.
- production 3101에서 실제 native drag 두 번 저장 실패 후 카드별 롤백, 세 번째 드래그 성공 확인. 저장 중 새로고침/카드 메뉴 잠금과 상세 버튼 포커스 유지 확인.
- 성공 이동 뒤 Tab/Enter → End/Enter로 `서류검토 단계로 되돌리기` 실행. Undo 저장 성공과 상세 버튼 포커스, reload 후 서류검토 유지 확인.
- 390×844 화면 메뉴 screenshot에서 메뉴/카드 footer가 화면 안에 정상 배치. 검색 초기화로 250명 복구, production console error/warn `[]`.
- viewport override 초기화, production 탭 닫기 및 서버 종료. 개발 탭은 종료한 서버의 연결 오류(data URL) 화면이 되어 browser URL 정책이 재탐색/닫기를 차단함. 우회하지 않고 임시 탭의 턴 종료 자동 정리에 맡김. production은 새 탭에서 정상 검증 완료.
- 새 의존성과 알려진 기능 미해결 결함 없음. 터치/키보드는 단계 메뉴를 사용하며 native 마우스 DnD만 제공. 컬럼 내 순서 변경은 제외.


## Query 추상화·렌더링 경계 추가사항 (2026-09-13)
- 실제 사용자 요청: “워크트리를 파든지 해서 선택 추가사항 적용”. Tailwind canonical ESLint 라이브러리, useQuery 래퍼로 소비처의 ?? 제거, vite alias, 적용 영역별 loading/error fallback, server/client 경계 설정.
- 출력: 독립 codex/candidate-boundaries에서 eslint-plugin-better-tailwindcss 4.7.0/canonical rule/lint:fix, normalized useCandidates, server page, route loading, 보드/상세 render boundary를 구현하고 이전 공통 UI 작업을 합쳤습니다.
- 리뷰: initialData로 빈 배열을 넣지 않아 초기 실패·성공 빈 목록을 구분. cancellation/카드 격리/Undo/DnD/가상화 유지. @ alias는 이미 설정되어 실제 사용하고 중복 설정을 만들지 않음.
- 명령/결과: 기능 `pnpm format:check && pnpm verify` 103/103 tests 및 lint/typecheck/build 통과, canonical lintText 검출/수정 PASS. 최초 isSuccess 반환 누락 1건 수정 후 재검증 성공. main 통합 93a50eb, frozen offline 의존성 설치 성공.
- 브라우저: 초기 skeleton/250명/검색·빈 결과/상세 focus/배경 갱신 보드 유지/reload 필터 복원/390px/console [] 확인. 상세 기록: `docs/records/candidate-boundaries.md`.

- main 최종 `pnpm format:check && pnpm verify`도 format/lint/typecheck/103 tests/build 전체 통과. 검증 기능 브랜치와 main 코드·설정 diff 없음. 최종 결과 및 소유권 인계를 STATUS에 기록했습니다.


## SearchBar 조합·카드 공간 보완 (2026-09-13)
- 실제 요청: “카드 영역 부분 height가 너무 좁음 더 넓혀도 됨. 또한 영역떄문에 카드 하단이 잘려보임”; “SearchBar 같은건데 Input에서 left, right에 돋보기, clearButton 을 넣어서 사용 가능하게 확장성있게”; “초기화 / 새로고침도 ResetButton, ReloadButton 등으로 추상화 가능”.
- 새 독립 기능 codex/search-board-polish/.worktrees/search-board-polish에 src/task/record 소유권 배정. 통합은 기존 화면 치수 확인/코드 리뷰/build/browser/main 통합 수행.
- 출력: Input 좌우 슬롯+clear 동시 조합, 실제 SearchBar, ReloadButton, 높이 max(720px,75vh), virtualizer 끝 padding16px. baseline 432px/끝2.5px → 720px/끝16.5px 실제 측정.
- 리뷰: SearchBar union 타입 손실 및 explicit null 문제 수정. browser에서 global focus outline이 input 내부에 중복되는 문제 발견/한정 CSS 수정. plain Input과 clear 버튼 focus 보존.
- 기능 ccd5a50, main d378dc0. main pnpm format:check && pnpm verify: 108/108 tests + lint/typecheck/format/build 통과. production 390px/slot gap8px/키보드 clear-focus/Reload pending 보드 유지/console[] 확인.
- 자세한 명령·결과는 docs/records/search-board-polish.md 및 search-board-polish-integration.md에 기록.


## DnD 라이브러리·조회 Guard·간결한 닫기 버튼 (2026-09-13)
- 실제 요청: “dnd의 경우 구현 코드가 너무 늘어난다고 판단되어 @dnd-kit 등을 고려하는 방향으로 구현”; “loading은 useQuery 써서 어쩔 수 없다면 차라리 Guard나 Wrapper 등을 사용해 … Suspense와 비슷한 효과”; 상세 `<CloseButton />` 호출 단순화. 커밋 type/scope 영어, 요약 한글.
- 위임: AGENTS에 따라 codex/dnd-kit-migration은 board/card/드래그/실제 센서 회귀, codex/query-guard-close는 query/app/Guard/detail/shared close를 소유. 통합이 의존성 설치와 main/build/browser/공통 기록 담당.
- 출력: @dnd-kit/react/dom 0.5.0, native DnD 수동 처리 제거, 도메인 유효성 유지. CandidateQueryGuard/LoadingGuard, query hook의 재시도 동기 잠금과 transition, 상세 전용 CloseButton 조합.
- 리뷰: 가짜 빈 초기 데이터나 Promise throw 없이 loading/error를 선언적으로 처리. 재시도 observer 타이밍 문제를 훅 안에서 수정. 실제 센서·collision 테스트에서 JSDOM geometry/종료 feedback 완료 시점 보완. timeout/재실행 이력은 각 기능 기록에 유지.
- 상세 명령·결과와 브라우저는 docs/records/dnd-kit-migration.md, query-guard-close.md, dnd-query-integration.md 참조.

- 최종: main 보정783c35f, pnpm format:check && pnpm verify 전체 통과(13 files109 tests, lint/typecheck/format/production build). 예약 fake frame 폐기 원인을 수정했고 maxWorkers1로 검사 CPU 경합 제거. production pointer/취소/저장 격리, 상세 키보드 닫기/focus/Guard refresh/390px/console[] 확인, 테스트 상태/탭/서버 복원.

## 조회 에러 상수화 (2026-09-13)
- 실제 요청: loadErrorMessage 코드를 제시하며 “에러코드 에러메시지 상수화”.
- 새 codex/candidate-error-constants 세션/워크트리에서 에러 코드/메시지 상수, MockApiError 타입 및 API/검증/UI 소비처 변경. 통합은 기록/리뷰/검증 담당.
- 기존 코드 값·안내 메시지·fallback을 유지하며 내부 진단 메시지는 화면에 노출하지 않음. 상세 결과는 docs/records/candidate-error-constants.md 및 candidate-error-constants-integration.md 참조.

- 결과: 기능cce063b/main통합c47a148, 기존31 tests/lint/typecheck/format/build 통과. production 실제 초기 실패 기본 안내/재시도250명 복구/검색 focus/console[] 확인.

## API와 지원자 컴포넌트 배치 (2026-09-13)
- 실제 요청: “api 폴더는 components와 같은 레벨로 빼자”; “candidate 라는 폴더를 만들고 그 하위에 board, card, detail”.
- 독립 codex/candidate-layout에서 src/api/candidate 및 src/components/candidate 역할별 하위 폴더로 이동. 기존 src/features/candidates 도메인 훅/쿼리/스토어/상수/타입/유틸 유지. 테스트는 소스와 함께 이동하고 import/mock 모두 갱신.
- 통합 담당은 README 구조 갱신, 경로/동작 변경 리뷰, production build/browser 확인. 상세 기록: docs/records/candidate-layout.md, candidate-layout-integration.md.

- 결과: 기능6986331/main통합b69e741, 전체109 tests/lint/typecheck/format/build 통과. production 초기 로딩→250명/검색1명/상세/Enter 닫기/focus 복귀/검색 초기화/console[] 확인. 소스72개 기대 경로 대조에서 이동26개 외 로직 변경 없음.
