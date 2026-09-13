# DnD lifecycle fix 기록

## 실제 요청

> 이름 바꾸자 hook은 네이밍 저렇게 하기로. agents.md에 명시
> 다만 dnd 시에 에러 떠서 fix 작업 필요
>
> flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task.

후속으로 라이브러리 문제라면 다른 라이브러리로 교체해도 된다는 승인을 받았습니다.

## 조사와 결정

- 설치된 Next 16 문서의 Client Component/custom hook 경계를 확인했습니다.
- `@dnd-kit/react` 0.5.0은 provider 이벤트를 transition으로 추적하며, drag source 동기 갱신은 microtask 뒤 `flushSync`하도록 구현되어 있었습니다.
- `@tanstack/react-virtual` 3.14.12 React adapter는 `useFlushSync` 기본값이 `true`이며, 측정값 변경을 동기 처리할 때 `flushSync(rerender)`를 직접 호출합니다.
- 실제 앱은 DnD 성공 즉시 Query 캐시를 낙관적으로 바꾸고 카드를 다른 가상 컬럼으로 remount합니다. 새 행의 ref 측정이 React commit/lifecycle 안에서 virtualizer의 동기 렌더를 요청할 수 있어 보고된 경고와 일치합니다.
- virtualizer가 제공하는 공개 옵션 `useFlushSync: false`를 선택했습니다. 경고를 필터링하거나 라이브러리를 patch하지 않고 React가 렌더를 예약하게 합니다. 기존 가상화 회귀 검사가 모두 통과했으므로 dnd-kit 교체는 불필요했습니다.

## 구현과 리뷰

- `useCandidateDrag` / `use-candidate-drag.ts`를 구체적인 단계 이동 역할이 드러나는 `useCandidateStageDrag` / `use-candidate-stage-drag.ts`로 변경했습니다.
- `AGENTS.md`에 custom hook은 구체적인 도메인 동작으로 이름 짓고 파일명과 일치시킨다는 규칙 및 이번 예시를 추가했습니다.
- 각 후보 가상 목록의 `useVirtualizer`에 `useFlushSync: false`를 설정했습니다.
- 실제 sensor → optimistic mutation → 컬럼 remount 흐름에서 카드 측정값이 estimate와 다른 조건을 만들고, 보고된 lifecycle `flushSync` 경고가 발생하지 않는지 검사하도록 기존 통합 테스트를 보강했습니다.
- 검토 결과 stale drag, pending exclusion, 같은 단계/밖 드롭/취소, 중복 종료, rollback, Undo, 가상화 focus 및 접근성 코드는 변경하지 않았습니다.

## 명령과 결과

- `pnpm install --offline --frozen-lockfile`: 성공.
- DnD/가상화/app 대상 검사: 3 files, 32 tests 통과.
- `pnpm format:check && pnpm verify`: format, ESLint, strict TypeScript, 13 files 113 tests, Next webpack production build 모두 통과.
- 개발 브라우저 포인터 DnD: 서류검토 카드가 처우협의로 이동하고 포커스가 이동 카드에 복원됨. `flushSync was called from inside a lifecycle method` console error/warn 0건.

## 남은 문제

없음.
