# explorer 작업 기록

## 실제 받은 지시
> Implement ONE feature explorer (search/filter/detail UI state) in worktree [기능 작업 공간] branch [기능 브랜치] start 12ed483. Read AGENTS.md PLAN.md STATUS.md docs/SESSION_GUIDE.md docs/tasks/explorer.md. Own only task files. Build Zustand provider persist safely at mount validating stored UI data + filter helper + polished toolbar + shadcn detail Sheet. Card detail buttons expose data-candidate-detail=id for focus return. Shared UI and node_modules ready. Test persist/bad storage/filter/detail; run checks, log actual received prompt and evidence docs/records/explorer.md, update task handoff, commit feat(explorer). No shared/app/package edits, no agents. Final path/branch/SHA/tests/issues.

후속 지시:
> Use direct ./node_modules/.bin/vitest /tsc /eslint for checks; pnpm in worktree may try reinstall linked node_modules. Root foundation build passed. Root app uses all contracts exactly as task.

## 구현 및 검토
- provider마다 독립 Zustand store; SSR 초기값 이후 mount에서 persist.rehydrate 실행.
- hiring-pipeline-ui 키에 search/job만 저장. 저장된 selectedId/hydrated/action 무시. search 타입/길이, job 목록 검사. JSON 손상 및 localStorage 접근/할당 오류에서도 메모리 상태 이용 가능.
- 이름 trim/대소문자 무시 부분 검색과 직무 AND 필터.
- shadcn Input/Select/Button 도구, 접근 가능한 label, 결과 수 live region, 초기화.
- shadcn Sheet 이름/직무/지원일/단계/이메일/소개. 한국어 닫기, Escape, 포커스 잠금 및 data-candidate-detail 버튼 포커스 복귀.
- 지원자 객체를 UI store에 포함하지 않아 낙관적 Query 데이터 저장 방지.
- 저장된 임의 action/선택을 펼치지 않고 허용 필드만 병합. localStorage 불능이 기능 사용을 막지 않음.
- 고정 공유 JOBS로 저장 직무 검증. 향후 동적 직무 도입 시 정책 조정 필요.
- 속성 selector에 ID를 삽입하지 않아 escaping 의존성 없음.

## 검증 명령 / 결과
- `pnpm test`: 연결된 node_modules 재설치 시도, ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY. 의존성 변경 없이 직접 바이너리 사용.
- `./node_modules/.bin/vitest run`: 1 파일 / 9 테스트 통과 (AND 필터, 복원, 선택 비영속, 손상 JSON/타입/null, 리마운트/초기화, 키보드 직무 선택, 저장소 예외, 상세 포커스).
- `./node_modules/.bin/tsc --noEmit`: exit 0.
- `./node_modules/.bin/eslint src/features/candidates`: exit 0.
- git add 최초 실행은 worktree git index sandbox 제한으로 실패, 승인된 escalation 경로로 재시도.
- 브라우저 및 production build는 통합 담당.

## 인계
기능 미완료 없음. 앱에서 Provider 아래 Toolbar/Detail 연결, 보드 상세 버튼 data-candidate-detail=id 계약 유지 필요.
워크트리 [기능 작업 공간], 브랜치 [기능 브랜치].
