# input-slot-layout

## 요청/소유
if (!hasSlots) return input 분기 제거. 슬롯 유무와 무관한 동일 UI, 슬롯이 있을 때 해당 좌/우 공간에 아이콘 배치.
codex/input-slot-layout / .worktrees/input-slot-layout. ui/input 및 tests, SearchBar 연관 테스트, task/record 소유.

## 계약
항상 같은 wrapper/input 구조와 스타일 사용. 좌/우 슬롯 노드가 있을 때만 공간/gap 추가. native input props/ref 및 동적 슬롯 전환 시 DOM/입력값/선택/포커스 유지. SearchBar 의미/키보드/지우기 유지.

## 완료 인계
hasSlots/조기 return 제거, wrapper 안에 동일 input 유지. wrapper 테두리/배경/focus·disabled/invalid 공통 처리, 실제 슬롯만 조건부 배치. 관련 lint/typecheck/26 tests 통과. 브라우저4종 동일448×38px·border/radius/background 확인. 16px 슬롯 있는 쪽 여백13→37px(아이콘16+gap8) 확인, 스크린샷 검토/console[] 완료. 임시 비교 페이지/탭/서버 삭제·종료. 통합 production build 예정. 미해결 기능 이슈 없음.
