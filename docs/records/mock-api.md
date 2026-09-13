# mock-api 실행 기록

## 실제 받은 작업 지시
> Implement ONE feature mock-api in worktree [기능 작업 공간] branch [기능 브랜치], start 12ed483. Read AGENTS.md PLAN.md STATUS.md docs/SESSION_GUIDE.md docs/tasks/mock-api.md. Own only files in task. Implement robust browser mock API + deterministic 250 seed + tests. Shared node_modules already linked. Run pnpm test targeted/typecheck/lint; write actual received prompt and evidence in docs/records/mock-api.md, update task handoff, commit feat(mock-api). Do not change shared/package/app files. Do not spawn subagents. Final report path/branch/SHA/tests/open issues. Root integrates independently.

추가 검토 지시:
> Please change validation to allow any valid array length including [] (seed is 250 but valid stored empty supports required whole-empty UI and avoids conflating seed size with schema). Keep uniqueness, fields and version validation. Add empty persistence read test before commit. Known jobs restriction okay but unknown user corrupted reject explicit.

## 구현 결과
- `createSeedCandidates`: 한국어 이름 250개, 고유 ID/이름, 직무 5개 × 단계 5개별 각 10명. 호출마다 새 객체를 반환합니다.
- `createMockApi` / `candidateApi`: 조회와 단계 변경, 200~800ms 지연과 15% 미만 난수 실패, 주입 가능한 storage getter/random/sleep.
- 조회는 AbortSignal을 지원하고 취소 시 타이머/리스너를 정리합니다. 주입한 sleep이 signal을 무시하더라도 대기 후 취소를 재확인합니다.
- 저장 키 `hiring-pipeline:candidates:v1`; `{ version: 1, candidates }`를 저장합니다. 버전, 필드 형식, 날짜, 알려진 직무/단계, ID 중복을 검사합니다. 손상 데이터는 오류로 보고하고 덮어쓰지 않습니다.
- 최초 조회는 시드만 반환합니다. 성공한 변경만 저장하며, 지연 뒤 최신 저장 값을 동기적으로 읽고 대상 카드만 변경하므로 다른 카드의 먼저 완료된 변경을 보존합니다.
- 같은 ID의 진행 중 변경은 busy 오류로 제외합니다. finally에서 잠금을 풀어 실패 후 재시도를 허용합니다.
- 저장소 접근/읽기/쓰기 오류는 명시적인 MockApiError로 전달합니다. 의존성/공유 타입 변경 없음.

## 검토 및 결정
- 최초 구현은 저장 배열 길이도 250으로 제한했으나 통합 검토에 따라 빈 배열을 포함한 모든 배열 길이를 허용했습니다. 시드 크기와 저장 스키마를 분리하고 전체 빈 상태를 지원합니다.
- 저장소에 접근할 수 없을 때 메모리 성공으로 위장하지 않고 실패 처리하여 영속 저장 계약을 지킵니다.
- 조회 시 저장하지 않아 초기 렌더 또는 실패 요청이 영속 상태를 변경하지 않습니다.
- UI 낙관적 반영과 카드 단위 롤백은 통합 담당자의 Query 계층 책임입니다.

## 실행 명령과 결과
- `pnpm test src/features/candidates/mock-api.test.ts`: pnpm의 공유 node_modules 사전 검사에서 자동 install을 시도하다 ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY로 중단.
- `pnpm --config.verify-deps-before-run=false test src/features/candidates/mock-api.test.ts`: 최초 **17 tests passed**.
- `pnpm --config.verify-deps-before-run=false typecheck`: 최초 **통과**, tsc --noEmit.
- `pnpm --config.verify-deps-before-run=false lint`: 최초 **통과**, eslint .
- 최종 검토 수정 후 `./node_modules/.bin/vitest run src/features/candidates/mock-api.test.ts`: **17 tests passed**, 1 file, 1.85s.
- `./node_modules/.bin/tsc --noEmit`: **통과**.
- `./node_modules/.bin/eslint src/features/candidates/mock-api.ts src/features/candidates/seed.ts src/features/candidates/mock-api.test.ts`: **통과**.
- 테스트: 시드 결정성/독립성, 성공 저장과 재로드, 실패 경계/무저장, 역순 완료/같은 카드 배제, 손상 JSON·버전·단계·중복 ID·날짜, 유효 빈 배열, 저장 접근/쓰기 실패 후 재시도, 미존재 ID/잘못된 입력, 사전/진행 중 취소, signal 무시 sleep, 지연 최솟값/최댓값.

## 남은 사항
기능 범위 미완료 없음. production build, 브라우저 검증, Query 롤백과 UI 연결은 통합 담당자가 수행합니다. 다중 탭 동기화는 승인 범위 밖입니다.
