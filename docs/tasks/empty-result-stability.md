# empty-result-stability

## 요청 / 소유권

검색 결과가 없을 때 보드 높이가 급격히 줄어 사용자의 문서 내 위치가 달라지는 문제를 수정한다. `codex/empty-result-stability` 워크트리에서 CandidateEmptyGuard와 관련 acceptance test 및 기록을 소유한다.

## 계약

- 검색 결과 유무와 무관하게 결과 영역은 가상 목록의 최대 높이와 컬럼 헤더를 포함할 수 있는 동일한 최소 높이를 유지한다.
- 빈 결과 안내와 검색 조건 초기화, 정상 결과의 children 반환 계약을 유지한다.
- 이름 입력은 즉시 반영하고 deferred 결과 수와 빈 상태를 일치시키는 기존 동작을 유지한다.
- mutation 실패는 기존 카드별 롤백과 Sonner 오류 토스트를 유지하며, 조회 실패는 영역 내 재시도 UI를 유지한다.

## 완료 기준

검색 결과가 있는 상태와 없는 상태에서 동일한 결과 컨테이너와 최소 높이를 사용한다. 관련 acceptance test, lint, typecheck를 통과하고 실제 브라우저에서 스크롤 위치와 UI를 확인한다.

## 완료 인계 (2026-09-13)

- CandidateEmptyGuard가 결과 있음/없음에 동일한 최소 높이 결과 셸을 유지하도록 구현했다.
- 960px 브라우저 viewport에서 결과 있음 800.5px, 없음 800px, 문서 높이 모두 1521px, 결과 영역 절대 top 모두 620px을 확인했다.
- 대상 Prettier/ESLint, strict typecheck, CandidatesApp acceptance 14 tests를 통과했다.
- 브랜치 `codex/empty-result-stability`, 워크트리 `.worktrees/empty-result-stability`. 통합 담당은 production build와 main 병합 및 상위 문서 갱신을 이어서 수행한다.
