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
| mock-api | codex/mock-api / .worktrees/mock-api | 540d933 완료·병합, 17 tests |
| board-ui | codex/board-ui / .worktrees/board-ui | 67b4202/83422ff 병합, 7 tests 통과·포커스 1 timeout 후속 진단 |
| explorer | codex/explorer / .worktrees/explorer | 57ca2e9 완료·병합, 9 tests |
| optimistic-update | codex/optimistic-update / .worktrees/optimistic-update | 63a3abe 완료·병합, hook 11 tests |
| board-focus-fix | codex/board-focus-fix / .worktrees/board-focus-fix | 새 수정 세션: 동기 메뉴 해제 타이밍 진단 |
| acceptance-tests | codex/acceptance-tests / .worktrees/acceptance-tests | 새 세션: 실제 통합 UI 상태 테스트 |

## 다음 작업
통합 화면 a2dacf1 커밋 완료. 포커스 수정과 acceptance 테스트를 병합한 뒤 전체 lint/typecheck/test/build를 실행하고 문서를 최종 정리합니다.

## 운영 규칙
- 통합 담당자가 기능 시작·병합·검증 완료 때마다 이 문서를 갱신합니다.
- 기능 담당자는 자기 task/record 문서만 갱신하여 공유 문서 충돌을 방지합니다.
- 전체 지시·설계는 `PROMPTS.md`, `DECISIONS.md`에서 확인합니다.
- 실행: `pnpm dev`; 검사: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

## 검증 결과
- pnpm install 완료. pnpm typecheck 통과. pnpm lint 오류 없음, PostCSS 익명 export 경고 수정.
- 공통 기반 pnpm build 통과. shadcn CLI가 외부 cn 패키지를 사용한 것을 발견하여 로컬 cn으로 교체하고 별도 수정 커밋 74e4736 보존.
- mock-api 17 + explorer 9 + queries 11 = 통합 37 tests 통과(캐시 중복 제외), 3.32s.
- 개발 서버 http://localhost:3100 실행 중(session 75477). UI/브라우저 검증은 board-ui 병합 후 진행합니다.
- 브라우저: 검색·복합 필터·빈 검색·상세 키보드·새로고침 영속성·실제 15% 저장 실패 롤백·포커스·모바일390 확인, error/warn 없음. 상세는 docs/records/browser-qa.md.
