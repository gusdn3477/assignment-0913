# query-guard-close

## 요청/소유권
사용자: useQuery 로딩을 Guard/Wrapper로 감싸 사용처가 loading만 전달하거나 모르게 Suspense 유사 효과, 상세 CloseButton 호출을 <CloseButton />로 단순화.
독립 [기능 브랜치]/[기능 작업 공간]. 소유: candidates-app.tsx(테스트 제외), hooks/use-candidates.ts 및 필요 새 query presentation hooks/context, candidate-load-feedback/**, candidate-metric/**, candidate-detail/**, src/components/buttons/close-button.tsx 및 tests, 새 공통 guard files/tests, 이 task/record. board/card/DnD/candidates-app.test.tsx/package/lock/최상위 문서 금지.

## 계약
- 실제 사용되는 LoadingGuard 또는 query wrapper로 initial loading/error/retry 상태와 자식 분기 캡슐화. 선언적 fallback + children 형태. 호출 컴포넌트에 중첩 ternary/수동 retry locking/hasData 체크 반복 제거. 단순 조건 이동보다 데이터와 상태 계약 명확히.
- useQuery cancellation, 초기 실패 재시도 버튼 유지/성공 후 검색 focus, background refresh 보드 유지, mutation 동안 refresh 차단, 실제 성공한 empty list 구분 유지. fake suspense promise/initialData=[] 금지.
- 요약 metric loading도 적절한 guard로 조합. React render 오류 boundary와 API 실패 구분 유지, UI·접근성 바뀌지 않음.
- 상세 사용처는 <SheetClose asChild><CloseButton /></SheetClose> 또는 적합한 상세 전용 CloseButton 조합으로 props/null children 없이 실제 닫힘/이름/위치/아이콘 기본 설정. 범용 버튼에 무분별하게 페이지 종속 기본 넣지 않도록 실사용 책임에 맞게 설계. native props/ref override 가능/keyboard/실제 Sheet close/focus 복원 보존. 기존 tests 의미 유지(라벨이 바뀌면 root에 공유).
- Next 설치 docs/readability skill 읽기. 관련 tests 신규/기존 통과, lint/typecheck/format, 실제 records/task 갱신 후 commit. 접두사/scope 영어, 설명 한글.

## 구현 인계
- CandidateQueryGuard(query, blocked, fallback, children)로 최초 로딩/API 실패/재시도/배경 refresh/focus를 선언적으로 조합. retry Action/동기 잠금은 useCandidates의 Query observer와 함께 관리.
- metric은 공통 LoadingGuard 적용. 상세 전용 CloseButton이 SheetClose를 조합하여 호출은 <CloseButton />, 기존 '상세 닫기' 유지.
- 실제 Sheet keyboard/ref/override 2개, 공통 icon accessibility 1개 추가. 관련 23/23 통과. 전체 13 files/111 tests(--maxWorkers=1), lint/typecheck/format/diff-check 통과. 기본 병렬 전체 검사 timeout 2건과 재검사 결과는 records에 기록.
- 신규 의존성/소유권 밖 파일 변경 없음. 상세 구현/실패 수정 기록: docs/records/query-guard-close.md.

- 구현 완료, 통합 인계 가능. 미해결 기능 이슈 없음. production build/browser는 통합 담당이 수행합니다.
