# candidate-error-constants

사용자 요청: loadErrorMessage의 에러 코드와 에러 메시지 상수화.

## 소유권과 계약
- 새 codex/candidate-error-constants 워크트리. 지원자 도메인의 에러 상수, MockApiError 타입과 코드 생성/조회 소비처, 해당 task/record 소유.
- 코드 상수에서 union 타입을 유도하고 API/검증/조회 UI에서 재사용. 사용자 메시지와 알 수 없는 오류 기본 안내는 동일하게 유지.
- 기존 API/조회 acceptance tests를 검증에 사용. 낮은 영향의 상수 추출을 그대로 복제하는 신규 테스트는 불필요.
- 소스 관련 Next 설치 문서 확인. lint/typecheck/format 및 관련 tests 실행. 커밋 type/scope 영어, 요약 한글.
- 통합은 최상위 기록/리뷰/build/browser 확인을 담당.

## 완료 인계 (2026-09-13)
- 코드 6종과 조회 메시지 2종/기본 안내를 candidate-errors.ts 상수로 추출했습니다. MockApiError 코드 타입을 상수의 value union으로 유도하고 모든 production 코드 생성처에서 재사용합니다.
- 최초 조회와 배경 조회 UI는 코드별 lookup 및 기본 안내로 기존 메시지를 유지합니다. 내부 진단 문자열/오류 처리 흐름은 변경하지 않았습니다.
- 기존 API17/app14 총31 tests 및 eslint, strict tsc, Prettier 전체 검사 통과. 신규 테스트/의존성 없음.
- 통합 담당 코드 리뷰 완료. production build/browser는 통합 담당이 수행합니다. 알려진 미해결 사항 없음.
