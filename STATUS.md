# 세션 인계 / 현재 상태

## 현재 결론
기존 필수 구현·검증·문서 작업 완료. 추가 승인된 `concurrent-feedback`(검색 동시 렌더링과 로딩·오류 피드백)은 구현 중입니다. 기준 브랜치는 `main`이며 기존 기능 브랜치와 커밋 이력을 보존했습니다.

## 진행 중
- 기능: `concurrent-feedback`, 브랜치 `codex/concurrent-feedback`, 워크트리 `.worktrees/concurrent-feedback`.
- 구현: `useDeferredValue` 검색·필터 결과, `useTransition` 재시도 Action, 기존 데이터를 유지하는 갱신/오류 처리. 별도 기능 세션이 구현·회귀 테스트를 수행하고 통합 세션이 리뷰·build·브라우저 검증합니다.
- 기존 최종 검증 기록은 아래에 보존하며 후속 기능 검증과 구분합니다.

## 새 세션 시작 순서
1. `AGENTS.md` → `PLAN.md` → 이 문서 → `DECISIONS.md`를 읽습니다.
2. `git status`와 최신 main을 확인합니다. 완료한 과거 기능 브랜치에서 그대로 재개하지 않습니다.
3. 새 요청이 있으면 기능 단위를 정의하고 최신 main에서 새 `codex/<feature>` 브랜치·워크트리·독립 세션을 만듭니다.
4. 기능별 계약은 `docs/tasks`, 실제 프롬프트·검증은 `PROMPTS.md`와 `docs/records`에서 확인합니다.

## 완료된 세션
| 기능 | 브랜치 | 기능 커밋 | 최종 상태 |
|---|---|---|---|
| mock-api | codex/mock-api | 540d933 | 지연/실패/저장/검증, 17 tests |
| board-ui | codex/board-ui | 67b4202, 83422ff | 보드/메뉴/키보드, 8 tests |
| explorer | codex/explorer | 57ca2e9 | Zustand/검색/필터/상세, 9 tests |
| optimistic-update | codex/optimistic-update | 63a3abe | Query/카드별 롤백/잠금, 11 tests |
| board-focus-fix | codex/board-focus-fix | 1d41614 | 메뉴 종료 후 포커스 검증 보강 |
| acceptance-tests | codex/acceptance-tests | a0755c8 | 실제 통합 UI 상태, 5 tests |

## 최종 검증
- `pnpm format:check`: 통과.
- `pnpm verify`: lint → TypeScript strict → 50 tests → production build 전체 통과.
- `next start --port 3101`: 빌드 결과 실행, 250명 렌더/검색/상세/초기화 확인. error/warn 없음. 검증 서버는 종료했습니다.
- 브라우저: 검색·복합 필터·빈 검색·키보드 상세·포커스 복귀·저장중·새로고침 유지·실제 조회 실패 재시도·저장 실패 롤백·모바일390 확인.
- 통합 중 테스트 timeout은 nwsapi@2.2.27 선택자 재진입으로 확인, `jsdom>nwsapi:2.2.23` 고정 후 50/50 통과. 실패/진단 이력은 기록에 남겼습니다.
- Turbopack production CSS 내부 포트 오류 때문에 build는 공식 `--webpack` 옵션을 사용합니다.

## 실행과 다음 작업
2026-09-13 추가 요청 확인: 공통 컨트롤의 기본 HTML 요소 확장, `useTransition`·`useDeferredValue`의 적극적이고 올바른 활용, 일관된 에러·로딩 처리 기준을 AGENTS.md·DECISIONS.md에 반영했습니다. Input/Button과 카드 저장 동시성은 현재 구현을 확인했습니다. 검색의 React 동시성 API는 미적용이며, 이번 변경은 구현 기준 문서화만 포함합니다. 위 최종 검증 결과는 기존 완료 시점의 기록으로, 이번에는 테스트를 재실행하지 않았습니다.

개발 미리보기: http://localhost:3100 (서버가 종료되면 `pnpm dev --port 3100`). 기본 실행은 `pnpm install` → `pnpm dev`입니다.

필수 미완료 없음. Undo·가상화·DnD·로그인·실제 백엔드·다중 탭 동기화·공개 저장소 생성/푸시/배포는 승인 범위 밖입니다. 새 기능 요청 전에는 이 범위를 임의로 확장하지 않습니다.
