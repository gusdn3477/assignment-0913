# reusable-ui

## 요청 / 소유권
선택사항 1: clearButton 포함 Input, 의미별 버튼 래퍼, left/center/right Header.
새 `.worktrees/reusable-ui`, `codex/reusable-ui`에서 `src/components/**`, 필요한 `src/hooks/**`, 이 task와 `docs/records/reusable-ui.md`만 소유합니다. candidates/app와 package 및 상위 문서는 다른 담당 소유입니다.

## 계약 / 완료 기준
- Input은 기존 native props/ref/className 의미를 유지. 선택적인 clearButton은 controlled input에 명시적 onClear 경로를 사용하고 disabled/readOnly/빈 값에서 숨기거나 비활성화. 접근 가능한 이름, type=button, 지운 뒤 input focus, 입력 onChange와 clear의 이중 실행 방지. 기존 plain Input 호환성 유지. 사용할 API를 조기에 통합에 전달.
- 실제 사용될 ResetButton, RetryButton, CloseButton 등 의미별 버튼 래퍼. CancelButton은 취소 액션이 실제 존재하는 경우만. native props/ref 전달, 기본 type=button, pending/disabled 일관성. 아이콘/문구만 필요한 수준에서 재사용.
- Header는 left/center/right ReactNode 및 native header props/ref, 중앙 슬롯과 긴 콘텐츠/모바일 배치 고려. 컴포넌트별 폴더 사용. 기본 ui primitives는 기존 import 경로를 불필요하게 깨지 않아도 됨.
- clear controlled/native props/ref, keyboard focus, disabled/readOnly 및 form submit 방지 등 의미 있는 tests. lint/typecheck/test/format. 새 의존성 없음.
- 관련 Next 설치 문서와 공통 규칙을 읽고 실제 프롬프트/검증/결정을 records와 task에 남겨 커밋. 통합 담당이 앱에 연결하고 production 확인.
