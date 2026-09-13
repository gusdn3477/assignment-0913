# dnd-lifecycle-fix

## 요청/소유권

사용자: 후보 단계 DnD 훅을 역할이 드러나는 `useCandidateStageDrag`로 변경하고 훅 네이밍 기준을 `AGENTS.md`에 명시. 실제 드래그 시 발생하는 React `flushSync was called from inside a lifecycle method` 오류 수정.

독립 `[기능 브랜치]` / `[기능 작업 공간]`. 소유: `AGENTS.md`, 후보 DnD 훅과 사용처/관련 테스트, 이 task/record. 기존 동작과 의존성은 유지합니다.

## 계약

- 훅 파일/함수 이름을 `use-candidate-stage-drag.ts` / `useCandidateStageDrag`로 맞추고 import를 갱신합니다.
- `AGENTS.md`에 훅 이름은 관리하는 도메인 동작이 드러나게 짓는다는 기준과 이번 예시를 추가합니다.
- 경고를 필터링하지 않고 DnD 상태 변경이 React lifecycle 안에서 중첩 flush를 유발하지 않도록 호출 시점을 수정합니다.
- stale source, pending, 같은 단계/밖 드롭/취소, 중복 종료, mutation/Undo/가상화/접근성 계약을 유지합니다.
- 관련 회귀 테스트, lint, typecheck, format을 실행하고 실제 원인과 결과를 record에 남깁니다.

## 인계

- 구현 완료: 훅 파일/함수를 `use-candidate-stage-drag.ts` / `useCandidateStageDrag`로 변경하고 사용처 import를 갱신했습니다.
- `AGENTS.md`에 custom hook은 구체적인 도메인 동작을 이름에 포함하고 파일명과 맞춘다는 규칙을 추가했습니다.
- 원인은 DnD 종료의 카드 컬럼 이동/remount와 TanStack Virtual 기본 synchronous `flushSync` 렌더가 React lifecycle에서 겹칠 수 있는 조합입니다. `useVirtualizer({ useFlushSync: false })`로 React scheduler에 렌더를 맡겼습니다. dnd-kit 교체는 필요하지 않았습니다.
- 실제 mutation DnD 테스트에 비표준 측정 높이와 해당 lifecycle 경고 부재 검증을 추가했습니다.
- `pnpm format:check && pnpm verify`: format/lint/typecheck/13 files 113 tests/webpack production build 통과.
- 실제 개발 브라우저 pointer DnD 단계 이동 성공, 이동 뒤 해당 `flushSync` console error/warn 0건 확인. 미해결 이슈 없음.
