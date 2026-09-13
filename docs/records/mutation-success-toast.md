# mutation-success-toast 작업 기록

## 요청

“또한 성공 시에도 토스트 띄워줘.”

## 구현 / 판단

- `useMoveCandidate`의 `onSuccess`에서 Query cache를 서버 응답으로 확정하고 Undo 이력을 갱신한 뒤 `toast.success`를 호출한다.
- 일반 이동은 “단계 이동을 저장했습니다.”, Undo는 “단계 되돌리기를 저장했습니다.”로 구분한다.
- 동시 저장 시 어느 카드의 결과인지 알 수 있도록 description에 `지원자 이름 · 확정 단계`를 표시한다.
- API가 성공하기 전 낙관적 상태에는 토스트를 띄우지 않으며 기존 실패 토스트와 rollback은 유지한다.

## 검증

- 일반 단계 이동 성공과 Undo 성공의 title/description을 hook test로 검증한다.
- 실제 CandidatesApp acceptance test에서 일반 이동 및 Undo 성공 토스트가 화면에 노출되는지 검증한다.
- 대상 Prettier/ESLint 및 strict TypeScript 통과.
- `vitest run src/features/candidates/hooks/candidate-queries.test.tsx src/components/candidate/app/candidates-app.test.tsx`: 2 files, 36/36 tests 통과.
- 실제 브라우저에서 mutation 실패 토스트를 한 번 재현한 뒤 재시도 성공 토스트 `단계 이동을 저장했습니다. / 최서연 · 면접`을 확인했다. 이후 Undo 성공 토스트 `단계 되돌리기를 저장했습니다. / 최서연 · 서류검토`를 확인해 테스트 데이터를 원래 단계로 복구했다. console error/warn 없음.

## 남은 이슈

- 없음.
