# optimistic-update: 카드별 낙관적 저장

## 범위
`src/features/candidates/queries.ts`, 관련 테스트, `docs/records/optimistic-update.md`, 이 문서.

## API 계약
export `CANDIDATES_QUERY_KEY`, `useCandidates()`, `useMoveCandidate()`.
useCandidates(): 표준 useQuery result. useMoveCandidate(): `{move:(id:string,stage:Stage)=>void,pendingIds:ReadonlySet<string>}`.
mock-api의 candidateApi를 사용. API 주입/vi.mock 방식으로 deterministic hook tests 지원.

## 완료 기준
목록 query AbortSignal 전달. 카드 ID별 즉시 잠금(동일 tick 두 요청도 차단), cancelQueries 후 기존 해당 카드 보관과 낙관 변경, 성공 응답 해당 카드만 patch, 실패 이전 카드만 patch+sonner 한국어 오류 알림. 전체 snapshot 복원 금지. 다른 카드 동시 이동 허용. pendingIds immutable snapshot. same stage/no missing candidate no-op. mutation lifecycle는 컴포넌트 unmount에도 저장 결과와 롤백 일관성 유지. QueryClient 기본 retry/refetch 설정은 providers에 이미 있음.
핵심 테스트: 완료 전 변경, 실패 롤백, A 실패+B 성공, 같은 ID 중복, 역순 완료. 기록·handoff·feat(optimistic-update) 커밋.
