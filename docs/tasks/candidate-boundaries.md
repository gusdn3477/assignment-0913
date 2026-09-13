# candidate-boundaries

## 요청 / 소유권
2026-09-13 사용자 추가 요청: Tailwind canonical ESLint 설치/수정, useQuery 반환값 추상화, alias 사용, 영역별 loading/error fallback, 서버/클라이언트 경계 설정.
독립 워크트리 `[기능 작업 공간]`, 브랜치 `[기능 브랜치]`에서 구현합니다. 기존 candidate-structure/reusable-ui 통합 이후 코드를 기준으로 적용하며 해당 작업의 진행 중 파일은 수정하지 않습니다.

## 완료 기준
- Tailwind 4 canonical rule 및 fix 명령, 기존 클래스 수정과 실제 lint 검출/수정 확인.
- 목록 hook의 안정적인 기본 배열 및 최초/배경 상태 계약; 소비 컴포넌트의 undefined 방어 제거, 취소/재시도/빈 배열 구분 보존.
- Next/TypeScript와 Vitest alias 일치 및 import 정리.
- 정적 페이지 shell은 server, 상호작용 영역은 client. 실제 로딩/렌더 오류/조회 실패별 복구 경계.
- 회귀 테스트, lint/typecheck/format/build 및 브라우저 확인. 실제 records와 handoff 갱신 후 커밋.

## 인계 (1차)
플러그인 설치와 canonical autofix 시험 완료. 렌더 boundary 초안 준비. 기존 구조 통합을 받은 뒤 연결과 회귀 검증 필요. 아직 기능 완료 아님.

## 인계 (2차)
서버 page 분리/정규화 query/route loading/지역 render boundary/canonical 수정 완료. 102 tests 및 lint/typecheck/format 통과. 최신 main 공통 UI 연결을 merge하고 build/browser 최종 확인 필요.

## 최종 기능 인계
- 구현 완료. 코드 044b7b5, 브랜치 [기능 브랜치], 워크트리 `[기능 작업 공간]`.
- format/lint/typecheck/103 tests/production build 및 실제 production browser 통과. 상세 명령·결과는 docs/records/candidate-boundaries.md.
- 알려진 미해결 결함 없음. route loading은 route stream에만 적용되며 localStorage query 로딩은 명시적 skeleton으로 처리.
- 통합 담당의 main 소유권 인계 ce40c73 수신 후 최종 기능 브랜치 d1a203e를 main 93a50eb에 통합. main frozen offline 설치와 format/lint/typecheck/103 tests/build 모두 통과.
