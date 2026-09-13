# explorer: 검색·필터·상세

## 범위 / 소유 파일
`src/features/candidates/ui-store.tsx`, `candidate-toolbar.tsx`, `candidate-detail.tsx`, `selectors.ts`, 관련 테스트, `docs/records/explorer.md`, 이 문서.

## 계약
export `CandidateUIProvider`, `useCandidateUI(selector)`; state {search:string,job:string,selectedId:string|null,hydrated:boolean,setSearch,setJob,selectCandidate,resetFilters}.
job 기본값 `all`. Zustand provider별 인스턴스, persist는 search/job만 저장. skipHydration + mount 복원, 손상 UI 설정은 기본값으로 안전 복구.
export `filterCandidates(candidates, search, job): Candidate[]`.
export `CandidateToolbar({jobs, total, filtered})` 내부 store 사용. jobs:string[], total:number, filtered:number.
export `CandidateDetail({candidate})`: Candidate|null, Sheet; 열림은 store.selectedId 기준, 닫기 selectCandidate(null).

## 완료 기준
이름 부분검색(trim/case insensitive)+직무 AND, 접근 가능한 label, 결과 수/초기화, 상세 이름·직무·날짜·현재 단계·이메일·요약. UI 설정 복원/불량 저장/선택ID 비영속 테스트. 상세 trigger가 외부 카드이므로 닫을 때 해당 카드 상세 버튼에 포커스 복원(보드 버튼 data-candidate-detail=id 계약 사용).
공유 ui 컴포넌트 재사용. app/globals/package 변경 금지. feat(explorer) 커밋.

## 완료 인계
- 검색/직무 AND 필터, provider별 Zustand, mount hydration, search/job만 persist 및 저장값 검증 완료.
- Toolbar 접근 가능한 컨트롤/결과 수/초기화, Sheet 상세 및 키보드 포커스 복귀 구현 완료.
- `./node_modules/.bin/vitest run`: 9개 통과. tsc --noEmit / eslint src/features/candidates 통과.
- 실제 지시, pnpm 실행 제한과 우회 검사, 결정은 docs/records/explorer.md에 기록.
- 저장 키 `hiring-pipeline-ui`. 외부 버튼 `[data-candidate-detail]` 값에 지원자 ID 필요.
- 남은 기능 없음. 통합 연결 및 브라우저 검증은 통합 담당.
