# DnD 라이브러리·조회 Guard 통합 기록

## 실제 사용자 요청
- DnD 구현 코드가 늘어 @dnd-kit 등을 고려하는 방향으로 구현.
- useQuery loading은 Guard/Wrapper로 감싸 사용처가 loading만 던지거나 몰라도 Suspense와 비슷한 효과.
- 상세 CloseButton의 반복 variant/size/aria-label/className/null children을 기본 호출 <CloseButton />로 정리.
- 이전 사용자 지시: 커밋 접두사/scope는 영어, 내용은 한글.

## 범위/배정
- AGENTS의 독립 기능 세션·워크트리 규칙에 따라 dnd-kit-migration과 query-guard-close를 별도 배정. DnD는 board/card/native DnD tests, Guard는 app/query presentation/detail/buttons를 소유하여 겹침 방지.
- readability skill 적용: app의 initial loading/error/retry 중첩 분기를 실제 Guard로 분리. 단순 파일 이동으로 복잡성을 숨기지 않고 사용처 계약 단순화.
- 기준 main ca655ae: 108 tests 통과한 직전 코드. native drag hook 144행, token/DataTransfer/drag image/edge scroll 직접 처리.

## 공식 API/설치
- 최신 공식 https://dndkit.com/react/quickstart/ 및 provider/feedback 가이드 확인. legacy @dnd-kit/core 대신 최신 React binding API를 우선 검토.
- 통합 담당 `pnpm add @dnd-kit/react`: 0.5.0 설치 성공, 7 packages 추가. 명시적으로 가져올 한국어 accessibility/feedback API 때문에 기능 담당이 @dnd-kit/dom 0.5.0 직접 의존성 요청.
- 실제 구현/검증/비교 수치는 기능 records와 최종 통합 결과에 이어 기록합니다.

## 중간 검토와 검증
- query-guard-close 167450e 통합. 기존 app acceptance를 완화하지 않고 실패 후 재시도 시점 불일치를 발견/수정: transition과 observer를 useCandidates에 함께 배치. 111 tests 단일 worker 및 lint/typecheck/format 통과.
- DnD worktree direct next build 최초 실행은 Turbopack symlink filesystem root 오류. 프로젝트 기존 빌드 명령과 동일한 next build --webpack 재실행은 성공.
- 기능 production 브라우저에서 실제 pointer 최서연 서류검토→면접 저장 성공, 저장 중 카드/새로고침 잠금 및 상세 버튼 focus 확인. Undo 시도 후 reload에는 면접 유지: 데모 실패 가능성이 있어 성공으로 기록하지 않음. 메뉴로 원래 단계 복원 후 다시 확인.

- 기능 production에서 복구 저장 한 번 더 실패 후 재시도 성공, 서류검토1명/메뉴 활성화 확인. 영역 밖 pointer drop은 단계/저장을 바꾸지 않음. 검색 초기화250명, console error/warn 없음, 탭/서버 종료.
- DnD 소스 비교는 hook144+board260+card201=605행 → hook60+board302+card203=565행. 전체40행/드래그 훅84행 감소하며 센서/토큰/수동 스크롤 소유 코드 제거. 테스트 geometry helper는 검증 코드로 별도 관리.

- main 최초 pnpm format:check && pnpm verify: format/lint/typecheck 통과, 106/109 tests. default parallel JSDOM에서 app Drag not started1, 가상화5초/전체 Tab30초 timeout2. useInsertionEffect 경고도 발견해 DnD 담당에게 동일 기능 correction 요청. 테스트 결과를 완료로 처리하지 않음.
- 기본 Vitest worker를1로 제한: 실제 센서/1000-card DOM CPU 경합을 줄여 기존 각 테스트 시간 제한을 유지하고 표준 pnpm verify의 재현성을 확보. 테스트 생략/시간 제한 증가 없음.

- 통합 재검토: 렌더된 drag handle만으로 library sensor 준비를 보장하지 못함. helper에서 라이브러리가 설정하는 aria-describedby의 유효 instruction node/aria-disabled=false를 확인한 뒤 단 한 번 입력하도록 correction. 임의 sleep이나 이벤트 반복 재시도 대신 실제 준비 상태 사용.

- 준비 상태 대기로 재현 원인을 더 좁힘: 이전 app 테스트의 fake setInterval 타이머를 바로 useRealTimers로 폐기하면 JSDOM requestAnimationFrame 기반 DnD scheduler 예약이 사라짐. 테스트 간 예약 작업 배출/타이머 복구 순서 correction 후 app14 통과 및 useInsertionEffect 경고0 확인. production 변경으로 우회하지 않음.

- correction a16b1d9를 main783c35f로 cherry-pick. 최종 main pnpm format:check && pnpm verify에서 format/lint/typecheck 통과, 13 files/109 tests 통과(47.47초). 1,000-card 전체 Tab17.03초, real app drag0.77초. 경고 없음. 이어 production build 실행.

- 최종 main production webpack build 성공. 3103 production에서250명/모든 단계, 최서연 상세 기본 닫기 아이콘의 Enter 닫기 및 원래 카드 focus 복귀, Guard 배경 새로고침 pending/보드 유지 확인. 테스트 카드 서류검토 복원 상태도 main 새 조회에서 확인.
- 390px 상세 screenshot에서 닫기 위치/아이콘/본문 정상, 닫기 클릭 성공. document clientWidth/scrollWidth 모두390. 검색 지우기250명 복원, console error/warn [], viewport 초기화/탭 닫기/서버 종료.
- 미해결 기능 이슈 없음. 검증 중 실패·원인·수정 이력 유지. DnD은 컬럼 내 순서 변경을 추가하지 않으며 키보드의 기본 접근 경로는 단계 이동 메뉴 유지.
