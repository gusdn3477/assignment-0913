# candidate-layout 작업 기록

## 실제 요청과 배정
사용자: “api 폴더는 components와 같은 레벨로 빼자”, “컴포넌트 폴더를 더 세분화. candidate 라는 폴더를 만들고 그 하위에 board, card, detail도 가능해보임”.

통합 배정: 독립 [기능 브랜치] / [기능 작업 공간], 기준 HEAD 822855e. docs/tasks/candidate-layout.md 경로 매핑에 따라 src 파일/참조와 기능 인계 기록만 소유하며, 동작·타입·파일명 보존 및 호환 re-export 금지. 커밋 설명은 한글.

## 확인과 결과
- AGENTS.md, PLAN.md, STATUS.md, DECISIONS.md와 배정 task를 읽었습니다.
- 설치된 Next 문서의 01-app/01-getting-started/02-project-structure.md, 01-app/02-guides/server-and-client-boundary.md에서 src 구성 자유와 import 기준 client 경계를 확인했습니다. route 위치 및 use client 지시문은 변경하지 않았습니다.
- src/features/candidates/api 4개 파일을 src/api/candidate로 이동했습니다.
- 지원자 컴포넌트/인접 테스트 22개 파일을 src/components/candidate의 app, board, card, detail, toolbar, metric, error-boundary, load-feedback, workspace-header로 옮겼습니다. 가상 목록은 board/virtual-list 아래입니다.
- 기존 @ alias를 사용해 페이지·route loading·Query options·mutation·검증 유틸·테스트의 import와 vi.mock 및 importOriginal 타입 참조를 모두 갱신했습니다.
- hooks/stores/constants/types/queries/utils는 기존 도메인 위치에 유지했습니다. 소스 동작·테스트 범위 변경이나 새로운 의존성은 없습니다.

## 리뷰와 검증 명령/결과
- node_modules/.bin/prettier --check src '*.ts' '*.mjs' '*.json': 최초 app/candidates-app.test.tsx의 짧아진 import 줄 경고. 해당 파일만 prettier --write 후 재검사 통과했습니다.
- node_modules/.bin/eslint .: 통과.
- node_modules/.bin/tsc --noEmit: 통과.
- node_modules/.bin/vitest run --maxWorkers=1: 13 files / 109 tests 전체 통과, 46.19s. Query cancellation/카드별 mutation·rollback·Undo, 실제 DnD 센서, 1,000명 가상화 키보드 탐색과 조회/상세/공통 UI 회귀 검증 포함.
- 별도 Python 경로 대조: git ls-tree의 72개 src 파일 각각에서 기존 import 경로를 기대 경로로 치환한 내용과 실제 파일을 비교했습니다. 공백 정리를 제외하고 모두 동일하며 이동 파일 26개, 소스 추가/삭제 0개, 옛 features/candidates/api 또는 components 참조 0건입니다.
- 워크트리 node_modules가 통합 설치 디렉터리의 symlink이므로 재설치 없이 direct .bin 명령을 사용했습니다.

## 인계와 남은 사항
production build/browser와 README/최상위 기록 정리는 통합 담당 소유입니다. 알려진 기능 결함이나 미해결 소스 작업은 없습니다.
