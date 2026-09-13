# 설계 결정

아래 1~5는 초기 결정입니다. 메뉴 우선 및 선택 기능 제외 결정은 이 문서 후반의 후속 승인으로 확장되어 현재 가상화·Undo·DnD까지 구현되었습니다. 배포는 계속 제외합니다.

1. 지원자 데이터는 TanStack Query, UI 설정은 Zustand로 나눕니다. Query의 낙관적 데이터를 persist에 중복 저장하지 않습니다.
2. 브라우저 mock API와 localStorage를 사용합니다. 별도 서버 없이 실행하며 단일 탭 범위에서 저장 직전 최신 값을 읽어 갱신합니다.
3. 같은 카드의 중복 이동을 차단하고 실패한 카드만 롤백합니다. 전체 스냅샷 복원으로 다른 카드 변경을 지우지 않습니다.
4. DnD 대신 단계 메뉴를 사용하여 키보드 접근성을 기본 경로로 제공합니다.
5. 6시간 범위에서 필수 기능·검증·기록을 우선하고 Undo, 가상화, 배포는 제외합니다. 기능별 독립 세션·워크트리로 개발하고 커밋을 보존합니다.

## 검토 중 수정한 선택
- 시드가 250명이라는 사실은 저장 스키마의 길이 제한이 아닙니다. 저장 배열에는 유효한 빈 배열도 허용합니다.
- shadcn CLI가 추가한 외부 cn 의존성은 제거하고 로컬 cn 함수로 교체했습니다. 요청한 유틸의 역할이 중복되었기 때문입니다.
- 같은 카드 잠금은 QueryClient별로 공유하여 여러 hook 인스턴스나 unmount/remount에서도 유지합니다. 전체 캐시 snapshot 롤백은 채택하지 않았습니다.
- 렌더링 예외는 Next.js error.tsx로 복구하고 예상 가능한 API 오류는 UI에서 처리합니다. 현재 부분 경계를 추가할 필요가 없어 react-error-boundary는 설치하지 않았습니다.
- pnpm 캐시에 포함된 프로젝트 복사본이 테스트에 중복 수집되어 Vitest 범위를 src로 제한했습니다. 실제 프로젝트의 테스트만 최종 결과로 집계합니다.
- JSDOM 테스트 timeout의 CPU profile에서 nwsapi@2.2.27의 native matches 재진입을 확인했습니다. `jsdom>nwsapi: 2.2.23` override로 고정해 원래 50개 테스트를 모두 통과시켰습니다. 테스트 생략/timeout 증가는 하지 않았습니다.
- Turbopack production CSS 처리의 내부 포트 권한 오류가 반복되어 공식 지원 옵션 `next build --webpack`을 build 스크립트로 선택했습니다. 개발 서버는 기본 Turbopack을 사용합니다.
- 리뷰 가능한 코드 형식을 통일하려고 Prettier를 개발 의존성으로 추가했습니다.

## 추가 구현 기준 (2026-09-13)
- 사용자 요청에 따라 Input, Button 등 공통 컨트롤은 기본 HTML 요소의 props를 확장하고 native props/ref와 의미·키보드 동작을 보존합니다. 현재 Input은 `React.ComponentProps<"input">`, Button은 `React.ComponentProps<"button">`에 variant/asChild를 추가하는 방식으로 이미 구현되어 있습니다.
- 동시성이 필요한 곳에는 적극적으로 활용하되 데이터 정합성을 유지합니다. 현재 서로 다른 카드의 저장은 병렬 허용하고 동일 카드는 동기 잠금하며, 실패한 카드만 롤백합니다.
- React 동시성 API는 입력 반응성과 비용이 큰 결과 렌더링을 분리할 필요가 있을 때 적용합니다. 제어 입력 값은 즉시 갱신하고, 외부 store 변경을 transition으로 감싸는 것만으로 렌더링이 지연된다고 가정하지 않습니다.

- 후속 요청으로 `useTransition`(긴급하지 않은 React 상태 전환)과 `useDeferredValue`(검색·필터 결과 등 무거운 파생 화면)를 적극 검토하도록 명시했습니다. 입력은 즉시 반영하고, 결과 수·빈 상태는 표시 중인 결과와 일치시키며 필요하면 갱신 중 상태를 알립니다. 두 API는 요청 잠금이나 응답 순서 보장의 대체 수단으로 사용하지 않습니다.
- 로딩은 최초 로딩의 레이아웃 유지 skeleton, 기존 데이터를 유지하는 백그라운드 갱신, 영향받는 카드/컨트롤의 저장 중 표시로 구분합니다. 오류는 최초 조회·재조회·저장·렌더링 예외별로 복구 경로를 제공하고, 내부 오류 원문 노출과 중복 알림을 피합니다. 상태 알림의 접근성, 키보드 포커스, 카드별 롤백을 유지합니다.

