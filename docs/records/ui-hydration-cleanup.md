# ui-hydration-cleanup

## 실제 요청

- `void Promise.resolve(useCandidateUI.persist.rehydrate()).finally(...)`에서 불필요한 `void` 제거
- 불필요한 영어 주석 제거
- 커밋 메시지에 AI 초안을 손본 내용 기록

## 판단

- Zustand의 `rehydrate()` 반환형은 `Promise<void> | void`이므로 `Promise.resolve`는 동기·비동기 저장소 양쪽에서 `finally`를 실행하기 위해 유지한다.
- 현재 ESLint 설정에는 미처리 Promise를 금지하는 규칙이 없고 effect 본문도 값을 반환하지 않으므로 선두 `void`는 제거한다.
- `safeStorage`와 `useHydrateCandidateUI` 구현을 그대로 설명하던 영어 주석만 제거한다. 동작상 중요한 예외 무시는 빈 `catch`로 유지한다.

## 검증

- `node_modules/.bin/prettier --check src/features/candidates/stores/ui-store.ts docs/tasks/ui-hydration-cleanup.md docs/records/ui-hydration-cleanup.md`: 통과
- `node_modules/.bin/eslint .`: 통과
- `node_modules/.bin/tsc --noEmit`: 통과
- `node_modules/.bin/vitest run src/components/candidate/toolbar/explorer.test.tsx`: 1 file, 9 tests 통과
- `git diff --check`: 통과

워크트리의 의존성 링크를 준비하기 전 실행한 `pnpm exec`은 네트워크가 제한된 환경에서 자동 설치를 시도해 중단했다. 공유 `node_modules`를 연결한 뒤 설치 없이 프로젝트 바이너리로 위 검증을 완료했다.
