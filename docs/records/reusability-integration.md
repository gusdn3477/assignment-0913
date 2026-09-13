# 재사용성과 폴더 구조 통합 기록

## 실제 사용자 요청
사용자: “선택사항 추가” 후 다음 네 항목을 요청했습니다.
1. 공통 컴포넌트 구체화: Input clearButton, 의미별 Button 래퍼, left/center/right Header, 필요 시 컴포넌트별 Skeleton.
2. 한 폴더에 몰린 코드를 컴포넌트별로 묶고 상수·유틸·타입·훅·API·query key를 별도 폴더/파일로 분리.
3. 가능하면 useSuspenseQuery와 queryOptions 활용.
4. 입력 onChange 등을 포함한 간단한 훅 추상화. 억지로 진행할 필요는 없음.

## 범위와 배정
- 시작 main `81e7a91`, 작업 트리 clean. 공통 규칙, PLAN/STATUS/DECISIONS와 세션 가이드 확인.
- `reusable-ui`: `.worktrees/reusable-ui`, `codex/reusable-ui`; 공통 components와 관련 tests 소유.
- `candidate-structure`: `.worktrees/candidate-structure`, `codex/candidate-structure`; 지원자 기능과 page import, 관련 tests 소유.
- 통합 담당: 상위 기록·공통 API 계약·사용처 연결·review·main build/browser. 두 기능 담당에게 docs/tasks의 계약과 실제 지시를 전달했습니다.
- 첫 git add는 sandbox index.lock EPERM. 같은 범위 커밋/워크트리 생성을 require_escalated로 실행하여 성공 (`485d8a2`). node_modules는 기존 설치를 링크하며 새 의존성은 추가하지 않습니다.
- cohesion/coupling 스킬을 적용해 도메인 경계 안에서 책임별 분리와 작은 상태 인터페이스를 선택했습니다. 사용자 요청의 폴더 구분을 우선하며 함께 수정되는 기능 파일은 candidates에 모읍니다.

## Query 검토
설치된 queryOptions/useSuspenseQuery/suspense 소스와 공식 문서를 확인했습니다. 실제 queryOptions를 도입하되 목록의 useQuery는 취소·초기 오류 재시도 계약을 유지하기 위해 보존합니다. 공식 useSuspenseQuery API의 cancellation caveat와 enabled 불가를 확인했으며, 브라우저 저장소 query를 단순 치환하지 않습니다. 자세한 근거와 링크는 DECISIONS에 기록했습니다.

## 통합 검증
진행 중. 완료 후 실제 명령과 결과, 브라우저 관찰 및 최종 SHA를 추가합니다.
