# candidate-layout

## 실제 요청
- api 폴더는 components와 같은 레벨로 빼자.
- 컴포넌트 폴더 세분화: candidate 하위 board, card, detail 등.

## 계약/소유권
- 독립 [기능 브랜치] / [기능 작업 공간].
- src/features/candidates/api → src/api/candidate.
- src/features/candidates/components → src/components/candidate. 폴더 매핑 candidate-board→board, candidate-card→card, candidate-detail→detail, candidate-toolbar→toolbar, candidate-metric→metric, candidate-error-boundary→error-boundary, candidate-load-feedback→load-feedback, candidates-app→app, workspace-header→workspace-header, virtual-candidate-list→board/virtual-list.
- 파일명/컴포넌트 API/동작 유지. 테스트는 관련 파일과 함께 이동, 모든 소스 import/mock 경로 갱신. 미사용 호환 re-export 추가 금지.
- hooks/stores/constants/types/queries/utils는 이번 범위 밖: 기존 features/candidates 유지.
- src 및 task/record 소유. README/PLAN/STATUS/DECISIONS/PROMPTS는 통합 담당.
- 기존 전체 tests, lint/typecheck/format 검증. Next 설치 문서 확인. 커밋 접두사 영어, 요약 한글.
- 통합 담당은 경로 누락/동작 변경 검토, production build/browser와 문서 정리.

## 완료 인계
- API 4개 및 지원자 컴포넌트/연관 테스트 22개를 지정 경로로 이동했습니다. 가상 목록 구현/테스트는 board/virtual-list에 함께 배치했습니다.
- 페이지·로딩·Query·mutation·검증 유틸과 모든 테스트의 import/mock 참조를 갱신했습니다. 호환 re-export 및 동작 변경은 없습니다.
- eslint, strict typecheck, Prettier check, 전체 13 files / 109 tests 통과했습니다.
- 72개 src 파일을 기준 HEAD 822855e와 기대 경로 치환 후 비교해 코드 보존(공백 정리 제외), 이동 26개 및 옛 참조 0건을 확인했습니다.
- production build/browser 및 README/최상위 기록 갱신은 통합 담당에게 인계합니다. 알려진 미해결 사항 없습니다.
- 상세: docs/records/candidate-layout.md.
