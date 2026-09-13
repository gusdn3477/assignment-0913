# mock-api: 지연·실패·영속 저장

## 범위 / 소유 파일
`src/features/candidates/mock-api.ts`, `seed.ts`, 관련 테스트, `docs/records/mock-api.md`, 이 문서.

## 계약
공유 `types.ts`의 Candidate/Stage/MoveCandidateInput을 사용합니다.
export `createMockApi(options?)`, 기본 인스턴스 `candidateApi`.
인스턴스 메서드: `listCandidates({signal}?)`, `updateCandidateStage({id,stage})`.
옵션으로 storage getter, random, delay/sleep를 주입하여 테스트할 수 있게 합니다.

## 완료 기준
250명 결정적 한국어 시드, 200~800ms·15% 실패, AbortSignal, localStorage 런타임 검증, 실패 시 무저장, 최신 저장 읽기 후 카드 단위 쓰기. 손상된 데이터는 에러로 보고하며 조용히 덮어쓰지 않습니다.
성공/실패/역순 완료/손상/Abort/시드 테스트를 작성합니다.
package와 공유 타입은 수정하지 않습니다. 테스트 명령·결과를 기록하고 feat(mock-api)로 커밋합니다.

## 완료 인계
- 구현 완료: `seed.ts`, `mock-api.ts`, `mock-api.test.ts` (17개 테스트).
- `createMockApi({ storage?: () => Pick<Storage, 'getItem' | 'setItem'>, random?, sleep? })`; 단계 변경은 변경된 `Candidate`를 반환합니다.
- `MockApiError.code`: storage / corrupt-storage / network / not-found / invalid-input / busy.
- `STORAGE_KEY`: hiring-pipeline:candidates:v1. 데이터는 버전 1 envelope이며 조회는 저장하지 않습니다.
- 테스트 17개, 전체 typecheck/lint 통과. 공유 node_modules이므로 pnpm 실행에 `--config.verify-deps-before-run=false` 사용.
- 워크트리: `[기능 작업 공간]`; 브랜치: `[기능 브랜치]`.
- 실제 지시·결정·검증은 `docs/records/mock-api.md`에 기록했습니다. 남은 기능 이슈 없음. 통합에서 UI/Query 연결과 build/browser 검증 필요.
