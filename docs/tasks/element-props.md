# element-props

## 실제 요청 및 정정
props 이름이 기본 element 이벤트 핸들러와 유사한지 점검 요청. 후속 정정: “Select는 원래 onValueChange인가? 그럼 유지해”.

## 최종 계약
codex/element-props / .worktrees/element-props. Radix Select 원래 onValueChange 유지. 추가했던 onChange 변환과 Omit 제거, 실제 Toolbar도 원상 복원. Input/SearchBar native onChange(event), Button onClick/loading은 정상 확인. 의미별 도메인 액션과 라이브러리 원본 콜백 유지.

## 인계
앞선 변경의 검증은 records에 별도로 남기며 최종 정정 검증 후 갱신. 최초 변경과 correction 커밋을 보존한다.

최종 정정 완료: 관련 lint/strict typecheck/explorer9 tests/diff-check 통과. 두 소스 파일의 2372527^ 대비 diff 없음. 미해결 이슈 없음.
