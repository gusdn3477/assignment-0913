# reusable-ui 구현 기록

## 실제 요청과 배정
사용자: “선택사항 추가 … 재사용성을 고려해 공통 컴포넌트 더 만들거나 구체화 … Input의 경우 clearButton까지 포함한 것으로 만들기 … Button도 종류가 여러개면 그걸 래핑한 CanCelButton 등으로 만들기 … 헤더도 left, center, right 등의 props를 뚫어두는 방식으로 뼈대 등 갖추기”.

통합 배정: `[기능 브랜치]`, `[기능 작업 공간]`에서 `src/components/**`, 필요한 `src/hooks/**`, 이 기능 task/record만 수정. Input controlled onClear/native props/ref/focus, 실제 사용할 ResetButton/RetryButton/CloseButton, Header slots 구현. 새 의존성 없이 의미 있는 상호작용 검증 후 커밋. candidates/app 소비 연결과 build/browser는 통합 담당.

## 읽은 근거
AGENTS.md, PLAN.md, STATUS.md, DECISIONS.md, docs/tasks/reusable-ui.md 및 설치된 `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`. 처음 `.mdx` 경로는 존재하지 않아 파일 검색 후 `.md`를 읽음.

## 구현 출력과 결정
- 기존 `@/components/ui/input` 경로와 native props/className/ref 유지. 일반 Input에는 wrapper를 추가하지 않음. clearButton이 있을 때만 상대 위치 wrapper 및 clear 액션 표시.
- `clearButton={{ onClear, label? }}`는 타입에서 controlled value를 요구. 지우기는 부모의 명시적 업데이트 한 번만 호출하고 합성 onChange는 만들지 않음. 이후 입력 포커스 복구. 빈 값/disabled/readOnly면 버튼 숨김; native number 0도 지울 수 있음. 기본 label `입력 지우기`, type=button. native search cancel UI 억제는 custom clear 사용 때만 적용.
- `wrapperClassName`는 wrapper, 기존 `className`는 input에 전달. clear 자리의 오른쪽 padding 확보.
- 버튼 폴더에서 공통 ActionButton이 native props/ref/type와 pending disabled/aria-busy 및 spinner를 처리. ResetButton/RetryButton/CloseButton은 의미별 아이콘/기본 문구/스타일만 제공하며 children/variant/size를 재정의 가능. 실제 취소 액션이 없으므로 사용되지 않는 CancelButton은 만들지 않음. 통합 담당이 기존 초기화/재시도/닫기를 연결.
- Header는 native header props/ref와 left/center/right, contentClassName을 제공. center가 없으면 좌우 두 열. center가 있으면 모바일 두 번째 행, 데스크톱 가운데 열/동일 너비 양쪽 열. min-width와 줄바꿈을 고려. 초기 검토 중 right의 desktop 열과 center의 minmax를 수정.
- 의미 없는 일반 useState 래퍼는 추가하지 않음. 지원자 입력 훅과 skeleton 분화는 별도 candidate-structure 소유.

## 리뷰 및 검증
2026-09-13 기능 워크트리에서 실행. 링크된 node_modules로 인한 pnpm 자동 설치를 피하기 위해 모든 pnpm 호출에 `--config.verify-deps-before-run=false` 사용.
- `pnpm … exec prettier --write src/components`: 완료.
- `pnpm … test src/components`: **3 files, 12/12 tests 통과**.
- 입력 테스트: native maxlength/onChange/name/ref/plain DOM 호환, controlled 검색 입력 typing, Tab+Enter clear, focus 복귀, clear 호출 한 번, submit/onChange 중복 없음, disabled/readOnly/empty 숨김, number zero.
- 버튼 테스트: 세 wrapper native ref/title/keyboard와 기본 non-submit, retry pending 중 focus/label 유지·중복 클릭 차단·별도 disabled 유지.
- `pnpm … lint`: 통과.
- `pnpm … typecheck`: 통과.
- `pnpm … format:check`: 통과.
- 통합 담당에게 API 계약과 검증 결과 전달. 기능 브랜치에서 production build/browser는 실행하지 않았으며 통합에서 소비 연결 후 수행.

## 남은 사항
기능 구현의 알려진 미해결 결함 없음. 통합에서 실제 소비 연결, 전체 회귀 검사, production build 및 반응형/clear 실제 브라우저 검증 필요.

통합 리뷰 반영: clearButton 토글로 input DOM이 교체될 때 외부 ref가 오래된 노드를 가리키는 문제를 useImperativeHandle 매 commit 갱신으로 수정. plain → clear → plain 회귀 테스트 추가. Header optional center/native ref/slots 의미 검증 추가. 변경 후 12 tests/lint/typecheck 재검증. git add/commit 첫 실행은 sandbox index.lock 권한으로 실패하여 권한 요청으로 재시도.

Header 신규 테스트의 plain 홈 링크가 Next lint에 걸려 Next Link로 교체하고 재검증.
