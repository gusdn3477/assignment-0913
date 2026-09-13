# search-board-polish 작업 기록

## 실제 요청

> - 카드 영역 부분 height가 너무 좁음 더 넓혀도 됨. 또한 영역떄문에 카드 하단이 잘려보임
> - 내가 말한게 SearchBar 같은건데 Input에서 left, right에 돋보기, clearButton 을 넣어서 사용 가능하게 확장성있게 하자는거
> - 초기화 / 새로고침도 ResetButton, ReloadButton 등으로 추상화 가능

통합 담당 배정: `docs/tasks/search-board-polish.md` 계약을 독립 워크트리에서 구현. `src/**`, 해당 task/record 소유. 의존성 변경 없이 native props/ref, clear API, 가상화/저장/포커스 계약을 유지하고 lint/typecheck/test/format 검증 후 인계.

## 구현 결과와 결정

- Input에 `left`/`right` ReactNode 슬롯을 추가하고 실제 flex 흐름에서 입력 옆에 배치했습니다. 고정 padding/absolute 아이콘을 사용하지 않으며 슬롯은 가용 너비 40% 내에서 줄바꿈할 수 있습니다. 명시적 `clearButton`은 right 내용 뒤에 함께 배치하고, 기존 controlled-value 계약과 disabled/readOnly/빈 값 처리, type=button, clear 후 input focus를 유지합니다.
- `className`은 native input, `wrapperClassName`은 조합된 필드 외곽의 배경/테두리/포커스 스타일입니다. 슬롯 없는 Input은 종전처럼 wrapper 없이 native input만 렌더링합니다.
- `SearchBar`는 Input의 돋보기 기본 left와 clear API/right 슬롯을 활용합니다. type은 search로 제한하고 나머지 native props/ref를 전달합니다. left=null로 기본 아이콘 생략 가능. CandidateToolbar가 SearchBar를 실제 사용하며 label, 즉시 입력, 검색 persist/no-refetch 로직은 유지합니다.
- ResetButton은 기존 필터 초기화에 유지하고, ReloadButton을 background refresh에 연결했습니다. 최초 조회 실패/렌더 오류는 RetryButton을 유지합니다. ActionButton의 pending/disabled/ref/native form 의미를 공유합니다.
- 컬럼 최대 높이를 `min(60vh,720px)`에서 `max(720px,75vh)`로 확대했습니다. 작은 화면은 문서 세로 스크롤을 이용하며 각 컬럼은 여전히 가상화됩니다. 측정 카드 높이와 overscan 정책은 유지했습니다.
- virtualizer paddingStart/scrollPaddingStart=6, paddingEnd/scrollPaddingEnd=16과 좌우 6px를 적용했습니다. 끝 여백이 가상화 총 높이에 포함되어 마지막 카드와 outline이 스크롤 끝에서 잘리지 않습니다.
- Next 설치 문서 `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`, repository 지침/PLAN/STATUS/DECISIONS/task, cohesion skill을 읽고 기존 기능별 파일 경계를 유지했습니다. 새 상태 동시성 경계가 필요 없는 조합/레이아웃 변경으로 기존 deferred 검색/Query 요청 계약을 그대로 사용합니다.

사용 예:

```tsx
<SearchBar
  aria-label="사이트 검색"
  value={query}
  onChange={onChange}
  right={<span>⌘ K</span>}
  clearButton={{ onClear: clear, label: "검색 지우기" }}
  className="h-10"
  wrapperClassName="bg-slate-50"
/>
```

## 검토와 검사 기록

- root node_modules를 symlink로 공유했습니다. `pnpm exec prettier ...` / `pnpm typecheck`는 pnpm 자동 dependency 상태 검사가 symlink의 modules 제거를 시도하며 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`로 중단되었습니다. shared modules를 변경하지 않고 같은 설치된 실행 파일을 직접 사용했습니다. package/lock 변경 없음.
- 첫 `node_modules/.bin/tsc --noEmit`에서 SearchBar의 Omit이 Input union의 controlled-clear 계약을 지우는 타입 오류 발견. `InputProps & { type?: "search" }`로 계약 보존 후 동일 typecheck 통과.
- `node_modules/.bin/prettier --write` 변경 파일 적용 후 `node_modules/.bin/prettier --check src '*.ts' '*.mjs' '*.json'` 통과.
- `node_modules/.bin/vitest run`: 12 files, **108/108 통과**, 34.02s. 새 슬롯+clear+키보드/포커스 테스트, SearchBar native form/controlled/ref 테스트, ReloadButton native/pending 테스트 포함. 가상화 테스트는 마지막 row의 실제 total-height 여백 ≥16px와 끝 스크롤 DOM 한도, 기존 전체 1,000건 Tab 탐색을 검사합니다. JSDOM은 실제 시각적 폭/높이를 계산하지 않으므로 브라우저 가시성 검사는 통합 담당이 별도로 수행합니다.
- 첫 `node_modules/.bin/eslint .`는 wrapper has variant canonical 표기 5건을 검출했습니다. `node_modules/.bin/eslint src/components/ui/input.tsx --fix`로 canonical 표기만 교정한 뒤 `node_modules/.bin/eslint .` 및 포맷 전체 검사 통과. `git diff --check` 통과.

- 통합 담당의 실제 production 브라우저 검토에서 전역 `*:focus-visible`이 조합 입력 내부에도 사각 outline을 그려 외곽 ring과 중복되는 것을 확인했습니다. `globals.css`에 `[data-slot="input-wrapper"] > input:focus-visible { outline: none; }`을 한정 적용했습니다. wrapper ring은 유지하며 plain Input과 슬롯 버튼의 outline은 건드리지 않습니다. production 재확인은 통합 담당이 수행합니다.
- 첫 git add/commit은 sandbox의 `.git/worktrees/.../index.lock` 쓰기 권한 때문에 실패했습니다. 승인된 작업 기록 커밋에 필요한 권한으로 재시도합니다.

## 남은 작업

- 통합 담당 production build/browser 검증 및 main 통합. 실제 브라우저 증거는 별도 integration record에 기록합니다.