## 후속 구현: concurrent-feedback
- `useDeferredValue`는 안정적으로 메모한 검색·직무 조건에만 적용합니다. 보드에 memo 경계를 두고, 결과 개수·빈 상태·카드는 동일한 조건을 사용합니다. 지원자 캐시와 카드 잠금은 최신 상태를 즉시 반영합니다.
- `useTransition`은 명시적 새로고침/재시도의 비동기 Action 대기를 관리합니다. 별도 ref 잠금과 Query 상태로 중복을 제외하고, 카드 저장 중에는 새로고침을 비활성화합니다. 먼저 시작한 조회는 카드 mutation이 취소해 이전 응답의 덮어쓰기를 막습니다.
- 첫 실패 화면은 재시도 동안 버튼을 유지하고, 성공 후 해당 버튼이 사라져 포커스가 body에 남을 때 검색창으로 복구합니다. 배경 갱신은 보드를 유지합니다. 알려진 저장소 오류는 코드별 안전한 안내를 제공하고 임의 오류 원문은 표시하지 않습니다.
- 검색 결과 개수는 명명된 status이되 aria-live=off로 매 키 입력의 읽기를 피하고, 지연 상태는 aria-busy와 시각 표시로 전달합니다. 네트워크 대기는 별도의 live status입니다.

## 알려진 한계
- 서버가 없는 데모이므로 브라우저/포트마다 데이터가 다르고 다중 탭 동시성은 보장하지 않습니다.
- 같은 카드 연속 이동은 직렬 큐 대신 저장 중 비활성화합니다. 요청 유실이나 이전 응답 덮어쓰기를 막으며 후속 Undo도 같은 잠금을 사용합니다.
- 기본 250명 시드를 유지합니다. 후속 승인된 가상화에서 1,000건을 추가 검증합니다.

## 후속 구현: virtualization
- 2026-09-13 사용자 후속 요청으로 가상화를 기존 제외 범위에서 이번 승인 범위로 이동했습니다. 기본 250명 시드는 유지하고 1,000건으로 추가 검증합니다.
- `@tanstack/react-virtual` 3.14.12를 추가합니다. 스크롤 범위와 실제 카드 높이 측정을 검증된 라이브러리에 맡기고 카드별 저장/롤백과 키보드 포커스는 앱에서 관리합니다. 패키지/lockfile은 통합 담당이 설치했습니다.

- 실제 카드 높이를 측정하고 overscan 2를 사용합니다. 현재 포커스·최근 포커스 요청과 마지막 카드를 제한적으로 보존해 상세/메뉴 복귀와 외부 Shift+Tab 진입을 보장합니다. Tab 순서는 전체 데이터 기준이며 필요한 카드만 렌더링한 뒤 포커스를 이동합니다.
- 검색·직무의 지연된 조건을 스크롤 초기화 키로 사용합니다. 카드 mutation은 스크롤을 일괄 초기화하지 않고 영향받은 카드에만 포커스를 복구합니다. 가상화 인스턴스는 컴포넌트 내부에서 사용하며 React Compiler 자동 메모이제이션을 제외합니다.

## 후속 구현: Undo
- 2026-09-13 사용자 선택으로 카드별 마지막 성공 이동 한 번 되돌리기를 승인 범위에 추가했습니다. 새 의존성 없이 기존 Query mutation과 카드 메뉴를 확장합니다.
- 이력은 QueryClient별 메모리 저장소에서 관리하여 hook remount와 가상화에 유지하고 페이지 새로고침에는 초기화합니다. Zustand/localStorage에는 이력을 저장하지 않습니다.
- 성공 일반 이동은 해당 카드의 이전/저장 단계 이력을 교체합니다. 성공 Undo는 이력을 소비하며 실패한 일반 이동과 Undo는 이력을 보존합니다.
- Undo도 같은 카드 동기 잠금, 조회 취소, 낙관적 변경, 해당 카드 롤백, 성공 후 영속 저장 경로를 사용합니다. 현재 단계와 저장 단계가 불일치하면 오래된 이력의 실행을 거부합니다.
- 메뉴는 되돌릴 단계 이름을 표시합니다. 기존 가상화의 카드 이동 포커스 복원 경로를 사용하고 검색 입력과 다른 카드의 포커스를 불필요하게 가져오지 않습니다.

