# 세션 인계 / 현재 상태

## 새 세션 시작 순서
1. 이 문서와 `DECISIONS.md`, 배정된 `docs/tasks/<feature>.md`를 읽습니다.
2. 지정 워크트리의 브랜치·Git 상태를 확인합니다. 다른 기능 파일은 수정하지 않습니다.
3. 구현·검증 결과를 `docs/records/<feature>.md`에 실제 내용으로 기록하고 커밋합니다.
4. 통합 담당자에게 SHA·검증 결과·미완료 항목을 전달합니다.

## 현재 상태
- 초기 저장소: main, 기존 코드·커밋 없음.
- 공통 기반과 shadcn 8개 컴포넌트 설치 완료. TypeScript 검사 통과, lint 경고 1개 수정.
- 공통 기반 커밋: `12ed483`.
- 통합 브랜치: `codex/integration`.

| 기능 | 브랜치 / 워크트리 | 상태 |
|---|---|---|
| mock-api | codex/mock-api / .worktrees/mock-api | 독립 세션 구현·테스트 중 |
| board-ui | codex/board-ui / .worktrees/board-ui | 독립 세션 구현·테스트 중 |
| explorer | codex/explorer / .worktrees/explorer | 독립 세션 구현·테스트 중 |

## 다음 작업
mock-api 병합 후 새 optimistic-update 세션을 시작합니다. 통합 담당자는 화면 연결과 문서 갱신을 준비합니다.

## 운영 규칙
- 통합 담당자가 기능 시작·병합·검증 완료 때마다 이 문서를 갱신합니다.
- 기능 담당자는 자기 task/record 문서만 갱신하여 공유 문서 충돌을 방지합니다.
- 전체 지시·설계는 `PROMPTS.md`, `DECISIONS.md`에서 확인합니다.
- 실행: `pnpm dev`; 검사: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

## 검증 결과
- pnpm install 완료. pnpm typecheck 통과. pnpm lint 오류 없음, PostCSS 익명 export 경고 수정.
