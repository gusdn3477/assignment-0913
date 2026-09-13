# Repository working agreement

## Start here
Read `PLAN.md`, `STATUS.md`, `DECISIONS.md`, and your assigned `docs/tasks/<feature>.md` before work. STATUS is the live handoff; PLAN is the accepted scope.

## Feature sessions
- One independently verifiable feature per fresh agent session and `codex/<feature>` worktree. Feature boundaries may change with dependencies.
- Work only in your assigned worktree and owned files. Main checkout is for integration.
- At most three feature agents alongside the integration agent. Coordinate shared types, UI primitives, package.json and lockfile changes with the integration agent.
- Do not reuse a completed feature session for a different feature.

## Implementation
- TypeScript strict; React/Next App Router; Tailwind and cn; shadcn; TanStack Query for candidate data; Zustand for UI state.
- Additional dependencies are allowed when justified. Document the decision and let integration install them.
- Preserve keyboard interaction, card-scoped rollback, same-card request exclusion, and successful-write-only persistence.
- Validate stored data at runtime. Never persist optimistic candidate state through Zustand.
- No external messages, publishing, deployment, force-push, or squash as part of this scope.

## Verification and records
- Run relevant tests, lint and typecheck for your feature. Integration runs production build and browser checks.
- Record actual prompt, output, review, commands/results, decisions and remaining issues in `docs/records/<feature>.md`.
- Update your task handoff before committing. Integration updates STATUS and compiles records into PROMPTS.md at feature milestones.
- Commits use `type(scope): summary`. Keep unrelated features separate; preserve correction commits.
- Finish with worktree path, branch, SHA, verification evidence and open issues.

## Commands
`pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm verify`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
