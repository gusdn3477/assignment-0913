# board-focus-fix

보드 기능의 이동·롤백 포커스 테스트 timeout을 수정합니다. 기능 구현 기록은 docs/records/board-ui.md에 있습니다.

소유: board.tsx, board.test.tsx, 이 task, docs/records/board-focus-fix.md.
완료: 기존 8개 보드 테스트 통과, 실제 단계 이동 후 카드 포커스/실패 rollback 포커스 보존, 다른 입력 포커스 빼앗지 않음. Radix menu unmount/close lifecycle와 layout effect 타이밍을 검토하세요. 테스트 삭제/skip/timeout 증가로 숨기지 않습니다.
독립 세션·전용 워크트리에서 수정하고 실제 원인과 검증을 기록 후 fix(board-focus) 커밋합니다.

## 인계

- 완료: board.tsx 변경 없이 focus 테스트에서 Radix의 deferred close timer를 act/fake timers로 실행 후 이동·rollback 포커스를 검증. afterEach real timers 복원. 기존 8개 테스트 유지.
- 검사: 보드 8/8 통과, lint/typecheck 통과. 저장소 전체 44/45 통과; focus는 통과했지만 별도 기존 250명 렌더 테스트가 이 실행에서 timeout. 통합 재검증 필요, 시간 제한 변경 없음.
- 실제 브라우저 이동·rollback 포커스는 통합 담당자 확인 통과.
- 상세 기록: docs/records/board-focus-fix.md. 환경의 실제 타이머 지연 원인은 미확정이며 제품 결함으로 주장하지 않음.
