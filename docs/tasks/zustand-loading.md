# zustand-loading

## 실제 요청
Candidate UI Provider는 Zustand와 역할이 겹쳐 삭제. Button과 다른 컴포넌트의 pending을 loading으로 변경.

## 소유 및 계약
codex/zustand-loading / .worktrees/zustand-loading. UI store/app, loading 관련 컴포넌트/도메인 훅/스토어/테스트와 이 task/record 소유. Query/DnD 라이브러리 Provider는 해당 라이브러리 전용 연결이므로 유지.
Context 없이 Zustand bound store 직접 구독. skipHydration + client effect 복원/런타임 검증/검색·직무만 persist 유지. 테스트는 singleton 초기 상태를 명시적으로 리셋. UI loading, 카드 loadingIds 및 관련 계약 함께 변경. React Query 내부 isPending 등 외부 API는 유지.

## 완료 인계
CandidateUIProvider/UIContext/useContext 제거. Zustand create bound store로 직접 구독하고 useHydrateCandidateUI가 client effect 복원만 담당. JSX 없는 store는 .ts로 변경. UI loading/loadingIds 및 normalized isLoading 계약과 소비/테스트 일괄 변경. Query 내부 isPending와 요청 처리 API의 내부 pending 등 별도 의미는 유지. 초기화 fixture와 실제 메모리 폐기 후 저장 복원 테스트 갱신. lint/typecheck/13 files113 tests/format/diff-check 통과. 의존성 추가 및 미해결 기능 이슈 없음.
