# concurrency-simplification

## 요청
동시성 관련 함수는 Input 입력 시 CardList에만 있으면 될 것 같고 이외 useTransition은 과해 보인다는 사용자 요청.

## 소유 및 계약
새 codex/concurrency-simplification / .worktrees/concurrency-simplification. use-candidates.ts, CandidateQueryGuard, CandidatesApp, 관련 테스트 및 task/record 소유.
새로고침/재시도의 transition을 제거하고 Query 조회 상태로 pending 처리. 최초 오류 재시도 버튼 유지/중복 차단/성공 후 focus/배경 데이터 유지/카드 저장 취소 계약 보존. useDeferredValue는 검색 문자열만 지연하고 job과 캐시 데이터/카드 잠금은 즉시 반영. 결과 수/빈 상태/보드는 동일 결과 사용.

## 완료 인계
useTransition/isRetryPending/isRefreshing 제거. Query isFetching으로 pending, isFetched로 최초 오류 재시도 중 패널 유지. ref 잠금은 동일 렌더 내 중복 요청 방지에 유지. useDeferredValue(search)만 남겼으며 직무는 즉시 적용. lint/typecheck/app14 tests/변경 파일 format/diff-check 통과. 미해결 기능 이슈 없음.
