# Acceptance tests handoff

- Assigned scope: real CandidatesApp and Providers with only candidateApi mocked; loading, query failure/retry, empty states, filter composition, optimistic save failure.
- Owned: src/features/candidates/candidates-app.test.tsx and this feature's task/record files.
- Start: a2dacf1; branch codex/acceptance-tests; worktree .worktrees/acceptance-tests.
- Implemented five tests. Four loading/query/empty/filter tests pass together. The unskipped movement test remains blocked by the Radix/async Query interaction in jsdom and requires integration investigation before accepting the full suite.
- No production code or dependencies changed. Targeted ESLint and TypeScript pass.
- Integration should rerun the complete file after resolving async menu-test execution; browser movement/rollback checks are owned by integration.
