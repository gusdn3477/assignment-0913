# board-focus-fix

보드 기능의 이동·롤백 포커스 테스트 timeout을 수정합니다. 기능 구현 기록은 docs/records/board-ui.md에 있습니다.

소유: board.tsx, board.test.tsx, 이 task, docs/records/board-focus-fix.md.
완료: 기존 8개 보드 테스트 통과, 실제 단계 이동 후 카드 포커스/실패 rollback 포커스 보존, 다른 입력 포커스 빼앗지 않음. Radix menu unmount/close lifecycle와 layout effect 타이밍을 검토하세요. 테스트 삭제/skip/timeout 증가로 숨기지 않습니다.
독립 세션·전용 워크트리에서 수정하고 실제 원인과 검증을 기록 후 fix(board-focus) 커밋합니다.
