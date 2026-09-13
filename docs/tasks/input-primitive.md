# input-primitive

## 요청
input.test 위치 확인, Input을 styling 및 left/right 슬롯을 제공하는 primitive로 유지.

## 소유/계약
[기능 브랜치] / [기능 작업 공간]. ui/input.tsx, input 테스트 이동(ui/input.test.tsx), SearchBar 타입 참조, 이 task/record 소유.
Input은 native props/ref와 스타일·슬롯만 담당. clearButton/canClear/아이콘/내부 focus hook 제거. SearchBar는 기존 onClear와 실제 지우기/focus/검색 X 억제를 계속 소유. 테스트는 primitive와 함께 배치, native 제약/제어·비제어/ref/슬롯/키보드 검증 유지. 중복 clear 테스트는 기존 SearchBar 테스트가 담당.

## 완료 인계
Input은 스타일/native props/ref/left/right/wrapperClassName만 제공. 내부 clear/focus hook 제거, ref는 native input에 직접 전달. SearchBar clear 동작 유지. 테스트는 src/components/ui/input.test.tsx로 이동해 primitive6 cases(기존 clear 전용 검사는 SearchBar6 cases에서 담당)로 정리. lint/typecheck/관련3 files26 tests/format/diff-check 통과. 통합 build/browser 및 문서 후속 갱신. 미해결 이슈 없음.
