# undo

## 요청 / 범위
사용자: “후속 작업 이어서 작업하자.” → “Undo: 저장된 단계 이동 되돌리기 (추천)” 선택.
카드별 마지막 성공한 단계 이동 한 번 되돌리기. 새로고침 후 이력은 유지하지 않음. DnD 제외.

## 소유권 / 계약
- 기능 담당: src/features/candidates의 구현 및 관련 테스트, 이 문서, docs/records/undo.md.
- 통합 담당: PLAN/STATUS/DECISIONS/README/PROMPTS, main 병합, production build와 브라우저 검증.
- 성공한 일반 이동만 카드별 이전 단계 기록. 후속 성공 이동은 해당 카드 이력을 교체. 실패한 이동은 기존 이력을 보존.
- Undo는 기존 mutation 경로로 저장하며 같은 카드 잠금/다른 카드 병렬/성공 후 영속 저장/카드별 롤백을 유지. 성공 Undo 후 이력 소비, 실패 Undo는 재시도 가능.
- 메뉴에서 접근 가능한 명확한 한국어 되돌리기 제공. 가상화·키보드·포커스 유지. 후보 캐시와 현재 단계가 맞지 않는 오래된 이력 사용 방지.
- 관련 Next guide를 읽고 구현. 새 의존성은 통합과 협의.
- 결정적 테스트: 성공/실패 Undo, 후속 이동 이력 교체, 카드 간 병렬 격리, 같은 카드 중복 차단, 접근 가능한 UI.
- lint/typecheck/test/format 검사 및 기록·인계 후 feat(undo) 커밋.

## 기능 인계 (2026-09-13)
- 상태: 구현 및 기능 검증 완료. 통합 담당 코드 리뷰에서 blocking finding 없음.
- 워크트리: `/Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/undo`
- 브랜치: `codex/undo`
- 변경: QueryClient 단위 마지막 성공 이동 이력, 기존 mutation을 통한 Undo와 실패 시 이력 보존/카드 롤백, stale action guard, 한국어 메뉴/키보드/가상화 포커스.
- 검증: 전체 73/73 tests, lint, strict typecheck, format:check 통과. symlink 의존성에서는 `pnpm --config.verify-deps-before-run=false <command>` 사용.
- 기록: `docs/records/undo.md`. 의존성 변경 및 알려진 구현 미해결 이슈 없음.
- 통합 남은 작업: main 병합, production build/브라우저 검증, top-level 문서/인계 업데이트.
