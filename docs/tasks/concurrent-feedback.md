# concurrent-feedback

## Scope / ownership
- User request: `useTransition. useDeffredValue 같은 동시성 기능 적극 활용도 좀 넣고 에러 처리나 로딩 처리도 좀 깔끔하게`, followed by `작업 시작`.
- Own candidates-app.tsx, candidate-toolbar.tsx, new scoped feedback components, candidates-app.test.tsx, this task and docs/records/concurrent-feedback.md.
- Native Input/Button props already implemented; no dependency/shared component changes.
- Defer memoized search/job results while inputs remain immediate. Keep mutation data and locks live.
- Explicit retry uses React 19 async transition Action with separate request exclusion. Keep initial retry panel stable and retain existing data on refresh failure; safe Korean errors and scoped accessible pending feedback.

## Verification / handoff
Implementation complete. Feature app tests 11/11, full suite 56/56, ESLint, strict TypeScript, owned-file formatting and git diff --check passed. See docs/records/concurrent-feedback.md for actual commands and review. Integration owns production build/browser and main STATUS/PROMPTS. No open feature issues; no dependency changes.
