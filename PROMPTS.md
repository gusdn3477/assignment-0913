# 프롬프트와 검증 기록

기능별 실제 지시, 출력 요지, 검증 결과와 판단을 기록합니다. 사용자 검증과 에이전트 검증을 구분하며 수행하지 않은 검증은 기록하지 않습니다.

## setup — 공통 기반

### 사용자 지시
“PLEASE IMPLEMENT THIS PLAN: 채용 보드 — TypeScript 기반 병렬 개발 계획.” 핵심 제약: TypeScript strict, Next App Router, Tailwind/cn, shadcn, TanStack Query, Zustand, 기능당 독립 세션과 워크트리, 기능별 커밋, 6시간 내 필수 구현 및 검증.

### 출력 요지
공통 도메인 계약과 프로젝트·테스트 환경을 먼저 구성하고 이후 독립 세션에서 구현합니다.

### 리뷰 / 검증
초기 저장소에 커밋과 코드가 없음을 확인했습니다. 의존성 설치·실행 검증은 아래 후속 기록에 실제 결과로 추가합니다.

pnpm install과 shadcn CLI 컴포넌트 생성을 완료했습니다. pnpm typecheck 통과, lint의 PostCSS 익명 export 경고를 명명된 config로 수정했습니다. pnpm의 build script 정책은 esbuild/unrs-resolver만 명시적으로 허용했습니다. Jest DOM 6.10 deprecation 경고를 확인해 6.9.1로 고정했습니다.

### 추가 사용자 지시
“중간 중간 문서를 업데이트 해줘서 새 세션에서 뭘 하면 될 지 바로 참고할 수 있게 해줘” — STATUS와 기능별 작업/기록 문서를 추가했습니다.
“AGENTS.md 나 Plan.md는 따로 필요 없나? 잘 몰라서” — 공통 작업 규칙 AGENTS.md, 승인 범위 PLAN.md를 추가하고 변경되는 진행 상황과 분리했습니다.
