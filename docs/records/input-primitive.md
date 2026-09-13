# input-primitive

## 실제 요청
“input.test는 어디간거야? input은 styling 및 left right 뚫어둔 컴포넌트를 primitive로 가져가면 될 것 같은데”

## 결과 및 리뷰
- 기존 테스트는 삭제되지 않고 src/components/input/input.test.tsx에 구현(ui/input.tsx)과 분리되어 있었다. 이번에 src/components/ui/input.test.tsx로 이동해 구현과 함께 둔다.
- Input은 native input props/ref, 스타일, left/right ReactNode 슬롯과 wrapperClassName만 제공한다. clearButton union/canClear/내장 X/Button/내부 ref/useImperativeHandle 및 search X 억제 제거. native ref를 직접 전달한다.
- SearchBar는 기존 돋보기/CloseButton/onClear/비어 있지 않은 value 조건/disabled/readOnly/focus 복원/native 검색 X 억제를 소유한다. 타입에서 사라진 clearButton Omit만 제거한다.
- primitive 테스트는 슬롯/키보드/이벤트/native 제약/제어·비제어/ref 전환 및 해제를 검증. 제거한 clear 전용 테스트는 기존 SearchBar 테스트로 계속 검증한다. 단순 native number를 지우는 별도 동작은 더 이상 Input 계약이 아니다.

## 검증
- 설치 Next use-client 문서는 동일 대화 앞선 작업에서 확인한 기준 적용.
- node_modules/.bin/prettier --write 변경3파일 완료.
- node_modules/.bin/eslint . 및 tsc --noEmit 통과.
- node_modules/.bin/vitest run src/components/ui/input.test.tsx src/components/search-bar/search-bar.test.tsx src/components/candidate/app/candidates-app.test.tsx: 3 files26 tests 통과(6/6/14).
- git diff --check 통과, src clearButton 참조0건.

## 인계
codex/input-primitive / .worktrees/input-primitive. 추가 의존성/미해결 기능 이슈 없음. 통합 build/browser 추가 기록 예정.

## 통합 검증 완료
기능25c2006 / main e91600f. 통합 next build --webpack 통과. localhost:3024 production 250명 로드→최서연 검색1명, input wrapper 좌돋보기/우버튼 DOM 확인. Tab/Enter 지우기로 입력 비움/X 숨김/input focus 복귀 확인. 즉시 스냅샷은 deferred 결과 업데이트 중이며 최종250명 복원은 자동 테스트로 검증. console error/warn []. 탭/서버 정리. README에서 예전 Input clear 계약과 폴더 위치 설명 수정. 미해결 이슈 없음.
