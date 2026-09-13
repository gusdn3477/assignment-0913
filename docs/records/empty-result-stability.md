# empty-result-stability 작업 기록

## 요청

- 실패 케이스 재현 방법과 실패 UI 확인
- 낙관적 업데이트 적용 위치 확인
- 검색 결과 없음 전환 시 높이 변화 해결

## 구현 / 판단

- 단계 이동 mutation은 `useMoveCandidate`의 `onMutate`에서 해당 카드만 Query cache에 먼저 반영하고, `onError`에서 해당 카드만 이전 값으로 복구한 뒤 Sonner 오류 토스트를 표시한다. 별도 모달은 사용자의 흐름을 막으므로 추가하지 않았다.
- 최초 목록 조회 실패는 보드 대신 오류 안내와 재시도 버튼, 캐시가 있는 배경 갱신 실패는 기존 보드를 유지한 인라인 alert로 구분한다.
- `CandidateEmptyGuard`가 정상 결과와 빈 결과 모두 동일한 결과 셸을 렌더하도록 변경했다. 결과 셸의 최소 높이는 가상 목록 최대 높이 `max(720px, 75vh)`와 컬럼 헤더·패딩 여유 `5rem`을 합산해, 필터 결과가 0건이 되어도 페이지 하단 콘텐츠와 문서 스크롤 범위가 급격히 당겨지지 않는다.
- 빈 안내는 결과 셸 가운데에 배치하고 기존 초기화 버튼 동작을 유지했다.

## 검증

- acceptance test에서 결과 있음 → 0건 전환 시 같은 DOM 결과 셸과 같은 최소 높이 클래스가 유지되는지 검증한다.
- 개발 서버 브라우저 960px viewport에서 결과 있음 800.5px, 첫 보정 빈 결과 792px을 측정해 남은 8.5px 차이를 최종값에 반영했다.
- 최종 브라우저 측정: 결과 있음/없음 결과 영역 절대 top 620px 동일, 높이 800.5px/800px, 문서 전체 높이 1521px 동일. 콘솔 error/warn 없음.
- `prettier --check` 대상 파일 통과.
- `eslint` 대상 파일 통과.
- `tsc --noEmit` 통과.
- `vitest run src/components/candidate/app/candidates-app.test.tsx`: 14/14 통과. 기존 mutation 실패 acceptance test에서 낙관 이동, 같은 카드 저장 잠금, 실패 카드만 롤백, 토스트 노출을 함께 확인했다.

## 남은 이슈

- 없음.
