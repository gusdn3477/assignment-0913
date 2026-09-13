# react-memo-simplification

## 요청

React 19 환경에 맞춰 불필요한 `memo`, `useMemo`, `useCallback`을 제거하고,
호출부에서 `memo(CandidateBoard)`로 만든 `DeferredBoard`를 정리한다.

## 소유 및 계약

`[기능 브랜치]` / `[기능 작업 공간]`에서
React Compiler 설정, 지원자 앱·보드·카드·훅의 수동 메모이제이션과 관련 문서·테스트를
소유한다. 검색 입력은 즉시 반영하고 `useDeferredValue`가 보드 갱신을 늦추는 기존 계약,
카드별 저장·Undo·DnD·가상화·포커스 동작을 유지한다. 외부 가상화 라이브러리 옵션처럼
참조 안정성이 명시적으로 필요한 곳은 근거를 남기고 수동 메모이제이션을 유지할 수 있다.

## 완료 기준

React Compiler를 실제 빌드에 적용하고 불필요한 수동 메모이제이션을 제거한다. 관련 테스트,
lint, typecheck, production build를 통과하고 변경 근거와 검증 결과를 기록한다.

## 완료 인계

Next와 Vitest에 React Compiler를 활성화했다. `DeferredBoard`를 제거하고 `CandidateBoard`를
직접 렌더링하며 앱 소유 코드의 단순 `memo`, `useMemo`, `useCallback`을 제거했다.
Compiler opt-out인 mutable virtualizer의 `rangeExtractor`만 외부 옵션 참조 안정성을 위해
수동 `useCallback`으로 유지했다. format/lint/typecheck/114 tests/production build 통과,
미해결 기능 이슈 없음.
