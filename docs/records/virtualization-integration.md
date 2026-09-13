# 가상화 통합 기록

## 실제 요청
> 문서 보고 선택 작업도 이어서 진행(가상화 등)

## 범위와 분담
- 시작 HEAD `03e73bc`, main 깨끗함 확인. AGENTS/PLAN/STATUS/DECISIONS 및 이전 기능 인계/기록 확인.
- 문서의 1,000건 가상화를 이번 독립 기능으로 선정. 기본 250명 시드는 유지. Undo/DnD는 다음 후보.
- AGENTS의 독립 세션·워크트리 규칙에 따라 `.worktrees/virtualization`, `codex/virtualization` 생성. 기능 세션은 보드·가상 목록·회귀 테스트·기능 기록, 통합은 의존성·상위 문서·리뷰·production 검증.
- 실제 위임: task 계약을 읽고 컬럼별 가상화, Tab 전체 접근, 화면 밖 이동/롤백/상세 포커스, 검색 후 스크롤 회복을 구현·검증·커밋하도록 요청.
- `pnpm add @tanstack/react-virtual`: 3.14.12 설치. package/lockfile 통합 담당 변경. 기존 eslint/whatwg-encoding deprecated 경고 확인.
- rg 미설치로 find 사용. 첫 일반 git commit은 .git/index.lock sandbox EPERM, 같은 범위 git 명령을 require_escalated로 실행해 성공.
- 실제 browser 1,000건 검증을 위해 public에 임시 QA HTML 준비. 버튼으로 기존 localStorage를 sessionStorage에 백업한 뒤 합성 1,000건 적용, 복원 버튼 제공. 앱 기본 데이터/실패율은 변경하지 않음. 검증 종료 후 데이터 복원 확인 및 임시 파일 삭제 완료.

## 리뷰 기준
- [TanStack 공식 Virtualizer 문서](https://tanstack.com/virtual/latest/docs/api/virtualizer)의 measureElement/rangeExtractor/scrollToIndex 계약 확인. 실제 크기 측정, 화면 밖 포커스 대상의 추가 렌더링, 해당 index 스크롤을 조합합니다.
- 중간 리뷰에서 이전 키보드 요청 ID가 이후 마우스 상세 카드의 pin을 가리는 문제를 지적했고, 현재 focus ID도 함께 보존하도록 기능 담당에게 전달했습니다.
- JSDOM은 레이아웃을 계산하지 않으므로 virtualizer를 통째로 mock하지 않고 관련 요소의 geometry/scroll만 한정하여 지원하도록 요청했습니다. 실제 화면 측정은 production browser로 별도 확인합니다.

## 검증
- 기능 `2c0a912`를 main `da3da3f`로 병합. 추가 실행 코드 수정 없음.
- main `pnpm format:check && pnpm verify`: format/lint/strict typecheck/**62 tests**/webpack production build 모두 통과. 6 test files, 12.58s.
- 최초 sandbox server listen EPERM. require_escalated로 `pnpm start --hostname 127.0.0.1 --port 3101` 실행 성공.

## 실제 production 브라우저 (2026-09-13)
Codex in-app browser, 127.0.0.1:3101, 기본 viewport 1280×720.
- 기본 250명, 초기 실제 카드 DOM **30개**, 각 컬럼 viewport 432px 확인.
- 임시 QA 버튼으로 합성 1,000명(컬럼별 200명) 적용. 전체 결과 1,000명, 초기 실제 카드 DOM **30개**. DOM 수 측정이며 처리 시간 벤치마크는 아닙니다.
- 서류검토 컬럼 실제 wheel scroll 100 pages: scrollTop 36222, 196~200번째 카드 표시, 전체 DOM 29개. 첫 Control+End는 문서만 이동했고 AX 대상이 자식에 가려져 coordinate wheel로 전환했습니다.
- 깊은 스크롤에서 가상지원자0100 검색: 결과 1명/카드 1개/scrollTop 0. Enter 상세 열기, Escape 닫기 후 같은 상세 버튼 focus 복귀.
- 초기화 후 컬럼에서 Tab 및 추가 12회 Tab: 처음 가시 범위 밖의 7번째 상세 버튼 focus, scrollTop 748, DOM 32개. 전체 1,000명 순회는 자동 테스트에서 확인했습니다.
- 불합격 마지막 카드 qa-1000을 서류검토로 이동: 즉시 상세 focus, 목적지 scrollTop 36322, 해당 카드 저장 중 표시. 완료 후 서류검토 유지/버튼 복구. reload 후 검색해 저장 영속성 확인.
- reload 및 원복 후 로드에서 각각 기본 15% 확률의 최초 조회 실패가 발생해 searchbox 대기 timeout. 에러 DOM 확인 후 다시 불러오기 각 1회로 복구. 실패율은 변경하지 않았습니다.
- 390×844: document width 390, board width 350, 컬럼 높이 506, DOM 35개. 모바일 screenshot 배치 확인. viewport override 원복.
- 빈 이름 검색: 결과 0명과 빈 안내 일치. browser error/warn logs `[]`.
- QA 버튼으로 기존 localStorage 복원, 전체 250명 복구 확인. 임시 tab 닫기, production 서버 Ctrl-C 종료, public QA 파일 삭제 완료.

## 결론 / 남은 사항
가상화 구현·리뷰·자동/production 검증 완료. 알려진 미해결 결함 없음. 기본 시드는 250명이며 1,000건은 합성 QA 데이터로 확인했습니다. Undo/DnD는 다음 독립 기능 후보입니다.
