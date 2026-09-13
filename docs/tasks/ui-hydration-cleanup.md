# ui-hydration-cleanup

## 실제 요청

UI 저장 상태 복원 호출 앞의 불필요한 `void`를 제거하고, 관련 파일의 불필요한 영어 주석을 정리한다. 커밋 메시지에는 AI 초안을 사람이 어떤 관점으로 손봤는지 남긴다.

## 소유 및 계약

`codex/ui-hydration-cleanup` / `.worktrees/ui-hydration-cleanup`. UI store와 이 task/record만 수정한다. 동기·비동기 저장소를 모두 지원하는 복원 완료 시점과 저장소 실패 시 메모리 UI 유지 동작은 바꾸지 않는다.

## 완료 인계

선두 `void`와 UI store의 설명성 영어 주석 4개를 제거했다. `Promise.resolve`와 `finally`는 유지해 동기·비동기 저장소에서 모두 복원 완료 후 `hydrated`를 설정한다. 관련 9개 테스트, lint, typecheck, format, diff 검사를 통과했다. 의존성 변경과 미해결 이슈는 없다.
