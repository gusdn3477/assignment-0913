# Acceptance tests handoff

- Assigned scope: real CandidatesApp and Providers with only candidateApi mocked; loading, query failure/retry, empty states, filter composition, optimistic save failure.
- Owned: src/features/candidates/candidates-app.test.tsx and this feature's task/record files.
- Start: a2dacf1; branch [기능 브랜치]; worktree [기능 작업 공간].
- Implemented five tests. Four loading/query/empty/filter tests pass together. The unskipped movement test remains blocked by the Radix/async Query interaction in jsdom and requires integration investigation before accepting the full suite.
- No production code or dependencies changed. Targeted ESLint and TypeScript pass.
- Integration should rerun the complete file after resolving async menu-test execution; browser movement/rollback checks are owned by integration.

## 통합 후 최종 상태
JSDOM 선택자 엔진의 지연 원인을 CPU profile로 확인하고 하위 의존성 override로 해결했습니다. 기존 테스트를 모두 유지한 채 통합 50 tests가 통과했습니다. 상세: [test-environment-fix](../records/test-environment-fix.md).
