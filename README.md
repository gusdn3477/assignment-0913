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
- 카드 본문을 누르면 상세 패널이 열립니다. `Esc`로 닫으면 원래 카드로 포커스가 돌아갑니다.
- 카드의 **단계 이동** 메뉴에서 목적지를 선택합니다. 키보드 Tab·Enter·방향키로도 사용할 수 있습니다.
- 이동은 즉시 화면에 반영되며 **저장 중**에는 같은 카드의 추가 이동이 차단됩니다.
- 저장에 실패하면 해당 카드만 원래 단계로 돌아오고 오류 알림이 나타납니다. 다른 카드의 성공한 이동은 유지됩니다.
- 좁은 화면에서는 보드를 가로 스크롤하고, 각 컬럼의 목록은 독립적으로 스크롤합니다.

## 기술과 mock API

TypeScript strict · Next.js App Router · React · Tailwind CSS · shadcn/ui · TanStack Query · Zustand. `cn()`은 `clsx`와 `tailwind-merge`를 조합한 로컬 함수입니다.

실제 백엔드나 HTTP mock 서버는 없습니다. 비동기 브라우저 API가 요청마다 **200~800ms 지연**과 **약 15% 실패**를 재현합니다. 초기 조회도 실패할 수 있으며 오류 화면의 다시 불러오기를 사용하면 됩니다.

- 최초 데이터는 결정적으로 생성한 지원자 250명입니다.
- 성공한 단계 변경만 `hiring-pipeline:candidates:v1`에 저장합니다. 최초 조회는 저장소에 쓰지 않습니다.
- TanStack Query가 지원자 캐시와 낙관적 변경을 관리합니다.
- Zustand는 검색·필터·선택 ID를 관리하며 검색·필터만 `hiring-pipeline-ui`에 저장합니다.
- 저장 데이터는 읽을 때 런타임 검증합니다. 지원자 데이터가 손상되면 조용히 덮어쓰지 않고 오류로 보고합니다. UI 설정 손상은 기본값으로 복구합니다.

저장은 **현재 브라우저·현재 origin·단일 탭** 기준입니다. 다른 브라우저/포트에는 공유되지 않습니다. 여러 탭의 동시 수정·인증·실제 지원자 CRUD·Undo·가상화·DnD·배포는 구현 범위 밖입니다.

### 데모 데이터 초기화와 빈 상태 확인

브라우저 개발자 도구 Application → Local Storage에서 위 두 키를 지운 뒤 새로고침하면 초기 상태로 돌아갑니다. 저장된 데모 변경도 초기화됩니다.

전체 빈 상태를 확인하려면 지원자 키의 값을 `{"version":1,"candidates":[]}`로 설정하고 새로고침합니다. 손상 데이터 에러는 해당 키에 유효하지 않은 JSON을 넣어 재현할 수 있습니다. 테스트 후 위 방법으로 초기화합니다.

실패·응답 순서·저장소 오류의 확정적 검증은 `createMockApi`의 storage/random/sleep 주입과 mutation 테스트의 제어 가능한 Promise를 사용합니다. 앱의 기본 실패 확률은 검증 편의를 위해 변경하지 않습니다.

## 세션·설계·검증 기록

- [AGENTS.md](AGENTS.md): 모든 기능 세션의 작업 규칙.
- [PLAN.md](PLAN.md): 승인된 목표·범위·완료 기준.
- [STATUS.md](STATUS.md): 현재 완료 상태·다음 작업·검증 결과.
- [DECISIONS.md](DECISIONS.md): 설계 선택과 제외 범위의 이유.
- [PROMPTS.md](PROMPTS.md): 실제 프롬프트·출력·리뷰 기록.
- [docs/tasks](docs/tasks): 기능별 계약·완료 기준·인계.
- [docs/records](docs/records): 기능별 상세 실행 기록.

기능마다 별도 세션·브랜치·워크트리를 사용했고, `type(scope): 요약` 커밋과 병합 이력을 유지합니다. 의존성이 없는 기능만 병렬 개발합니다.

## 최종 검증 결과
`pnpm verify`와 `pnpm format:check` 통과. 자동 테스트 5개 파일·50개 사례가 있으며, 개발/프로덕션 브라우저에서 검색·상세·이동·새로고침·실패 복구·390px 화면을 확인했습니다. 자세한 결과와 중간 실패의 해결 과정은 [STATUS.md](STATUS.md) 및 [브라우저 기록](docs/records/browser-qa.md)을 참고하세요.
