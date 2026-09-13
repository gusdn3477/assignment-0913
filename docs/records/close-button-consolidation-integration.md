# CloseButton 중복 정리 통합 기록

## 실제 요청
“close-button 이 지금 2개 존재하고 있어서 정리 필요”

## 검토
공용 buttons/close-button과 상세용 candidate/detail/close-button이 같은 이름으로 존재했습니다. SheetContent에도 자체 X 아이콘 조합이 있었습니다. SheetContent의 production 소비처는 CandidateDetail 한 곳입니다. 상세 래퍼 제거 후 Sheet가 공용 버튼을 조합하도록 책임을 통합합니다. SearchBar의 native onChange/onClear 및 값이 있을 때만 표시하는 계약은 유지합니다.

## 작업 분리
[기능 브랜치], [기능 작업 공간]에서 기능 구현. 통합 담당은 소비처/ActionButton의 props·ref 전달과 문서를 검토합니다. 설치된 Next use-client 문서를 확인했고 의존성 변경은 없습니다.

## 검증
- 기능 304de15, main 통합 818e3c4. 공용 CloseButton 파일 1개만 남음을 find로 확인.
- 기능 담당 Sheet/SearchBar/app 23 tests, lint/typecheck/변경 파일 format 통과. 통합 diff 리뷰에서 native props/ref/class merge/최초 focus를 확인.
- main pnpm build (webpack) 통과: 컴파일, TypeScript, 정적 페이지 생성 완료.
- production 브라우저 250명 → 최서연 검색 1명 → 상세 닫기 최초 focus → Enter 닫기 및 원래 카드 focus 복귀 확인.
- 검색어 지우기 클릭 후 빈 값, X 버튼 0개, 검색 input focus, 250명 복원 확인. console error/warn 없음.
- 임시 탭과 production 서버 정리. 미해결 이슈 없음.
