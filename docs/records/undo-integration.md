# Undo 통합 기록

## 실제 요청 / 범위
사용자 원문: “후속 작업 이어서 작업하자.”
상태 문서에서 필수 기능과 가상화 완료, Undo/DnD 후보를 확인한 뒤 선택 질문을 제시했습니다. 사용자 답변: “Undo: 저장된 단계 이동 되돌리기 (추천)”.

- 시작 main `a8be3cc`, git 작업 트리 깨끗함.
- AGENTS/PLAN/STATUS/DECISIONS, 이전 optimistic-update/virtualization task와 통합 기록 확인.
- AGENTS의 독립 기능 세션 규칙에 따라 `[기능 작업 공간]`, `[기능 브랜치]` 생성. 기능 담당은 후보 모듈·테스트·기능 기록, 통합은 상위 문서·리뷰·build·browser를 소유.
- 실제 위임: `docs/tasks/undo.md`의 카드별 마지막 성공 이동 Undo 계약 구현, 기존 잠금/롤백/성공 저장/가상화 접근성 유지, 테스트·lint·typecheck·format 및 커밋 인계.
- 통합 리뷰 지시: Undo 이력 참조를 안정적으로 유지하여 deferred board memo를 보존하고 실행 시점에도 현재 단계를 검증. 정상 이동 실패의 기존 이력 보존, 여러 hook 간 잠금 공유 확인.
- rg 미설치로 find 사용. 추가 의존성 없음.

## 검토
- QueryClient별 메모리 이력과 카드별 pending store를 공유합니다. 성공 일반 이동만 이전/저장 단계를 기록하고 성공 Undo만 해당 이력을 제거합니다.
- 메뉴에서 목적 단계가 명확하며 실행 불가한 Undo는 메뉴 닫기 후 기존 트리거 포커스 동작을 유지합니다. 실제 이동은 가상화 목록의 기존 포커스 요청 경로를 사용합니다.

## 검증 / 인계
- 기능 `a3c8274`를 main `57cbfa0`으로 no-ff 병합. 초기 git merge는 ORIG_HEAD.lock sandbox EPERM으로 실패, 같은 병합을 require_escalated로 실행해 성공.
- main `pnpm format:check && pnpm verify`: 포맷/lint/strict typecheck/**6 files, 73/73 tests**/webpack production build 모두 통과. 테스트 17.11s. 추가 코드 수정 없음.
- 최초 `pnpm start --hostname 127.0.0.1 --port 3101`은 listen EPERM, require_escalated 실행 성공.
- 브라우저 기본 250명, 최서연(서류검토) 검색. 면접 이동 직후 저장 중 버튼/새로고침 비활성화와 카드 상세 포커스 확인.
- 성공 후 메뉴에 `서류검토로 되돌리기` 표시. Enter로 메뉴 열기, End로 Undo 포커스, Enter 실행. 저장 완료 후 상세 포커스 복귀, Undo 메뉴 소모 확인.
- 페이지 reload 후 최서연이 서류검토 목록에 유지되어 되돌린 단계의 영속 저장 확인. 이력의 새 QueryClient 초기화는 hook 테스트로 확인.
- 390×844 모바일 메뉴 screenshot으로 폭/배치 확인. 새 일반 이동이 실제 기본 실패 확률로 한 번 실패하여 한국어 오류 알림과 서류검토 롤백 관찰. 재시도 성공 후 Undo 메뉴가 화면 안에 표시됨을 확인하고 Undo로 원래 단계 복구.
- 검색 초기화로 전체 250명 복구, console error/warn `[]`. viewport override 초기화, 임시 탭 닫기, 검증 서버 Ctrl-C 종료.
- Undo 실패/재시도는 결정적인 자동 테스트로 확인했으며 production에서는 일반 이동 실패를 관찰했습니다. 실패 확률/지연과 기본 시드를 변경하지 않았습니다.
- 알려진 미해결 결함 없음. DnD는 다음 후보이며 이번에는 구현하지 않았습니다.
