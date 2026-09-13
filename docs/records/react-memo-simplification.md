# React 메모이제이션 단순화 기록

## 실제 요청
> `DeferredBoard = memo(CandidateBoard)`는 불필요해 보이며, memo를 쓴다면 CandidateBoard에서 내보내야 한다. 정교한 메모이제이션이 필요하지 않으면 React 19에 맞춰 `useMemo`, `memo`, `useCallback`을 제거해 코드 양을 줄이자.

## 검토와 결정
- React 19 자체는 자동 메모이제이션을 활성화하지 않는다. 설치된 Next 16 문서의 `reactCompiler` 안내를 확인하고 `babel-plugin-react-compiler` 1.0.0 및 `reactCompiler: true`를 적용했다.
- production과 테스트의 렌더링 특성을 맞추기 위해 `@vitejs/plugin-react`의 Babel plugins에도 React Compiler를 등록했다.
- `CandidatesApp`, `CandidateBoard`, `CandidateCard`, 후보 조회·검색·이동·DnD 훅에서 단순 렌더 최적화 목적의 수동 메모이제이션을 제거했다. `DeferredBoard` 별칭 없이 `CandidateBoard`를 직접 렌더링한다.
- `VirtualCandidateList`는 mutable TanStack Virtual 인스턴스 때문에 이미 `"use no memo"`로 Compiler를 제외한다. 이 경계의 `rangeExtractor`는 외부 인스턴스 옵션 참조를 안정적으로 유지하기 위해 유일한 수동 `useCallback`으로 남겼다.

## 검증 과정
- Compiler를 Vitest에 적용하기 전 전체 테스트에서 1,000개 카드 Tab 탐색이 30초 제한을 초과했다. 이는 수동 메모 제거 후 테스트 번들만 Compiler를 사용하지 않은 설정 차이였다.
- Vitest Babel 설정에 Compiler를 추가한 뒤 같은 가상화 파일 7개 테스트가 통과했고, 전체 114개 테스트도 통과했다. timeout을 늘리거나 테스트 범위를 줄이지 않았다.

## 명령과 결과
- `pnpm add -D babel-plugin-react-compiler`: 1.0.0 설치, lockfile 갱신.
- `pnpm exec vitest run src/components/candidate/board/virtual-list/virtualization.test.tsx`: 7/7 통과.
- `pnpm format:check && pnpm verify`: format, lint, strict typecheck, 13 files / 114 tests, webpack production build 통과.
- production build route: `/`와 `/_not-found` 정적 생성 완료.

## 남은 이슈
없음.
