# candidate-empty-guard

## 요청 및 소유권
사용자: filtered.length === 0 등의 엣지 케이스를 내부에서 처리하고 정상 상태에는 children을 반환하는 컴포넌트로 래핑.
독립 [기능 브랜치] / [기능 작업 공간]. 소유: app 컴포넌트, 신규 empty-guard, 이 task/record.

## 계약
CandidateEmptyGuard는 전체 빈 목록/검색 빈 결과 안내와 초기화를 소유한다. 정상 결과에는 children 반환. Toolbar와 지연 상태 표시는 외부 유지. 기존 Query Guard와 데이터/저장 계약 유지.

## 완료 인계
Guard 내부에서 빈 상태 문구/검색 초기화와 children 분기를 담당. 외부 Toolbar/aria-busy/deferred 결과 일치 유지. eslint/tsc/app14 tests 통과. 기존 빈 목록 테스트를 보드 미렌더 계약에 맞춰 보정. 미해결 기능 이슈 없음.
