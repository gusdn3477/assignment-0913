# 도메인별 constants 통합 기록

## 실제 요청
“constants도 component와 같은 레벨로 빼자. 차라리 constants 하위에서 도메인별로 파일 만드는 방식으로 진행.”

## 출력과 독립 리뷰
src/constants/candidate.ts에 지원자 단계·직무·스타일·저장 키·검색 제한·오류 코드/메시지·Query 키를 통합합니다. 과거 다섯 파일을 제거하고 23개 소비 파일의 import를 수정합니다. 기존 export 이름을 유지하고 같은 모듈의 중복 import를 합칩니다. 함수나 seed 전용 데이터까지 무관하게 이동하지 않습니다.
응집도 스킬을 참고하되 사용자가 지정한 최상위 constants/도메인 파일 구조를 우선했습니다. Next 설치 문서의 client 경계를 확인했으며 새 모듈은 순수 상수와 type-only import로 구성됩니다.
TypeScript AST printer로 이전 다섯 파일의 import를 제외한 선언과 새 파일을 비교한 결과 12개 공개 선언이 모두 동일했습니다.

## 통합 검증
- 기능 b4b81a2 / codex/constants-layout / .worktrees/constants-layout → main 7227fd0 통합.
- lint/typecheck/format 통과. 전체114개 중113개 통과, 가상화 키보드 탐색1개 30초 초과. 해당 파일 단독7개 통과(문제 테스트29.09초). 테스트/제한 변경 없음.
- main 병행 화면 변경과 자동 merge된 app test diff를 확인: 추가된 빈 결과 높이 검증을 보존하면서 상수 import가 갱신됨. app14개 재검증은13개 통과, DnD1개 5초 초과. 빌드 종료 후 실패 테스트만 단독 재실행해2.713초에 통과. 실제 assertion 실패 없음.
- pnpm build(webpack) 통과. 기존 상수/Query 키 경로 src 잔여 참조0건.
- production 브라우저 초기 오류의 기본 상수 안내 → 재시도250명 복구, 5단계와 직무 표시, 이름 검색1명 확인. 검색 입력을 빈 값으로 복원한 뒤 탭 종료. console error/warn 없음. 임시 production 서버 정리.
- 알려진 검증 한계: 대량 키보드 테스트가 시간 제한에 가까우며 이번 상수 이동 범위에서 테스트 제한을 바꾸지 않았습니다. 기능 미해결 이슈 없음.
