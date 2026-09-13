# CloseButton 중복 정리

사용자 요청: “close-button 이 지금 2개 존재하고 있어서 정리 필요”.

## 범위
- 공용 buttons/close-button 한 구현을 유지하고 상세 전용 래퍼를 제거합니다.
- SheetContent가 기본 닫기 버튼을 공용 CloseButton과 Radix Close로 조합합니다. closeButtonProps로 native props/ref/라벨/스타일을 전달합니다.
- 상세는 닫기 라벨만 지정하며 검색 지우기 동작은 유지합니다.
- Sheet 실제 키보드 닫기·포커스 복귀·속성 전달 및 숨김 옵션을 검증합니다.

## 소유
codex/close-button-consolidation / .worktrees/close-button-consolidation. Sheet, 상세 close 파일/테스트, CandidateDetail, 이 작업 문서와 기록. 통합 담당은 최상위 문서·production build·브라우저 검증.

## 상태
구현 완료. 공용 CloseButton 한 구현만 남기고 상세 래퍼를 제거했습니다. SheetContent의 closeButtonProps는 공유 버튼의 native props/ref를 그대로 사용합니다. 상세는 라벨만 지정합니다.

## 인계
관련 3파일 23 tests, 전체 ESLint/strict typecheck, 변경 source Prettier 통과. 통합 담당 source review 수정 요청 없음. production build와 브라우저 닫기·검색 지우기 확인은 통합 담당이 수행합니다. 미해결 기능 이슈 없음.
