# concurrency-simplification

## 실제 요청
“동시성 관련 함수는 Input 입력 시 CardList 부분에만 있으면 될 것 같은데 이외 useTransition 등은 좀 과해보여”

## 결과 및 리뷰
- useCandidates의 useTransition/비동기 Action과 파생 isRetryPending/isRefreshing 제거. Query isFetching이 조회 중 표시를 직접 담당.
- 최초 실패 후 refetch는 status를 pending으로 바꾸므로 isError만 검사하면 재시도 버튼이 사라진다. Query isFetched(성공/오류 update count 합이 0 초과)와 hasData를 조합해 최초 오류 패널/버튼/focus를 유지한다. 별도 상태 변수 추가 없음.
- retryInFlight ref는 Query 렌더 전 연속 호출을 막는 요청 잠금이므로 유지. finally 해제, cancelRefetch:false, throwOnError:false 및 카드 mutation의 조회 취소 보존.
- useDeferredValue는 검색 문자열만 지연. 입력/직무/지원자 데이터/카드 잠금 즉시 반영. memo 보드와 결과 개수/빈 상태는 같은 지연 검색 결과를 표시한다.
- Next 설치 use-client 문서, 설치 QueryCore query.ts isFetched/fetchState와 queryObserver.ts 상태 매핑 확인.

## 검증
공유 node_modules 링크를 사용하고 자동 설치를 피하기 위해 설치된 bin을 실행.
- node_modules/.bin/prettier --write 변경3파일: 완료.
- node_modules/.bin/eslint .: 통과.
- node_modules/.bin/tsc --noEmit: 통과.
- node_modules/.bin/vitest run src/components/candidate/app/candidates-app.test.tsx: 14/14 통과. 초기 오류/재시도/동일 버튼/포커스/중복 제외, 배경 오류/복구, 연속 입력, 필터 초기화, refresh 취소/카드 잠금, rollback/Undo/DnD 포함.
- git diff --check: 통과.

## 인계
codex/concurrency-simplification / .worktrees/concurrency-simplification. 의존성 추가 없음. 기능 미해결 이슈 없음. 통합 build/browser 후 기록 추가.
