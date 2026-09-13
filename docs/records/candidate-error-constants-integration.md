# 조회 에러 상수화 통합 기록

## 실제 요청과 범위
사용자가 loadErrorMessage 함수를 제시하고 “에러코드 에러메시지 상수화” 요청.

- 시작 main e1da022, clean. AGENTS/PLAN/STATUS/DECISIONS 및 기존 조회 task 확인.
- cohesion 스킬에 따라 지원자 도메인 내부에서 코드 및 조회 표시 메시지 공유. 내부 진단 메시지와 모든 UI 문구로 범위를 확장하지 않음.
- 새 codex/candidate-error-constants / .worktrees/candidate-error-constants와 독립 기능 세션. 기능은 상수/API/검증/조회 소비처 및 task/record, 통합은 최상위 기록/리뷰/build/browser 담당.
- 기존 API tests17과 app acceptance14가 storage/corrupt-storage/일반 오류 및 초기/배경 재시도 안내를 검증. 상수와 동일한 값을 복제하는 신규 테스트는 만들지 않음.

## 검토 및 검증
- candidate-errors.ts의 MOCK_API_ERROR_CODES, 유도 MockApiErrorCode, readonly partial CANDIDATE_LOAD_ERROR_MESSAGES, DEFAULT_CANDIDATE_LOAD_ERROR_MESSAGE 검토. 코드 값과 한국어 안내 원문이 동일하며 일반 오류/null/매핑 없는 코드는 기존 fallback 유지.
- 기능 cce063b, main 통합 c47a148. 기존 API17/app14 총31 tests 통과(9.58초), lint/typecheck/전체 format 통과. 테스트 수정 없음. 통합 소스 동일하여 같은 검사를 중복 실행하지 않고 production build/browser 확인.

- main pnpm build 성공. production3103에서 실제 무작위 초기 실패 시 기본 상수 안내 “잠시 후 다시 불러와 주세요.” 확인. 재시도 pending 이후250명/5단계 복구와 검색 focus 확인, console error/warn[]. 임시 탭/서버 종료. 미해결 이슈 없음.
