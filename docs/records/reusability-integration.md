# 재사용성과 폴더 구조 통합 기록

## 실제 사용자 요청
사용자: “선택사항 추가” 후 다음 네 항목을 요청했습니다.
1. 공통 컴포넌트 구체화: Input clearButton, 의미별 Button 래퍼, left/center/right Header, 필요 시 컴포넌트별 Skeleton.
2. 한 폴더에 몰린 코드를 컴포넌트별로 묶고 상수·유틸·타입·훅·API·query key를 별도 폴더/파일로 분리.
3. 가능하면 useSuspenseQuery와 queryOptions 활용.
4. 입력 onChange 등을 포함한 간단한 훅 추상화. 억지로 진행할 필요는 없음.

## 범위와 배정
- 시작 main `81e7a91`, 작업 트리 clean. 공통 규칙, PLAN/STATUS/DECISIONS와 세션 가이드 확인.
- `reusable-ui`: `[기능 작업 공간]`, `[기능 브랜치]`; 공통 components와 관련 tests 소유.
- `candidate-structure`: `[기능 작업 공간]`, `[기능 브랜치]`; 지원자 기능과 page import, 관련 tests 소유.
- 통합 담당: 상위 기록·공통 API 계약·사용처 연결·review·main build/browser. 두 기능 담당에게 docs/tasks의 계약과 실제 지시를 전달했습니다.
- 첫 git add는 sandbox index.lock EPERM. 같은 범위 커밋/워크트리 생성을 require_escalated로 실행하여 성공 (`485d8a2`). node_modules는 기존 설치를 링크하며 새 의존성은 추가하지 않습니다.
- cohesion/coupling 스킬을 적용해 도메인 경계 안에서 책임별 분리와 작은 상태 인터페이스를 선택했습니다. 사용자 요청의 폴더 구분을 우선하며 함께 수정되는 기능 파일은 candidates에 모읍니다.

## Query 검토
설치된 queryOptions/useSuspenseQuery/suspense 소스와 공식 문서를 확인했습니다. 실제 queryOptions를 도입하되 목록의 useQuery는 취소·초기 오류 재시도 계약을 유지하기 위해 보존합니다. 공식 useSuspenseQuery API의 cancellation caveat와 enabled 불가를 확인했으며, 브라우저 저장소 query를 단순 치환하지 않습니다. 자세한 근거와 링크는 DECISIONS에 기록했습니다.

## 통합 검증
- 공통 기능 `9f97bae` 및 구조 기능 `2bd8ad9`를 no-ff 병합. 사용처 연결은 `4f36d6f`로 별도 보존했습니다. package/lock 변경 및 새 의존성 없음.
- 통합 리뷰에서 Input의 clearButton 유무 변경 시 useImperativeHandle 빈 deps로 외부 ref가 이전 input에 남을 수 있음을 확인. 기능 담당이 매 commit 갱신 및 plain→clear→plain 회귀 테스트로 수정했습니다. Header center/right의 desktop column을 분리하고 긴 center를 minmax로 제한했습니다.
- Toolbar는 useCandidateSearch의 clear를 Input에 연결하고 search icon stacking을 유지. Clear는 이름만 초기화, ResetButton은 이름/직무 둘 다 초기화합니다. 재시도·새로고침·렌더 오류에는 RetryButton, 상세 Sheet에는 CloseButton, WorkspaceHeader에는 Header 슬롯을 실제 사용했습니다.
- 새 앱 통합 테스트: 초기 저장된 이름+직무에서 Tab/Enter clear, 입력 포커스·직무 유지·검색 결과 1→2·UI 저장 반영·목록 재조회 없음. 기존 87 tests 보존, 공통 12개와 앱 1개 추가.
- `pnpm exec prettier --write` 변경 소스 정리 후 `pnpm format:check && pnpm verify`: **exit 0**, Prettier/ESLint/TypeScript strict/**10 files, 100/100 tests**/webpack production build 통과. Vitest 24.58s. `/`와 `/_not-found` 정적 생성 성공.
- `git diff --check`: 통과.
- `pnpm start --hostname 127.0.0.1 --port 3101` 최초 listen EPERM 이후 require_escalated 실행 성공.
- production 250명 렌더. 최서연 검색 시 결과 1명과 custom clear 1개 확인. Tab으로 clear 포커스→Enter 실행 후 input value 빈 문자열, focus type search, 결과 250명 확인.
- 상세 열기→CloseButton Enter로 닫기 후 `최서연 지원자 상세 보기` 포커스 확인. 메뉴 면접 이동 직후 해당 카드/새로고침 잠금, 이동 후 Undo 이력 표시 확인.
- 첫 Undo 확인 시 저장 완료를 충분히 기다리지 않고 reload하여 면접으로 복원된 것을 관찰했습니다. 이를 Undo 영속 저장 성공으로 집계하지 않았습니다. 이후 일반 이동으로 서류검토 복원, 저장 완료 후 메뉴 현재 단계와 성공 이력을 확인한 다음 reload하여 서류검토 1명과 검색어 복원을 확인했습니다. Undo 성공/실패/재시도는 자동 회귀 검사로 검증했습니다.
- 390×844: document/header width 390, input width 316. 헤더, search icon/custom clear, 검색/직무/초기화 배치 screenshot 확인. 모바일 clear로 250명 복원과 입력 포커스 확인.
- 공통 RetryButton 새로고침 시 aria-busy=true, 검색창/카드 DOM 35개 유지 확인. 완료 후 alert 없음, 결과 250명. console error/warn `[]`.
- 테스트 카드 원래 단계/검색 초기화 완료. viewport override reset, 임시 브라우저 tab 닫기, production 서버 종료.

## 인계
이번 요청 네 항목의 구현·검토·통합 검증 완료. useSuspenseQuery는 적합성 검토 후 보류한 항목이며 queryOptions와 입력 훅은 실사용합니다. 알려진 미해결 결함 없음.

별도 사용자 작업 `01a09a9f-69fa-7cd3-b743-631f80ed19b8`에서 `[기능 브랜치]` 추가사항(Tailwind canonical lint, useCandidates 반환 추상화, loading/error 및 server/client 경계)을 진행한다는 인계를 받았습니다. 패키지 변경 소유권을 그 작업에 두고 기존 두 워크트리는 건드리지 않도록 조율했습니다. 이번 검증은 main `4f36d6f` 코드 기준이며 이후 추가 작업의 통합/검증은 해당 작업이 담당합니다.