## 후속 구현: DnD
- 사용자 “선택사항 이어서 진행하자”에 따라 남은 후보인 단계 간 드래그 이동을 승인 범위로 옮깁니다. 초기 메뉴 우선 결정은 키보드·터치 대체 경로로 유지합니다.
- native HTML drag/drop을 사용해 새 의존성 없이 데스크톱 마우스 이동을 제공합니다. 별도 핸들로 상세 보기와 메뉴 클릭을 분리합니다. 키보드와 터치는 기존 단계 메뉴를 사용하며 컬럼 안 순서 변경은 지원하지 않습니다.
- 드롭도 기존 Query mutation으로 전달하므로 같은 카드 중복 차단·다른 카드 병렬·카드별 롤백·성공 후 저장·Undo 이력 정책을 공유합니다. 드래그 상태는 UI 메모리에만 유지합니다.

## 후속 구현: 재사용성과 구조 정리
- 사용자 선택사항 1~4에 따라 공통 Input의 명시적 clear action, 실제 초기화/재시도/닫기 버튼 래퍼, left/center/right 슬롯 Header를 제공합니다. native props/ref는 유지합니다. 실제 취소 액션이 없는 화면에 CancelButton을 추가하지 않고 의미에 맞는 CloseButton을 사용합니다.
- 지원자 기능 경계는 유지하면서 내부를 컴포넌트별 폴더와 api/constants/types/utils/hooks/queries/stores로 나눕니다. 테스트는 해당 모듈 가까이 두고 긴 상대 경로는 프로젝트 alias를 사용합니다. 사용하지 않는 호환용 barrel과 추상화는 추가하지 않습니다.
- Skeleton primitive는 유지하며 카드/보드/요약 영역의 실제 배치를 조합하는 컴포넌트로 구체화합니다. 입력 훅은 Zustand 검색 값과 변경/clear 로직을 감싸되 즉시 입력과 기존 persist/deferred rendering 정책은 유지합니다.
- `queryOptions` factory가 실제 목록 hook에 query key와 AbortSignal을 전달하는 queryFn을 제공합니다. key와 API 요청을 각각 별도 파일로 관리합니다.
- `useSuspenseQuery` 도입은 검토 후 현재 목록에서는 보류합니다. 공식 API는 cancellation 미지원과 enabled 미지원 제약을 명시합니다. 현재 목록은 카드 mutation 전에 이전 조회를 취소하는 계약, 브라우저 localStorage 기반 API, 최초 실패 화면의 버튼 유지 및 재시도 포커스 복구를 갖습니다. 이를 유지하기 위해 `useQuery(candidateQueryOptions())`를 사용하며 미사용 Suspense hook을 추가하지 않습니다. 추후 서버 API/새 조회 화면 도입 시 경계와 오류 복구를 함께 설계하여 재검토합니다.
- 근거: 설치된 `@tanstack/react-query/src/useSuspenseQuery.ts`, `suspense.ts`, `queryOptions.ts` 및 [useSuspenseQuery 공식 API](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useSuspenseQuery), [queryOptions 가이드](https://tanstack.com/query/latest/docs/framework/react/guides/query-options), [Suspense 가이드](https://tanstack.com/query/latest/docs/framework/react/guides/suspense). 2026-09-13 확인.

## 후속 구현: Query와 렌더링 경계
- `eslint-plugin-better-tailwindcss` 4.7.0을 개발 의존성으로 설치하고 `enforce-canonical-classes`를 error로 적용했습니다. 앱 CSS entryPoint와 rootFontSize 16을 명시합니다. `pnpm lint:fix`로 `min-w-[1240px]` 등을 canonical 표기로 고칩니다. IntelliSense 경고 자체를 숨기지 않고 코드와 lint에서 원인을 해결합니다.
- `useCandidates`가 안정적인 기본 배열/hasData/summary/선택 후보를 반환합니다. 초기 빈 배열을 Query의 initialData/placeholderData로 넣지 않으며 정상적으로 읽은 빈 목록만 조회 성공으로 취급합니다. 실제 undefined 처리를 소비 컴포넌트에서 제거하면서 조회 취소와 재시도 포커스 계약을 유지합니다.
- `page.tsx`는 서버 컴포넌트로 header/소개/main/footer를 조합합니다. 클라이언트 `CandidatesApp`에는 브라우저 저장소/UI provider/필터/카드 상호작용을 남깁니다. 서버 shell을 클라이언트 파일에서 import하지 않습니다.
- `loading.tsx`는 route streaming skeleton입니다. 현재 정적으로 생성되는 단일 페이지에서 이 경계가 API 조회를 기다린다고 가정하지 않습니다. 클라이언트 useQuery 최초 대기는 BoardSkeleton/metric skeleton, 배경 조회는 기존 데이터 유지, mutation은 카드별 feedback을 사용합니다.
- 보드와 상세 render 예외는 개별 CandidateErrorBoundary에서 복구하고 외부 후보 영역 boundary는 나머지 client render 예외를 다룹니다. 정적 서버 페이지 예외는 기존 route error.tsx를 사용합니다. API 오류는 throw하지 않고 기존 inline/toast 경로를 유지합니다. 새로운 데이터 API 없이 Suspense용 가짜 Promise를 만들지 않았습니다.
- Next/TypeScript paths와 Vite 기반 Vitest resolve.alias의 @가 모두 src를 가리킵니다. 이미 작동하는 alias를 사용하므로 중복 Vite 플러그인이나 Next용 vite.config를 추가하지 않았습니다.

## 후속 구현: 검색 조합과 보드 공간
- Input의 left/right는 ReactNode 슬롯입니다. absolute 위치와 고정 padding으로 아이콘을 겹치는 대신 flex 레이아웃에서 슬롯 폭을 확보합니다. 기존 clearButton controlled 계약은 유지하고 오른쪽 슬롯과 함께 조합합니다.
- native input props/ref/className을 유지하며 composite border/background는 wrapperClassName으로 지정합니다. SearchBar는 Input을 조합하여 search type/기본 돋보기를 제공하고 좌우 슬롯의 추가·교체를 허용합니다.
- ResetButton은 초기화, ReloadButton은 배경 새로고침, RetryButton은 실패 후 재시도에 사용합니다. 공통 ActionButton이 native props/ref/pending/disabled를 관리합니다.
- 컬럼의 max-height를 min(60vh,720px)에서 max(720px,75vh)로 확대합니다. 카드 실측과 가상화를 유지하고 paddingStart/End를 가상화 geometry에 포함해 끝 카드 여백도 스크롤 범위로 계산합니다. 임의 스크롤 위치에서 카드 일부가 보이는 것은 스크롤 목록의 일반 동작이며 마지막 카드 전체는 끝까지 스크롤해 볼 수 있습니다.

## 후속 검토: DnD 라이브러리 전환과 조회 Guard
- 사용자 요청의 목적은 앱 소유 DnD 복잡도 감소입니다. 최신 공식 React API인 @dnd-kit/react 0.5.0을 사용하고, 한국어 accessibility/feedback 설정에 명시 import하는 @dnd-kit/dom 0.5.0도 직접 의존성으로 선언합니다. sortable/reorder 패키지는 추가하지 않습니다.
- 센서/충돌 판정/드래그 표시/자동 스크롤은 라이브러리에 맡기되 카드의 현재 단계·잠금·필터 변경 검증은 앱 도메인 규칙으로 유지합니다. 기존 native DataTransfer/token/drag image/수동 edge scrolling은 제거 대상입니다.
- Query Guard는 useQuery cancellation을 유지하면서 최초 조회 상태, 재시도 UI/포커스 및 배경 갱신 표시를 소유합니다. 재시도 잠금/transition은 Query observer와 최신 상태를 함께 읽도록 useCandidates 내부에 둡니다. 이는 React Suspense 자체가 아니라 선언적으로 조건부 자식을 렌더하는 Guard이며, Promise throw 또는 가짜 초기 데이터를 추가하지 않습니다.
- 상세 전용 CloseButton은 SheetClose와 범용 버튼을 조합합니다. 페이지별 위치/라벨을 전역 CloseButton 기본값에 섞지 않으며 상세 사용처의 props/null children을 제거합니다.

- Vitest는 DOM 부하가 큰 1,000-card 전체 탐색과 실제 센서 검증의 CPU 경합을 피하도록 maxWorkers:1로 실행합니다. 테스트 자체의 시간 제한/검증 범위를 완화하지 않습니다. 앱 요청의 병렬성과 별개의 테스트 실행 설정입니다.
