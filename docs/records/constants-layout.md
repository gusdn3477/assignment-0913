# constants-layout 작업 기록

## 실제 요청 및 배정

- 사용자: "constants도 component와 같은 레벨로 빼자. 차라리 constants 하위에서 도메인별로 파일 만드는 방식으로 진행."
- 통합 배정: 지원자 constants 네 파일을 `src/constants/candidate.ts` 한 파일로 통합하고 모든 src import를 갱신합니다. export 이름/값/타입은 유지하고 중복 import를 합칩니다.
- 추가 배정: 단일 `CANDIDATES_QUERY_KEY`만 정의하는 `queries/candidate-keys.ts`도 같은 도메인 상수 파일로 옮깁니다. Query options 함수와 시드 비공개 이름 목록은 기존 위치를 유지합니다.

## 사전 확인

PLAN, STATUS, DECISIONS, 작업 계약과 설치된 Next `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`를 읽었습니다. 상수 파일에는 브라우저 API나 client directive가 없으며 서버/클라이언트 양쪽에서 참조 가능한 데이터 정의로 유지합니다.

## 결과 및 리뷰

- `src/constants/candidate.ts` 하나에 단계/직무/단계 스타일/저장 키/검색 길이/에러 코드와 메시지/Query key를 배치했습니다.
- 소스와 테스트 23개 파일의 import를 `@/constants/candidate`로 갱신하고 같은 모듈의 중복 import를 합쳤습니다.
- 원래 5개 파일과 비어 있는 feature constants 폴더를 제거했습니다. 호환 re-export는 만들지 않았습니다.
- diff를 검토해 실행 본문 변경이 없고 export 이름/리터럴 값/타입 정의가 동일함을 확인했습니다. Stage 타입 참조는 `import type`이므로 런타임 순환 의존성을 만들지 않습니다.
- 통합 담당의 독립 TypeScript AST printer 비교에서도 기존 5파일과 새 파일의 공개 선언 12개가 import를 제외하고 모두 동일했습니다.
- 기존 경로 `features/candidates/constants`와 `candidate-keys`의 src 검색 결과는 0건입니다.

## 검증

- `./node_modules/.bin/eslint .`: 통과.
- `./node_modules/.bin/tsc --noEmit`: 통과.
- `./node_modules/.bin/prettier --check src/constants/candidate.ts $(git diff --name-only --diff-filter=M -- src) docs/tasks/constants-layout.md`: 통과.
- `./node_modules/.bin/vitest run`: 13파일 114개 중 113개 통과, 가상화의 1,000카드 Tab 전체 탐색 1개가 30초 제한을 초과했습니다(해당 실행 33.8초, 전체 94.21초). 기능 assertion 실패는 없었습니다. 테스트 코드나 제한은 바꾸지 않고 해당 파일만 단독 재실행했습니다.

- `./node_modules/.bin/vitest run src/components/candidate/board/virtual-list/virtualization.test.tsx`: 7개 전부 통과(전체 33.86초, 기존 실패 테스트 29.09초). 전체 실행의 실패 이력을 보존하며 통과한 나머지 파일을 반복하지 않았습니다.
- `git diff --check`: 통과.

## 인계

- 워크트리: `/Users/phw4483/Documents/ChatGPT/assignment_0913/.worktrees/constants-layout`
- 브랜치: `codex/constants-layout`
- 통합 담당이 상위 문서, production build 및 브라우저 확인을 수행합니다.

미해결 기능 이슈 없음. 대량 키보드 탐색 테스트는 실행 시간이 30초 제한에 가까워 실행 환경 부하에 따라 제한 초과가 발생할 수 있습니다.
