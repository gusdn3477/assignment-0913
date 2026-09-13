# Orbit · 채용 파이프라인

지원자를 서류검토 → 면접 → 처우협의 → 최종합격 / 불합격 단계로 관리하는 프론트엔드 채용 보드입니다. 모든 이름과 이메일은 생성된 데모 데이터입니다.

## 실행

Node.js **22.13 이상**, pnpm **11.15.1** 기준입니다.

```sh
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다. 포트가 사용 중이면 `pnpm dev --port 3100`으로 실행합니다.

```sh
pnpm verify  # lint → TypeScript → Vitest → production build
pnpm start  # build 결과 실행
```

Production build는 `next build --webpack`을 사용합니다. 개발 환경의 Turbopack CSS 처리 중 내부 포트 권한 오류를 재현하여 검증 가능한 공식 빌드 옵션을 선택했습니다. `pnpm format:check`로 코드 형식도 확인할 수 있습니다.

## 사용 방법

- 지원자 이름을 검색하고 직무를 선택하면 두 조건을 모두 만족하는 카드가 표시됩니다.
- 검색창의 지우기 버튼은 이름만 지우고 직무 선택을 유지합니다. `Tab` → `Enter`로도 실행하며 입력창으로 포커스가 돌아갑니다. **초기화**는 두 조건을 모두 지웁니다.
- 카드 본문을 누르면 상세 패널이 열립니다. `Esc`로 닫으면 원래 카드로 포커스가 돌아갑니다.
- 카드의 **단계 이동** 메뉴에서 목적지를 선택합니다. 키보드 Tab·Enter·방향키로도 사용할 수 있습니다.
- 마우스로 카드의 **드래그 핸들**을 잡아 다른 단계에 놓아도 이동할 수 있습니다. 키보드와 터치에서는 단계 이동 메뉴를 사용합니다. 컬럼 안의 카드 순서는 지원일 기준으로 유지됩니다.
- 이동은 즉시 화면에 반영되며 **저장 중**에는 같은 카드의 추가 이동이 차단됩니다.
- 저장에 실패하면 해당 카드만 원래 단계로 돌아오고 오류 알림이 나타납니다. 다른 카드의 성공한 이동은 유지됩니다.
- 저장에 성공한 카드의 단계 이동 메뉴에서 **이전 단계로 되돌리기**를 사용할 수 있습니다. 카드별 마지막 성공 이동 한 번을 되돌리며, 실패하면 재시도할 수 있습니다. 이력은 페이지 새로고침 전까지만 유지됩니다.
- 검색 입력은 즉시 반영되며 결과가 따라오는 동안 이전 결과와 갱신 중 표시를 유지합니다.
- 새로고침 중에도 기존 보드를 사용할 수 있습니다. 재조회 실패는 보드 위에 안내하며 다시 불러올 수 있습니다. 카드 저장 중에는 새로고침이 잠시 비활성화됩니다.
- 좁은 화면에서는 보드를 가로 스크롤하고, 각 컬럼의 목록은 독립적으로 스크롤합니다.
- 컬럼은 보이는 카드와 키보드 접근에 필요한 카드만 렌더링합니다. Tab/Shift+Tab으로 전체 지원자에 접근할 수 있으며, 검색·직무 조건이 바뀌면 각 목록을 맨 위로 되돌립니다.

## 기술과 mock API

TypeScript strict · Next.js App Router · React · Tailwind CSS · shadcn/ui · TanStack Query · Zustand. `cn()`은 `clsx`와 `tailwind-merge`를 조합한 로컬 함수입니다.

실제 백엔드나 HTTP mock 서버는 없습니다. 비동기 브라우저 API가 요청마다 **200~800ms 지연**과 **약 15% 실패**를 재현합니다. 초기 조회도 실패할 수 있으며 오류 화면의 다시 불러오기를 사용하면 됩니다.

- 최초 데이터는 결정적으로 생성한 지원자 250명입니다. TanStack Virtual로 컬럼별 가상화를 적용하며 1,000건 데이터도 검증합니다.
- 성공한 단계 변경만 `hiring-pipeline:candidates:v1`에 저장합니다. 최초 조회는 저장소에 쓰지 않습니다.
- TanStack Query가 지원자 캐시와 낙관적 변경을 관리합니다.
- Zustand는 검색·필터·선택 ID를 관리하며 검색·필터만 `hiring-pipeline-ui`에 저장합니다.
- `useDeferredValue`는 검색·직무 조건에만 적용하고 메모된 보드로 입력 렌더링 비용을 줄입니다. 지원자 데이터와 저장 중 잠금은 지연하지 않습니다.
- `useTransition`의 비동기 Action으로 재시도 대기 상태를 관리합니다. 중복 요청은 별도 잠금으로 막으며 Query/Zustand 자체를 transition 상태로 취급하지 않습니다.
- 공통 Input/Button은 기본 HTML 요소의 props를 확장하여 native 속성·이벤트·ref를 전달합니다.
- 목록 조회는 `candidatesQueryOptions()`로 query key와 AbortSignal 요청 함수를 함께 정의합니다. 현재 브라우저 저장소 목록은 조회 취소 계약을 위해 `useQuery`를 유지합니다. `useSuspenseQuery` 검토 근거는 [DECISIONS.md](DECISIONS.md)에 있습니다.
- 저장 데이터는 읽을 때 런타임 검증합니다. 지원자 데이터가 손상되면 조용히 덮어쓰지 않고 오류로 보고합니다. UI 설정 손상은 기본값으로 복구합니다.

저장은 **현재 브라우저·현재 origin·단일 탭** 기준입니다. 다른 브라우저/포트에는 공유되지 않습니다. 여러 탭의 동시 수정·인증·실제 지원자 CRUD·배포는 구현 범위 밖입니다.

### 데모 데이터 초기화와 빈 상태 확인

브라우저 개발자 도구 Application → Local Storage에서 위 두 키를 지운 뒤 새로고침하면 초기 상태로 돌아갑니다. 저장된 데모 변경도 초기화됩니다.

전체 빈 상태를 확인하려면 지원자 키의 값을 `{"version":1,"candidates":[]}`로 설정하고 새로고침합니다. 손상 데이터 에러는 해당 키에 유효하지 않은 JSON을 넣어 재현할 수 있습니다. 테스트 후 위 방법으로 초기화합니다.

실패·응답 순서·저장소 오류의 확정적 검증은 `createMockApi`의 storage/random/sleep 주입과 mutation 테스트의 제어 가능한 Promise를 사용합니다. 앱의 기본 실패 확률은 검증 편의를 위해 변경하지 않습니다.

## 세션·설계·검증 기록

### 코드 구조와 공통 컴포넌트

```text
src/components/
  ui/                 # shadcn 기반 native Input/Button/Skeleton 등
  buttons/            # ResetButton, RetryButton, CloseButton
  header/             # left/center/right 슬롯 Header
