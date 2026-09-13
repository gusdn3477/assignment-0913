# candidate-structure

## 요청 / 소유권
선택사항 2~4 및 기능별 skeleton: 컴포넌트별 폴더, constants/types/utils/hooks/api/query keys/options 분리와 합리적인 입력 훅 추상화.
새 `.worktrees/candidate-structure`, `codex/candidate-structure`에서 `src/features/candidates/**`, `src/app/page.tsx`의 import, 이 task와 `docs/records/candidate-structure.md`만 소유합니다. 공통 src/components 및 package/상위 문서는 수정하지 않습니다.

## 계약 / 완료 기준
- candidates 안에 components/<component>, api, constants, types, utils, hooks, queries, stores 등 관련 책임별 분리. 관련 테스트는 해당 모듈 근처. imports는 @/features/candidates/...로 긴 상대 경로 회피. 의미 없이 한 줄 파일이나 호환 re-export를 대량 생성하지 않음.
- board에서 card를 분리하고 app의 header/metric/board skeleton도 적절한 component 단위로 추출. 공통 primitive Skeleton 위에 CardSkeleton/BoardSkeleton/MetricSkeleton처럼 실제 레이아웃에 대응하는 조합. 기능 컴포넌트는 이름이 있는 명시적 파일로 제공.
- query key, queryOptions factory, list hook, mutation hook, QueryClient별 move store, 도메인 타입/상수/API/validation 등을 책임별 분리. 기존 캐시 키와 localStorage 키 유지.
- queryOptions를 실제 목록 hook에 사용. useSuspenseQuery 적합성은 설치 소스 및 공식 문서에서 cancellation/초기 오류 재시도/browser-only storage와 비교 검토. 기존 취소/rollback을 약화하거나 미사용 suspense hook을 추가하지 않음. 판단을 통합과 공유.
- 입력 hook은 Zustand의 검색 값·setSearch·onChange·clear를 하나의 작은 계약으로 묶는 등 실제 호출부를 단순화. 입력 값은 즉시 처리하고 후보 cache/잠금을 deferred로 바꾸지 않음.
- 기존 87 tests를 보존하고 변경된 경로/mock 경로를 정확히 갱신. 실패 재시도·cancelQueries·동일 카드 잠금·parallel rollback·Undo·DnD·가상화/포커스 유지.
- 공통 UI 담당이 전달할 Input clear API 및 Header/버튼 API는 통합 단계에서 연결할 수 있도록 구조 준비. 별도 UI 컴포넌트 파일을 가정하여 import하지 말 것.
- lint/typecheck/tests/format 및 task/실제 records 갱신 후 커밋. main 통합과 browser/build는 통합 담당.
