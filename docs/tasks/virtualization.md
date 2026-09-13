# virtualization

## 요청 / 범위
사용자 원문: “문서 보고 선택 작업도 이어서 진행(가상화 등)”
이번 독립 기능은 문서에 남은 1,000건 보드 가상화입니다. 기본 250명 시드 유지. Undo/DnD는 별도 후속 후보입니다.

## 소유권 / 계약
- 기능 담당: src/features/candidates/board.tsx, 새 가상화 모듈/테스트, 필요시 candidate-detail.tsx / candidates-app.tsx 및 관련 테스트, 이 문서, docs/records/virtualization.md.
- 통합 담당: package.json/lockfile, PLAN/STATUS/DECISIONS/README/PROMPTS, main 통합 및 production 브라우저 검증.
- 컬럼별 가상화, 정확한 전체 수/검색/빈 상태, 기존 카드 이동·카드별 pending/rollback 및 상세 포커스 복원 유지.
- 키보드 Tab으로 가상 영역 밖의 모든 카드에 도달 가능해야 함. 화면 밖 이동/롤백 카드의 포커스 복원. 스크롤 후 검색 결과 축소도 빈 화면 없이 회복.
- 필요 라이브러리는 통합 담당에게 요청. 불필요한 자체 가상화 복잡도를 피하고 합리적 방식 선택.
- 1,000건에서 제한된 DOM, 스크롤 뒤 마지막 카드, 검색, 키보드, 이동 및 롤백 의미 있는 검증.
- 관련 Next guide 먼저 읽기. pnpm lint/typecheck/test 및 형식 검증, task/record 갱신 후 커밋.

## 완료 인계 (2026-09-13)
- `VirtualCandidateList`: TanStack Virtual 측정 기반 컬럼 가상화, overscan 2, 전체 개수/position semantics, 검색 조건 변경 시 스크롤 초기화.
- Tab은 논리적 카드/컨트롤 순서로 다음 카드를 mount하여 초점 이동. Shift+Tab과 외부 역진입용 마지막 카드, 현재 초점 및 요청 카드만 추가 mount.
- 이동/롤백은 해당 컬럼 handle로 offscreen 카드를 mount 후 focus/scroll. 처리한 요청의 재사용은 unrelated focus를 훔치지 않음.
- 상세 및 portalled 메뉴 동안 trigger pin 유지. 기본 250명 시드·Query mutation·저장 로직은 변경 없음.
- 추가 파일 소유권: 통합 승인으로 `src/test/setup.ts`의 가상화 대상 한정 JSDOM geometry 추가.
- 기능 검증: lint/typecheck/format 통과, 전체 61 tests 통과 후 portal-menu 회귀 테스트 1개 추가(최종 실행 결과는 기능 기록 참조).
- 통합 담당 후속: main 의존성 변경 포함 병합, production build 및 실제 브라우저 1,000건/반응형/포커스 확인.
- 최종 검증 갱신: portal-menu pointer-open/scroll 회귀 보강 포함 **62/62 tests**, lint/typecheck/format 모두 통과. 알려진 미해결 없음.
