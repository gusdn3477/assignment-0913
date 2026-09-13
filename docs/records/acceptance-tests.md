# Acceptance test record

## Actual assignment

“Implement ONE feature integration acceptance tests in [기능 작업 공간] branch [기능 브랜치] start a2dacf1. Read AGENTS PLAN STATUS and app source. Own ONLY src/features/candidates/candidates-app.test.tsx, docs/tasks/acceptance-tests.md, docs/records/acceptance-tests.md. Test real CandidatesApp+Providers with mocked candidateApi deterministic promises: initial loading, query failure+retry, empty dataset vs filtered empty, search/filter composition, failed save UI rollback+toast if manageable; preserve actual UI not mock hooks/children. No fragile long waits, no package changes. Existing board focus bug being fixed independently, don't edit board. Run your targeted tests, write actual prompt/evidence, commit test(acceptance). No agents. Report SHA/tests/issues.”

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
