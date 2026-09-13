# DnD 통합 기록

## 요청과 배정
- 사용자 원문: “선택사항 이어서 진행하자”. STATUS에서 가상화·Undo 완료 및 다음 독립 후보 DnD 확인, 남은 선택사항을 DnD로 해석해 진행.
- 시작 main `ba34e22`, 작업 트리 깨끗함. AGENTS/PLAN/STATUS/DECISIONS와 Undo task/통합 기록 확인.
- 범위 커밋 `8203cf3`, 새 `.worktrees/dnd` / `codex/dnd` 생성. AGENTS의 독립 기능 세션 규칙에 따라 기능 에이전트 배정.
- 실제 위임: `docs/tasks/dnd.md` 읽기, 후보 기능/테스트·task·기록만 소유, native drag handle/기존 메뉴와 mutation 재사용, 외부·같은 단계·저장 중·취소·stale drag 방어, 가상화/포커스/Undo 유지, lint/typecheck/test/format과 커밋 인계.
- git 최초 쓰기 sandbox EPERM은 require_escalated로 재실행 성공. rg 미설치로 find 사용. 추가 의존성 없음.

## 통합 검토와 검증
- 저장·이력 코드는 수정하지 않고 기존 onMove를 재사용함을 확인. 보드 내부 세션 토큰을 소비한 드롭만 이동하고 source 단계/filter/pending 변경 시 취소. 가상 목록은 드래그 원본을 별도로 보존.
- 첫 브라우저 1280px에서 footer에 추가한 손잡이가 단계 badge/메뉴 문구를 두 줄로 만드는 문제 발견. 기능 담당에 수정 요청, 손잡이를 카드 우측 상단으로 옮긴 뒤 screenshot에서 해결 확인.
- 실제 마우스로 최서연 서류검토→면접 드래그 성공, 저장 중 메뉴/새로고침 비활성화와 해당 상세 버튼 포커스 확인. 상세 열기/Escape 복귀 확인. 개발 서버 HMR과 Undo 실행이 겹쳐 Undo 검증은 production에서 다시 수행하기로 함.
- 수정한 상단 손잡이로 면접→서류검토 드래그 성공. reload 후 서류검토 유지 확인, 검색 초기화로 250명 복구. 3102 개발 서버 종료.
- 개발 서버 최초 listen EPERM 후 require_escalated로 실행. webpack 개발 모드 사용, 초기 컴파일 동안 탭 navigation timeout은 기존 생성 탭을 재연결하여 복구.
- 새 앱 테스트 리뷰에서 기존 Undo 문구 “면접로” 발견, “면접 단계로”처럼 단계 이름 뒤 동일 문구를 사용하도록 수정 요청.
- 기능 `ca7687a`를 main `d4ea5f8`로 no-ff 통합. `pnpm format:check && pnpm verify`: format/lint/strict typecheck/7 files **87/87 tests**/production webpack build 통과. tests 16.93s.
- production 3101에서 실제 native drag 두 번 저장 실패 후 카드별 롤백, 세 번째 드래그 성공 확인. 저장 중 새로고침/카드 메뉴 잠금과 상세 버튼 포커스 유지 확인.
- 성공 이동 뒤 Tab/Enter → End/Enter로 `서류검토 단계로 되돌리기` 실행. Undo 저장 성공과 상세 버튼 포커스, reload 후 서류검토 유지 확인.
- 390×844 화면 메뉴 screenshot에서 메뉴/카드 footer가 화면 안에 정상 배치. 검색 초기화로 250명 복구, production console error/warn `[]`.
- viewport override 초기화, production 탭 닫기 및 서버 종료. 개발 탭은 종료한 서버의 연결 오류(data URL) 화면이 되어 browser URL 정책이 재탐색/닫기를 차단함. 우회하지 않고 임시 탭의 턴 종료 자동 정리에 맡김. production은 새 탭에서 정상 검증 완료.
- 새 의존성과 알려진 기능 미해결 결함 없음. 터치/키보드는 단계 메뉴를 사용하며 native 마우스 DnD만 제공. 컬럼 내 순서 변경은 제외.
