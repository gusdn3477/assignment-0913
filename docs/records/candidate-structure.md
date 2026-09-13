# candidate-structure 실제 작업 기록

## 요청

사용자: “선택사항 추가” 1) 공통 Input clearButton, 버튼 종류 래퍼, Header left/center/right, 용도별 skeleton 2) 컴포넌트별 폴더와 상수·유틸·타입·훅·API·query key 분리 3) 가능하면 useSuspenseQuery 및 queryOptions 4) 입력 변경처럼 공통 로직의 작은 훅 추상화, 억지 적용 불필요.

통합 배정: candidate-structure 워크트리에서 candidates 도메인 및 page import만 소유. 카드·헤더·metric·skeleton 추출, 책임별 디렉터리, 실제 queryOptions 적용, 기존 87 tests와 취소·롤백·Undo·DnD·포커스 보존. 공통 Input/Header/버튼 연결은 통합 담당.

## 결과와 리뷰

- components/<component>로 구현과 관련 테스트 배치. CandidateCard, WorkspaceHeader, CandidateMetric, BoardSkeleton, CandidateCardSkeleton을 실제 호출부에서 사용.
- constants(단계·직무·스타일·저장키·검색 길이), types(도메인·API 옵션), utils(검증·취소 가능한 지연·필터), api, queries, hooks, stores로 분리. 도메인 밖으로 흩어놓지 않고 candidates 내부 응집도 유지. 긴 상대 경로와 호환 re-export 없음.
- query key와 queryOptions factory 분리. useCandidates가 candidatesQueryOptions()를 실제 호출하며 AbortSignal 전달 유지. move store는 QueryClient별 WeakMap을 보존하고 mutation 훅은 취소·카드별 잠금·카드별 rollback·성공 Undo 이력 정책을 그대로 유지.
- useCandidateSearch는 value/setValue/onChange/clear를 노출. toolbar는 value/onChange 사용, 공통 Input의 clearButton은 통합 담당이 clear에 연결. 입력 상태는 즉시 Zustand 반영. 단순 useState 래퍼는 추가하지 않음.
- BoardSkeleton은 STAGES 기준 컬럼과 toolbar 공간을 유지. 카드 skeleton은 가상화 기본 추정값과 같은 174px, avatar/title/date/footer 구조. CandidateMetric은 숫자 로딩 동안 라벨·설명을 유지하는 기존 부분 skeleton을 사용하므로 1줄 MetricSkeleton을 추가하지 않음.

## useSuspenseQuery 검토

설치된 `node_modules/@tanstack/react-query/src/useSuspenseQuery.ts`에서 `enabled: true`, `suspense: true`, `throwOnError: defaultThrowOnError`, `placeholderData: undefined` 강제를 확인했다. 공식 [useSuspenseQuery 문서](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useSuspenseQuery)는 cancellation 미지원과 disabled 상태 불가, 초기 오류 boundary 및 reset 경로를 명시한다.

현재 유일한 조회는 browser localStorage 기반이고 mutation이 먼저 시작한 조회를 cancelQueries로 취소하여 낙관적 값을 보호한다. 기존 초기 오류의 inline 재시도·대기 버튼 유지·성공 후 검색창 포커스 복구도 유지해야 한다. 따라서 현재 조회에는 useQuery+queryOptions를 적용하고 useSuspenseQuery는 도입하지 않았다. 데이터가 보장된다는 타입 이점만을 위해 cancellation 및 복구 계약을 교체하지 않는다. 사용하지 않는 suspense hook도 추가하지 않는다.

## 읽은 지침

AGENTS.md / PLAN.md / STATUS.md / DECISIONS.md / docs/tasks/candidate-structure.md, 설치된 Next `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`, frontend-fundamentals cohesion skill. 처음 `.mdx` 경로를 조회했으나 파일 없음으로 확인 후 rg로 실제 `.md`를 찾아 읽고 코드 작업 시작.

## 검증

- `pnpm --config.verify-deps-before-run=false typecheck`: 통과 (분리 초기 및 API 옵션 추출 후).
- `pnpm --config.verify-deps-before-run=false lint`: 통과.
- `pnpm --config.verify-deps-before-run=false test`: 기존 7 files / 87 tests 모두 통과. query AbortSignal 취소, 병렬 rollback, 입력 persistence, Undo, DnD, 1,000건 가상화와 전체 Tab 탐색 포함. 실행 39.84s.
- `pnpm --config.verify-deps-before-run=false exec prettier --write ...`: 변경 파일 포맷 적용.
- 최종 `pnpm --config.verify-deps-before-run=false format:check` 및 lint 재확인 통과. `git diff --check` 통과.

## 남은 통합

공통 Input clearButton/Header/의미별 버튼 API 소비 연결 및 toolbar clear의 직무 보존·포커스 동작 검증은 통합 담당. 기존 explorer가 검색 onChange/persistence를 검증하므로 동일 훅만 반복 검증하는 테스트는 추가하지 않음. Production build·브라우저 검증도 통합 담당. 기능 자체 알려진 결함 없음.
