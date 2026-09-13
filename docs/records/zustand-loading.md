# zustand-loading

## 실제 요청
- Provider를 굳이 써야 될 이유를 모르겠고 Context 제한은 이해하지만 Zustand와 역할이 겹쳐 삭제 요청.
- Button이나 다른 컴포넌트에서 pending보다 loading 명칭으로 변경 요청.

## 출력 및 리뷰
- CandidateUIProvider와 UIContext, createStore/useStore/useContext 중간 계층 제거. Zustand create의 useCandidateUI(selector)를 직접 사용.
- useHydrateCandidateUI는 클라이언트 effect에서 최초 저장 복원을 수행. skipHydration/초기 기본값으로 서버 렌더와 hydration 일치 유지. 이미 복원한 store는 remount에서 덮어쓰지 않는다.
- 검색/직무만 persist, 저장 데이터 검증과 저장소 실패 시 메모리 상호작용 보존. 선택 ID/hydrated는 영속 저장하지 않는다.
- 앱 소유 로딩 props/변수는 loading, 카드별 집합은 loadingIds, normalized 조회 상태는 isLoading으로 통일. spinner/disabled/aria-busy/native props/ref 동작 보존. React Query 원본 isPending, 테스트 타이머 API, API 내부 진행 요청 값은 외부 API 또는 다른 의미이므로 유지.
- QueryClientProvider와 DragDropProvider는 각 라이브러리 연결에 필요한 것으로 UI Context 제거 범위와 구분한다.
- singleton 테스트 상태는 getInitialState로 초기화. 저장 복원 테스트에서 실제 메모리를 폐기한 뒤 저장값만 재주입하여 복원 검증. Explorer/virtual detail은 Provider 없이 렌더.
- cohesion 스킬을 읽고 연결된 계약/소비처를 함께 변경. 기존 사용자 지정 폴더 구조는 유지. Next use-client 설치 문서는 앞선 동일 작업 대화에서 확인한 기준 적용.

## 명령/결과
- 공유 node_modules 링크 및 설치 bin 사용(의존성 변경 없음).
- node_modules/.bin/prettier --write src: 완료. 마지막 테스트 편집2파일 --check 통과.
- node_modules/.bin/eslint .: 통과.
- node_modules/.bin/tsc --noEmit: 통과.
- node_modules/.bin/vitest run: 13 files113 tests 통과. 버튼 loading/중복 클릭/포커스, 검색/복원/손상 storage, 조회/재시도, 카드 잠금/롤백/Undo/DnD, 1,000-card 키보드 탐색 포함.
- git diff --check: 통과. CandidateUIProvider/UIContext/pending= 소스 검색 0건.

## 인계
codex/zustand-loading / .worktrees/zustand-loading. 기능 미해결 이슈 없음. 통합 build/browser 후 추가 기록.
