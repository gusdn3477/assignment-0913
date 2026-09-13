# 프롬프트와 검증 기록

기능별 실제 지시, 출력 요지, 검증 결과와 판단을 기록합니다. 사용자 검증과 에이전트 검증을 구분하며 수행하지 않은 검증은 기록하지 않습니다.

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

## 최종 검증 및 기능별 원문

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