src/features/candidates/
  components/         # candidate-card, candidate-board, candidate-detail 등
  api/                # mock 요청, 오류, 시드
  constants/          # 단계/직무, 스타일, 저장 키
  types/              # 지원자/이동/Undo 및 API 타입
  utils/              # 필터, 런타임 검증, 취소 가능한 지연
  queries/            # query key 및 queryOptions factory
  hooks/              # 목록/이동/드래그/검색 입력 훅
  stores/             # UI persist 및 QueryClient별 이동 잠금·이력
```

테스트는 해당 컴포넌트·모듈 가까이 두며 기능 내부 참조는 `@/features/candidates/...`를 사용합니다. `CandidateCardSkeleton`과 `BoardSkeleton`은 기본 Skeleton을 실제 카드와 보드 배치로 조합합니다. 요약은 `CandidateMetric` 안에서 값이 없는 부분에만 skeleton을 표시합니다.

```tsx
const { value, onChange, clear } = useCandidateSearch();
<Input
  value={value}
  onChange={onChange}
  clearButton={{ onClear: clear, label: "검색어 지우기" }}
/>;
<RetryButton pending={pending} onClick={retry}>다시 불러오기</RetryButton>;
<Header left={<Brand />} center={<Navigation />} right={<Profile />} />;
```

Input의 clear는 명시적인 `onClear`를 한 번 호출합니다. 일반 입력 `onChange` 이벤트를 인위적으로 만들지 않으며, 빈 값·disabled·readOnly에는 지우기 버튼을 표시하지 않습니다. 버튼 래퍼는 native props/ref를 전달하고 기본 `type="button"`으로 의도치 않은 폼 제출을 막습니다. Header 중앙 슬롯은 선택 사항이며 좁은 화면에서 별도 행으로 내려갑니다.

- [AGENTS.md](AGENTS.md): 모든 기능 세션의 작업 규칙.
- [PLAN.md](PLAN.md): 승인된 목표·범위·완료 기준.
- [STATUS.md](STATUS.md): 현재 완료 상태·다음 작업·검증 결과.
- [DECISIONS.md](DECISIONS.md): 설계 선택과 제외 범위의 이유.
- [PROMPTS.md](PROMPTS.md): 실제 프롬프트·출력·리뷰 기록.
- [docs/tasks](docs/tasks): 기능별 계약·완료 기준·인계.
- [docs/records](docs/records): 기능별 상세 실행 기록.

기능마다 별도 세션·브랜치·워크트리를 사용했고, `type(scope): 요약` 커밋과 병합 이력을 유지합니다. 의존성이 없는 기능만 병렬 개발합니다.

## 최종 검증 결과
`pnpm verify`와 `pnpm format:check` 통과. 자동 테스트 11개 파일·103개 사례. 공통 Input ref/clear·버튼·Header와 검색 clear 통합 검증을 포함합니다. Undo 성공·실패 재시도·카드 간 격리·키보드·가상화 포커스 회귀를 포함합니다. 기본 250명 및 합성 1,000명 production 보드에서 가상화 DOM 제한·깊은 스크롤·검색·상세·이동·저장 유지·재시도·390px 화면을 확인했습니다. 전체 카드 키보드 순회와 화면 밖 이동/롤백 포커스는 자동 테스트에도 포함됩니다. 자세한 결과는 [STATUS.md](STATUS.md), [가상화 통합 기록](docs/records/virtualization-integration.md)을 참고하세요.

Undo production 검증에서 키보드 실행·포커스 복귀·되돌린 단계의 새로고침 후 저장 유지와 390px 메뉴를 확인했습니다. [Undo 통합 기록](docs/records/undo-integration.md)을 참고하세요.

DnD production 검증에서 실제 드래그·실패 롤백·재시도·키보드 Undo·새로고침 후 저장 유지와 390px 메뉴를 확인했습니다. [DnD 통합 기록](docs/records/dnd-integration.md)을 참고하세요.


## Query와 렌더링 경계
- `useCandidates()`는 항상 배열인 `data`, 실제 조회 완료 데이터가 있는지 나타내는 `hasData`, 요약 수치와 선택 후보를 반환합니다. 초기 데이터가 없는 상태를 성공한 빈 목록과 혼동하지 않습니다.
- 서버 `src/app/page.tsx`가 헤더·소개·푸터를 조합합니다. `CandidatesApp`은 브라우저 상태와 상호작용을 담당합니다.
- route `loading.tsx`는 페이지 스트리밍용입니다. 브라우저 조회는 보드/요약 skeleton 및 배경 갱신 표시를 사용하고, 보드·상세의 렌더 예외는 영역별 재시도 경계로 복구합니다. API 오류는 기존 조회/저장 피드백으로 처리합니다.
- Next/TypeScript와 Vitest는 동일한 `@ → src` alias를 사용합니다.
- `pnpm lint`는 Tailwind canonical class를 검사하고 `pnpm lint:fix`는 `min-w-[1240px] → min-w-310` 같은 표기를 자동 수정합니다. 에디터 진단을 숨기지 않습니다.

추가사항의 검증 기록은 [candidate-boundaries](docs/records/candidate-boundaries.md)에 있습니다.
