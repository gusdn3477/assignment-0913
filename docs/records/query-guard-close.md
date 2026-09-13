# query-guard-close 구현 기록

## 실제 요청과 범위
사용자: “loading은 useQuery 써서 어쩔 수 없다면 차라리 Guard나 Wrapper 등을 사용해 사용자는 loading props만 던져주거나 아예 몰라도 Suspense와 비슷한 효과 내게 구현”, 상세 버튼의 명시적 variant/size/aria-label/className/null children 호출을 “<CloseButton /> 이렇게 호출하게 수정”. 커밋 접두사·scope 영어/설명 한글.
독립 워크트리 `[기능 작업 공간]`, 브랜치 `[기능 브랜치]`. DnD 및 의존성은 별도 담당.

## 구현 출력
- `CandidateQueryGuard`가 hydration, 최초 loading fallback, 초기 API 오류, 재시도 화면 유지, 성공 후 검색 focus 복원과 background refresh 안내를 조합합니다. 기존 데이터를 가진 조회는 새로고침 중에도 children을 유지합니다.
- 사용처 API:
  ```tsx
  <CandidateQueryGuard
    query={query}
    blocked={pendingIds.size > 0}
    fallback={<BoardSkeleton />}
  >
    <CandidateToolbar ... />
    <DeferredBoard ... />
  </CandidateQueryGuard>
  ```
  `BoardContent`의 로딩 중첩 분기, 직접 refetch/transition/요청 lock/focus effect를 제거했습니다. query의 데이터/summary는 기존 정규화 값을 사용합니다.
- 재시도 Action과 동기 중복 잠금은 실제 Query observer와 같은 `useCandidates` 내부에서 관리합니다. `retry(blocked)`는 시작 여부를 반환하며 취소 가능한 기존 `refetch({ throwOnError:false, cancelRefetch:false })` 경로를 유지합니다.
- 공통 `LoadingGuard`는 loading/fallback/children을 받아 metric 값과 Query 화면에서 사용합니다. 가짜 Suspense Promise, initialData 빈 배열이나 추가 Query observer/context를 만들지 않았습니다. 렌더 예외 경계와 API 실패 처리는 분리합니다.
- 상세 전용 `CloseButton`은 `SheetClose asChild` + 공통 버튼을 조합해 상세 라벨/위치/아이콘 기본값을 제공합니다. 실제 상세 호출은 `<CloseButton />`. 공통 버튼은 icon size이면 문구를 생략하고 접근성 이름 “닫기”를 기본 제공하며 native props/ref override를 유지합니다. 상세 이름은 기존 “상세 닫기”.

## 검토와 수정 이력
- AGENTS/PLAN/STATUS/DECISIONS/task, 설치된 Next `use-client.md`, readability/coupling 스킬을 읽었습니다. children 조합을 사용하고 조회 책임 범위 안에서만 훅을 확장했습니다.
- 첫 구현에서 transition을 자식 Guard에 두자 실패 재시도 완료 시 부모 query props가 Query notify 전에 fetching=true로 남아 기존 acceptance 1건이 실패했습니다. 단독 실행에서도 재현했습니다.
- transition/동기 잠금을 observer와 같은 훅으로 옮겨 완료 렌더에서 최신 Query snapshot을 읽도록 고쳤습니다. 기존 테스트에 wait/timeout 변경 없이 관련 23/23 통과했습니다.
- 신규 테스트: 기본 상세 버튼 Enter 닫기 및 trigger focus 복원, native ref/accessible label/style override와 실제 클릭 닫기, 공통 icon 버튼 기본 접근성 이름/아이콘/문구 생략.

## 검증
- 관련 Vitest 3 files / 23 tests 통과. 기존 app 14 tests에는 실패 후 재시도, 빈 성공/검색 없음, background refresh 실패/복구, mutation의 이전 조회 취소, 같은 카드 잠금, 검색 clear/persist, Undo/DnD 회귀가 포함됩니다.
- `node_modules/.bin/eslint .`, `node_modules/.bin/tsc --noEmit`, `node_modules/.bin/prettier --check src '*.ts' '*.mjs' '*.json'`, `git diff --check`: 통과.
- 기본 전체 병렬 Vitest는 109/111 통과, 검색 clear(5초) 및 1,000개 Tab 순회(30초) timeout 2건이 발생했습니다. 기능별 병렬 작업으로 CPU 경합 가능성을 확인하려고 timeout/테스트는 변경하지 않고 worker 수를 1로 제한해 재검사했습니다.
- production build/browser는 통합 담당 소유입니다. 새 의존성은 없고 기존 root node_modules를 symlink하여 직접 bin으로 검증했습니다.

- 최종 `node_modules/.bin/vitest run --maxWorkers=1`: **13 files / 111 tests 통과** (30.34초). 검색 clear 474ms, 기존 전체 Tab 순회 8.118초로 timeout 없이 통과. 미해결 기능 이슈 없음.
