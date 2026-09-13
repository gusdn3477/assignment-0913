# concurrent-feedback 실행 기록

## 실제 요청과 배정
사용자: `useTransition. useDeffredValue 같은 동시성 기능 적극 활용도 좀 넣고 에러 처리나 로딩 처리도 좀 깔끔하게`, 이어서 `작업 시작`.

통합 에이전트 배정: `Implement bounded feature in [기능 작업 공간] on [기능 브랜치].` 검색/직무의 안정된 값을 지연하고 메모 경계를 두되 mutation 데이터/잠금은 즉시 반영한다. 명시적 조회 재시도에는 React async Action을 적용한다. 최초 skeleton/안전한 오류 복구, 배경 갱신 중 데이터 유지, 저장 중 갱신 제외, 관련 회귀 검증을 소유한다.

## 읽은 자료
- 주 체크아웃의 최신 AGENTS.md 및 이 워크트리의 PLAN.md, STATUS.md, DECISIONS.md, docs/tasks/concurrent-feedback.md.
- frontend-fundamentals readability SKILL.md: 오류/갱신 UI를 별도 작은 컴포넌트로 분리하고 복합 상태에 이름 부여.
- 설치된 Next `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`: 예상 가능한 요청 실패는 명시적 UI로 처리, 렌더 예외 경계는 기존 경계 유지.
- 통합 에이전트가 React 공식 useTransition/useDeferredValue 문서 확인. 실제 공유 설치 React 19.3.0, Next 16.3.5, Query 5.102.8.

## 결과와 결정
- 검색/직무 객체를 useMemo + useDeferredValue로 처리. 입력은 Zustand에 즉시 반영. 필터 개수/빈 상태/보드는 동일한 지연 필터 결과를 사용. CandidateBoard에 memo 경계를 두어 긴 보드가 긴급 입력에 따라 불필요하게 재렌더하지 않음.
- 카드 데이터/잠금은 지연하지 않음. 서로 다른 카드 병렬 저장, 같은 카드 요청 제외 및 카드별 롤백은 기존 계약 유지.
- 명시적 목록 retry/refresh를 useTransition async Action으로 추적. Query의 외부 상태 변경을 비차단 상태로 취급하지 않으며 ref 잠금을 별도로 사용. 저장 중 목록 갱신을 막고 기존 mutation의 query 취소를 유지.
- 첫 로딩 skeleton을 실제 보드의 5열/최소 너비와 일치. 최초 실패는 retry 버튼을 로딩 중에도 유지. 재시도 성공 시 없어진 버튼의 포커스를 검색창으로 복구하되 사용자가 다른 요소에 둔 포커스를 훔치지 않음.
- 배경 갱신 실패는 기존 카드/검색/상세를 유지하며 작은 오류와 재시도 제공. MockApiError의 storage/corrupt-storage 코드에 맞는 안전한 복구 안내, 임의 내부 error.message 노출 없음.
- 검색 개수는 aria-live=off인 명명된 상태로 두어 키 입력마다 읽지 않음. 지연 결과의 aria-busy/시각 피드백 제공. 조회 pending은 별도의 작은 live status.
- 공통 Input/Button은 기존 native props 확장/전달 구현을 유지; 추가 의존성 없음.

## 검토와 수정
- 통합 리뷰: paragraph의 aria-label 대신 role=status + aria-live=off를 사용해 유효한 의미론 유지. 적용.
- 통합 리뷰: 최초 retry 성공 후 포커스 복구, 반복 실패, 저장/목록 갱신 경쟁, 안전한 저장소 오류 분류를 확인. 구현 및 테스트 적용.
- 최초 실행 5개 기존 app 테스트 통과 후 회귀 항목을 추가. 테스트를 생략하거나 timeout을 늘리지 않음.

## 실제 명령 / 결과
- `pnpm exec prettier --write ...`: symlink node_modules에서 pnpm 자동 install 시도 후 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` 발생. 공유 의존성을 변경하지 않고 설치된 바이너리로 실행.
- `node_modules/.bin/prettier --write` (소유 TSX 4개): 통과.
- `node_modules/.bin/vitest run src/features/candidates/candidates-app.test.tsx`: 11/11 통과.
- `node_modules/.bin/eslint .`: 통과.
- `node_modules/.bin/tsc --noEmit`: 통과.
- `node_modules/.bin/vitest run`: 5 files, 56/56 통과. 기존 50개 + 새 6개 (it.each 포함).
- `node_modules/.bin/prettier --check` (소유 TSX 4개): 통과.
- `git diff --check`: 통과.

## 인계 / 남은 일
기능 코드와 자동 검증 완료. 통합 에이전트가 main 통합 후 production build와 실제 브라우저 확인, STATUS/PROMPTS를 갱신한다. 알려진 기능 미해결 없음. 강제 지연/성능 수치 테스트 대신 실제 비동기 요청과 최종 UI 일관성 검증을 사용했다. 검색은 250명 범위이며 가상화는 원래 제외 범위다.
