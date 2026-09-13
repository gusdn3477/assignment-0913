# candidate-error-constants

사용자 요청: loadErrorMessage의 에러 코드와 에러 메시지 상수화.

## 소유권과 계약
- 새 codex/candidate-error-constants 워크트리. 지원자 도메인의 에러 상수, MockApiError 타입과 코드 생성/조회 소비처, 해당 task/record 소유.
- 코드 상수에서 union 타입을 유도하고 API/검증/조회 UI에서 재사용. 사용자 메시지와 알 수 없는 오류 기본 안내는 동일하게 유지.
- 기존 API/조회 acceptance tests를 검증에 사용. 낮은 영향의 상수 추출을 그대로 복제하는 신규 테스트는 불필요.
- 소스 관련 Next 설치 문서 확인. lint/typecheck/format 및 관련 tests 실행. 커밋 type/scope 영어, 요약 한글.
- 통합은 최상위 기록/리뷰/build/browser 확인을 담당.
