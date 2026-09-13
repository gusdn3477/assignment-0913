# DnD 기능 기록

## 실제 요청 / 배정

사용자: “선택사항 이어서 진행하자”.

통합 담당의 배정: “Implement assigned DnD feature in /Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/dnd branch codex/dnd. Read AGENTS.md PLAN STATUS DECISIONS docs/tasks/dnd.md and relevant installed Next docs first. Own src/features/candidates implementation/tests + docs/tasks/dnd.md docs/records/dnd.md only. Integration (me) handles top docs and main browser/build. No new dependencies unless coordinated. Use native drag handle desktop DnD and existing accessible menu for keyboard/touch; guard external/same-stage/pending/canceled/stale drag, preserve virtualization and focus, reuse onMove for rollback and Undo. Add meaningful board DnD and app integration tests. Run lint/typecheck/tests/format (symlink deps use pnpm --config.verify-deps-before-run=false). Commit feature after records/handoff. Do not edit main. Report SHA and evidence.”

## 읽은 자료 / 결정

- AGENTS.md, PLAN.md, STATUS.md, DECISIONS.md, docs/tasks/dnd.md.
- 설치된 Next.js `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`: 브라우저 이벤트/상태 코드는 기존 client boundary 안에서 구현.
- `frontend-fundamentals:readability` SKILL.md: 통합 리뷰가 지적한 중첩 삼항을 if 분기와 목적지 변수로 정리.
- `frontend-fundamentals:coupling` SKILL.md: 반환 필드가 많은 훅을 검토. 모든 필드는 하나의 보드 내부 드래그 세션에서 파생되는 상태/이벤트이고 저장·조회 책임은 포함하지 않으므로 분할 없이 유지.
- 의존성 추가 없음. 별도 native draggable 손잡이를 제공하고 키보드·터치는 기존 단계 메뉴를 사용. 손잡이는 Tab 순서와 접근성 트리에 추가하지 않으며 상세 버튼과 형제 요소로 분리.
- 내부 드래그 세션과 일회 토큰을 함께 검사. 외부 데이터, 같은 단계, 중복 drop, 저장 중 카드, Escape/dragend 취소, 필터 변경/원본 제거/원본 단계 변경 이후의 오래된 드래그를 거부.
- 드래그의 시각 상태는 React의 즉시 상태로 처리. 드롭은 기존 onMove와 Query 동기 잠금·낙관적 변경·성공 저장·카드별 롤백·Undo 경로를 재사용. 요청에 transition을 적용하지 않음.
- 가상화 range에 원본 카드 한 개를 별도로 고정. 드래그 중에도 기존 포커스 핀은 유지. 보드 양쪽 가장자리 dragover에서 가로 스크롤하여 숨은 목적지 접근.

## 산출물 / 리뷰와 수정

- `use-candidate-drag.ts`: 세션 시작/검증/취소/드롭과 목적지 상태 및 보드 가장자리 스크롤.
- `board.tsx`: 오른쪽 위 전용 손잡이, 드래그 원본 투명도, 목적지 강조와 status 안내. 메뉴와 상세 버튼의 기본 키보드 동작 보존.
- `virtual-candidate-list.tsx`: 드래그 원본만 추가로 유지.
- `candidates-app.tsx`: 드래그 및 메뉴 이동·되돌리기 안내.
- `dnd.test.tsx`: 13개 결정적 테스트. 카드 1,000명에서 소스 고정/DOM 제한, 가로 스크롤, 중복·취소·외부·stale·pending 방어.
- `candidates-app.test.tsx`: 실제 Query mutation 연결을 통한 드래그 이동, 같은 카드 잠금, 다른 카드 병렬, 실패 카드만 복구, 다른 카드 포커스 유지, 성공 후 Undo 검사.
- 통합 브라우저 1280px 검사에서 하단 손잡이가 단계 배지/메뉴 글자를 줄바꿈시키는 회귀를 발견. 손잡이를 오른쪽 위로 이동하고 상세 제목 영역의 오른쪽 공간을 확보. 통합 담당이 수정 스크린샷에서 하단 복구를 확인.
- DnD 후 Undo 테스트에서 기존 “면접로 되돌리기” 조사가 발견되어 통합 요청에 따라 모든 단계에 “단계로 되돌리기”로 통일하고 기존 Undo 테스트의 기대 문구도 갱신. 동작 변경 없음.
- 통합 담당의 개발 브라우저 확인: native 드래그 서류검토→면접과 역이동, 즉시 저장 중 피드백/상세 포커스/상세 열기와 닫기 정상. production 전체 검증은 통합 기록에 추가 예정.

## 실행한 검증 / 결과

워크트리의 node_modules는 통합이 마련한 링크를 사용하므로 모든 pnpm 명령에 `--config.verify-deps-before-run=false`를 적용.

- `pnpm ... lint`: 통과.
- `pnpm ... typecheck`: strict typecheck 통과.
- `pnpm ... test`: 7 files, **87/87 tests 통과** (기존 73 + 새 14).
- 손잡이 위치 수정 뒤 `pnpm ... exec vitest run src/features/candidates/board.test.tsx src/features/candidates/dnd.test.tsx src/features/candidates/candidates-app.test.tsx`: 34/34 통과.
- 손잡이 위치 수정 뒤 lint/typecheck 재실행 통과.
- 최종 Undo 문구와 테스트 가독성 수정 후 DnD/app 관련 26/26 tests, typecheck, format:check 재통과.
- `pnpm ... format:check`: 통과. 기록과 인계 수정 뒤에도 다시 확인.

## 인계 / 남은 사항

기능 구현 완료. 알려진 기능 결함 없음. native DnD가 지원되는 데스크톱 입력을 대상으로 하며 터치·키보드는 기존 메뉴 경로 사용. 컬럼 내 순서 변경은 범위 밖. production build와 실제 브라우저 최종 Undo·모바일·저장 검증, main 통합/최상위 문서 갱신은 통합 담당이 수행.

워크트리: `/Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/dnd`, 브랜치: `codex/dnd`.
