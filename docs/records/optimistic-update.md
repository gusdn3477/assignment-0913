# optimistic-update 작업 기록

## 실제 작업 지시

> Implement ONE feature optimistic-update in [기능 작업 공간] branch [기능 브랜치] start 74e4736. Read AGENTS.md PLAN.md STATUS.md docs/SESSION_GUIDE.md docs/tasks/optimistic-update.md. Existing candidateApi mock ready. Implement queries.ts hooks exactly task contract plus strong deterministic hook tests of optimistic apply, isolated rollback, overlap/duplicate prevention, reverse success. Direct ./node_modules/.bin/{vitest,tsc,eslint} recommended to avoid pnpm linked-dir auto-install. Own queries/tests/task/record only. Record actual prompt & tests, commit feat(optimistic-update), report SHA/evidence. No agents. Root handles integration app.

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

워크트리: `[기능 작업 공간]`

브랜치: `[기능 브랜치]`

완료: 기능 구현·독립 검증. 미완료/알려진 문제 없음. 통합 담당자가 앱 연결, production build, 브라우저 검증, STATUS 및 PROMPTS 갱신을 수행합니다.
