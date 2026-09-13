# 조회 에러 상수화 기록

## 실제 요청과 범위
사용자는 기존 loadErrorMessage(error: Error | null)의 corrupt-storage/storage 분기와 한국어 메시지를 제시하고 “에러코드 에러메시지 상수화”를 요청했습니다. 통합 담당은 독립 codex/candidate-error-constants 워크트리에 에러 상수, MockApiError 타입, API/검증 코드 생성처, 조회 feedback 소비처를 배정했습니다.

## 구현 결과와 결정
- constants/candidate-errors.ts에 MOCK_API_ERROR_CODES를 as const로 정의하고 MockApiErrorCode를 value union으로 유도했습니다. 중복 문자열 union을 제거했습니다.
- API와 저장 데이터 검증의 모든 production MockApiError 생성처가 코드 상수를 사용합니다.
- CANDIDATE_LOAD_ERROR_MESSAGES는 읽기 전용 partial 코드 map입니다. storage와 corrupt-storage의 기존 사용자 안내를 유지하고 나머지 코드/일반 Error/null에는 DEFAULT_CANDIDATE_LOAD_ERROR_MESSAGE를 사용합니다.
- 내부 진단 문자열은 사용자 안내와 목적이 달라 이번 범위에 섞지 않았습니다. 요청/취소/저장/재시도/포커스 동작은 변경하지 않았습니다.
- cohesion SKILL.md를 읽고 관련 상수를 기존 지원자 도메인에 함께 배치했습니다. 설치 Next 문서 01-app/01-getting-started/05-server-and-client-components.md의 경계를 확인했습니다. 순수 상수 모듈에는 client directive나 브라우저 API를 추가하지 않았습니다.

## 검증 명령과 실제 결과
- node_modules/.bin/prettier --write [변경된 5개 소스]: 통과.
- node_modules/.bin/vitest run src/features/candidates/api/mock-api.test.ts src/features/candidates/components/candidates-app/candidates-app.test.tsx: 2 files, 31/31 tests 통과(API17/app14), 9.58초. 기존 테스트 변경 없음. 코드 문자열 계약, 저장소별 안내, 내부 오류 비노출, 재시도/배경 갱신 유지 포함.
- node_modules/.bin/eslint .: 통과.
- node_modules/.bin/tsc --noEmit: 통과.
- node_modules/.bin/prettier --check src *.ts *.mjs *.json: 통과.
- 통합 담당 리뷰: partial typed map/fallback, 코드 union 유도, 내부 진단 유지 적절함.

## 인계
워크트리: /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/candidate-error-constants
브랜치: codex/candidate-error-constants
production build/browser는 통합 담당 소유입니다. 알려진 미해결 사항 없음.
