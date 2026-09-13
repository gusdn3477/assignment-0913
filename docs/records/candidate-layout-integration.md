# API와 지원자 컴포넌트 배치 통합 기록

## 실제 요청/배정
사용자: “api 폴더는 components와 같은 레벨로 빼자”, “컴포넌트 폴더를 더 세분화. candidate 라는 폴더를 만들고 그 하위에 board, card, detail도 가능해보임”.

- 시작 main c4c449e clean. 앞선 메시지 한글화로 과거 문서 SHA는 재작성 전 참조이며 원본/대응표는 .git/korean-message-backup-20260913-215520에 보존.
- 범위822855e, 독립 [기능 브랜치]/[기능 작업 공간]. 기능 src와 task/record, 통합 README/최상위 기록/리뷰/build/browser 소유.
- src/api/candidate, src/components/candidate/{app,board,card,detail,toolbar,metric,error-boundary,load-feedback,workspace-header}; virtual list는 board/virtual-list로 배치. 파일명/컴포넌트 계약/나머지 도메인 계층 유지.

## 검토/검증
- 기능6986331/main통합b69e741. Git이26개 파일을 rename으로 인식, 신규 호환 파일 없음. 통합 main과 검증 기능 브랜치의 src diff 없음.
- 소스72개 파일은 기대 경로 치환/포맷 정리 외 동일함을 기능 대조 및 통합 diff에서 확인. 이전 API/components import 0건.
- 전체13 files109 tests(46.19초), eslint/tsc/format 통과. 이미 통과한 동일 소스 검사를 중복 실행하지 않고 main production build/browser 확인.

- main pnpm build 성공. production3103 초기 skeleton→250명/5단계, 이름 검색1명/상세 열기/Enter 닫기/카드 focus 복귀/검색 지우기250명 확인. console error/warn[]. 임시 탭/서버 종료. 신규 의존성/미해결 기능 이슈 없음.
