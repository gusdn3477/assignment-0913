# mutation-success-toast

## 요청 / 소유권

단계 이동 mutation과 단계 되돌리기 mutation이 실제 저장에 성공했을 때 성공 토스트를 표시한다. `[기능 브랜치]` 워크트리에서 mutation hook, 관련 hook test 및 작업 기록을 소유한다.

## 계약

- 낙관적 반영 시점이 아니라 API 성공 응답을 받은 뒤에만 성공 토스트를 표시한다.
- 일반 이동과 되돌리기의 메시지를 구분하고 지원자 이름과 확정 단계를 함께 표시한다.
- 기존 실패 토스트, 카드별 롤백, 같은 카드 저장 잠금, 다른 카드 병렬 처리, Undo 이력 정책을 유지한다.
- 성공 토스트가 저장 lifecycle이나 포커스를 변경하지 않는다.

## 완료 기준

일반 이동 성공과 되돌리기 성공 토스트를 deterministic hook test로 검증하고 관련 format, lint, typecheck, test를 통과한다.

## 완료 인계 (2026-09-13)

- API 성공 확정 뒤 일반 이동/Undo 구분 성공 토스트와 `지원자 이름 · 확정 단계` 설명을 추가했다.
- 대상 format/lint/strict typecheck, hook 22 tests와 CandidatesApp 14 tests를 통과했다.
- 실제 브라우저에서 일반 이동 성공 `단계 이동을 저장했습니다. / 최서연 · 면접`, Undo 성공 `단계 되돌리기를 저장했습니다. / 최서연 · 서류검토`를 확인하고 원래 단계로 복구했다. console error/warn 없음.
- 브랜치 `[기능 브랜치]`, 워크트리 `[기능 작업 공간]`. 통합 담당은 main 전체 verify와 문서 갱신을 이어서 수행한다.
