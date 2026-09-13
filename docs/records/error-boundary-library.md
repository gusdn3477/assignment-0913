# ErrorBoundary 라이브러리 전환 기록

## 실제 요청과 작업
- 사용자: “errorboudary는 직접 구현 대신 어차피 같은 동작만 정확하게 하는 react-error-boundary와 같은 라이브러리 사용해서 코드 감소 및 좋은 예시 참고”.
- 통합 담당 배정: 독립 codex/error-boundary-library 워크트리에서 boundary 구현/테스트와 task/record만 수정. 통합 담당이 react-error-boundary 6.1.5 설치, 공식 README 확인 및 전체 검증을 담당.
- AGENTS.md, PLAN.md, STATUS.md, DECISIONS.md, docs/tasks/error-boundary-library.md와 설치된 Next use-client 가이드를 읽고 구현했다.

## 출력과 설계 검토
- CandidateErrorBoundary를 함수 wrapper로 변경했다. label/children/onRecover 계약과 기존 세 사용처는 유지한다.
- 공식 [README quick start](https://github.com/bvaughn/react-error-boundary#readme)의 fallbackRender/resetErrorBoundary/onReset 조합을 사용한다. 오류 포착/state/reset은 라이브러리에 맡기고 앱은 영역별 안내와 RetryButton UI만 조합한다.
- 설치된 dist/react-error-boundary.d.ts 및 실행 JS에서 resetErrorBoundary가 onReset 호출 후 오류 상태를 초기화함을 확인했다. onRecover를 onReset에 바로 연결해 기존 복구 원인 제거→재렌더 순서를 유지한다.
- 오류 객체를 fallback 문구에 표시하지 않는다. Query/API 오류의 inline/toast 경로는 유지하고 resetKeys/QueryErrorResetBoundary/별도 상태를 추가하지 않았다.
- 상세 key={selectedId} remount 계약을 유지한다. onRecover 없는 보드 재시도도 라이브러리 reset으로 처리한다.
- 프로덕션 boundary 파일은 `git show HEAD:... | wc -l` 기준 기존 49행에서 38행으로 11행 감소했다. 직접 Component 상속, failed state, getDerivedStateFromError, 조건 분기와 setState 책임을 제거했다. 테스트/기록 증가를 프로덕션 감소로 집계하지 않는다.
- Next 설치 문서 `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`에 따라 use client 경계를 유지한다. callback을 전달하는 소비처는 기존 client 내부이며 서버 직렬화 경계를 넘기지 않는다.

## 검증
- `node_modules/.bin/vitest run src/components/candidate/error-boundary/candidate-error-boundary.test.tsx src/components/candidate/app/candidates-app.test.tsx`: 2 files, 17/17 통과. 실제 라이브러리를 사용하며 mock하지 않는다.
- 기존 영역 격리/내부 오류 비노출/복구 검증에 onRecover 단 1회 검증 추가. 지속 오류 재시도 fallback 유지와 callback 없는 재시도 성공, 후보 key 교체 시 새 내용 복구 및 onRecover 미호출을 검증한다.
- `node_modules/.bin/eslint . && node_modules/.bin/tsc --noEmit && node_modules/.bin/prettier --check src *.ts *.mjs *.json`: 모두 통과 (exit 0).
- production build와 브라우저 확인은 통합 담당의 후속 기록으로 구분한다.

## 남은 사항
기능 구현 미해결 사항 없음. 통합 검증 대기.
