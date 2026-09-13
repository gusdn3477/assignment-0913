# candidate-boundaries 실제 작업 기록

## 실제 요청
“워크트리를 파든지 해서 선택 추가사항 적용” 및 Tailwind ESLint canonical class, useQuery 래퍼로 소비처의 ?? 제거, vite alias, 영역별 loading/error fallback, 서버/클라이언트 경계 설정.

## 시작 / 조율
- PLAN/STATUS/DECISIONS와 진행 중 두 task를 읽고 main 6a4878d에서 독립 codex/candidate-boundaries 워크트리를 만들었습니다.
- 기존 통합 담당과 충돌 방지를 조율했습니다. 이전 워크트리 파일을 수정하지 않으며 기존 구조/UI가 main에 통합되면 반영합니다.
- Next 설치 문서 use-client/loading/error를 읽었습니다. reset은 재조회 없이 render reset, retry는 서버 재요청을 포함하므로 브라우저 API인 현재 route fallback은 reset 유지.

## 1차 도구 검증
- eslint-plugin-better-tailwindcss 4.7.0 설치. sandbox DNS ENOTFOUND 후 승인된 네트워크 실행으로 설치 성공. 기존 실패 설치 프로세스는 Ctrl-C 종료.
- 공식 canonical rule 문서: https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-canonical-classes.md
- rootFontSize 16 + 앱 CSS entryPoint로 rule error 및 lint:fix 설정. 기존 소스에 eslint --fix 실행하여 min-w-[1240px] → min-w-310 변환 확인. 해당 시험 수정은 기존 구조 통합 후 재실행하기 위해 원복.
- 독립 영역 render boundary와 복구/오류 원문 숨김/형제 영역 보존 테스트 작성. 통합 이후 실제 화면에 연결하고 전체 검증 예정.

## 구현 및 2차 검증
- main 84181ea 구조 통합 반영. 정적 header/intro/footer/main은 server page로 이동, client CandidatesApp은 UI provider/조회/상호작용만 담당.
- useCandidates는 안정적인 기본 배열, 실제 데이터 존재 여부 hasData, summary 및 선택 후보를 반환합니다. Query cache에는 초기 빈 배열을 넣지 않으므로 initial failure/empty success/refresh failure를 구분합니다.
- route loading.tsx와 browser query skeleton 역할을 구분. 보드/상세 render boundary와 전체 client 영역 예외 경계를 적용. API 실패/카드 mutation은 기존 inline/toast 경로 유지.
- TS/Vitest의 기존 @ alias가 src로 일치하며 새 import와 기존 폴더 이동에 사용됨. 불필요한 Vite 설정/플러그인 중복 추가 없음.
- canonical rule 실제 lintText 오류 검출 및 min-w-310 자동 수정 검증 PASS. 기존 canonical 클래스 전체 수정.
- 최초 typecheck/test에서 isSuccess 반환 누락 발견(101/102 통과). 기존 성공 상태 계약을 명시적으로 복원하여 수정.
- pnpm format:check && pnpm verify: format/lint/typecheck/102 tests 통과, build 진행 중.
- 새 공통 UI 소비처 연결 4f36d6f를 추가 반영 후 최종 검사 예정.
