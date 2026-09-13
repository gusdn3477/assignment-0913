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

## 완료 인계 (2026-09-13)

- 계약대로 queries.ts 및 deterministic hook tests 구현 완료.
- QueryClient 단위 동기 카드 잠금, 불변 pendingIds 스냅샷, AbortSignal, 카드별 optimistic/success/rollback, unmount 이후 lifecycle 처리 포함.
- hook 11개 + mock-api 17개 = 28 테스트 통과. TypeScript 및 변경 파일 ESLint 통과.
- 추가 의존성/공통 파일 수정 없음. 알려진 미완료 사항 없음.
- 상세 작업 기록: `docs/records/optimistic-update.md`.
- 인계 브랜치: `[기능 브랜치]`, 워크트리: `[기능 작업 공간]`.
- 통합 담당자: 앱에서 두 훅을 연결하고 build/브라우저 확인 및 STATUS/PROMPTS 갱신.
