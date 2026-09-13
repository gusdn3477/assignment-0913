# 승인된 구현 계획

## 목표
6시간 내 채용 파이프라인 보드 필수 기능, 핵심 검증, 제출 문서 완성. 기능 분할은 유동적이며 한 기능당 독립 세션·브랜치·워크트리를 사용합니다.

## 필수 범위
5단계(서류검토·면접·처우협의·최종합격·불합격) 보드, 지원자 카드, 단계 메뉴 이동·영속 저장, 낙관적 반영·실패 롤백, 이름 검색·직무 필터, 상세 Sheet, 로딩·에러·빈 상태. 경쟁 상태 방어와 키보드 접근성을 포함합니다.

## 기술
TypeScript strict, React, Next App Router, Tailwind, cn(clsx + tailwind-merge), shadcn/ui, TanStack Query, Zustand, pnpm. 필요하면 라이브러리를 추가하고 이유를 기록합니다. Vitest + React Testing Library로 검증합니다.

## 상태와 저장
Query: 지원자 캐시와 mutation. Zustand: 검색어·직무·상세 선택. persist: 검색어·직무만 저장. 별도 mock API: 지원자 250명, 200~800ms 지연, 약 15% 실패, 성공 후 localStorage 저장. 단일 탭에서 카드별 최신 저장 갱신. 같은 카드 중복 이동 차단, 다른 카드 병렬 허용, 실패 카드만 복구. 저장 데이터 런타임 검증.

## 진행
초기 기반/계약 → 독립 기능 병렬 개발·점진 병합 → 핵심 흐름/실패/접근성 검증 → 문서 및 최종 검사. 통합 1 + 기능 세션 최대 3. 마지막 40분은 새 기능 추가를 중단하고 결함/검증에 사용합니다. 현재 배정과 결과는 STATUS.md에서 확인합니다.

## 완료 기준
영속 저장, 낙관적 UI·실패 롤백, 카드 간 경쟁 상태, 검색/필터, UI 설정 복원/손상 데이터, 250건 반응성, 반응형, 키보드/포커스 검증. lint/typecheck/test/build 통과. 기능별 커밋과 README/PROMPTS/DECISIONS 제공.

## 초기 제외 (후속 승인 전)
Undo, 가상화, DnD, 로그인, 지원자 생성/삭제, 실제 백엔드, 다중 탭 동기화, 공개 저장소 생성/푸시/배포.

아래 후속 승인에 따라 가상화·Undo·DnD는 구현 범위에 포함되었습니다. 나머지 제외 항목은 그대로 유지합니다.

## 후속 승인: 동시 렌더링과 상태 피드백 (2026-09-13)
사용자의 “작업 시작”에 따라 문서화한 추가 기준을 실제 구현합니다. `concurrent-feedback` 한 기능 세션에서 검색·필터 결과의 `useDeferredValue` 적용, 재시도 Action의 `useTransition` 대기 상태, 최초 로딩/조회 오류/백그라운드 갱신 분리와 회귀 테스트를 수행합니다. 입력은 즉시 갱신하고 카드 저장·잠금·롤백은 최신 데이터를 유지합니다. 기존 Input/Button의 native element props 확장 방식은 유지합니다. 통합 담당은 리뷰·production build·브라우저 확인·인계 기록을 담당합니다.

## 후속 승인: 보드 가상화 (2026-09-13)
사용자의 “문서 보고 선택 작업도 이어서 진행(가상화 등)”에 따라 기존 제외 범위에서 가상화를 이번 구현 범위로 옮깁니다. `codex/virtualization` 독립 기능 세션에서 1,000건 데이터의 컬럼별 렌더링, 키보드 전체 카드 접근, 상세/이동/롤백 포커스와 검색 후 스크롤 회복을 구현·검증합니다. 기본 250명 시드는 유지합니다. 통합은 production build와 브라우저 검증을 수행합니다. Undo와 DnD는 다음 독립 기능 후보로 남깁니다.

## 후속 승인: Undo (2026-09-13)
사용자의 “후속 작업 이어서 작업하자.” 및 “Undo: 저장된 단계 이동 되돌리기 (추천)” 선택에 따라 Undo를 승인 범위에 추가합니다. `codex/undo` 독립 기능 세션에서 카드별 마지막 성공 이동 한 번 되돌리기, 실패 시 재시도, 기존 저장 잠금·롤백·가상화 포커스 보존을 구현합니다. 이력은 메모리에만 유지하며 새로고침 후 복원하지 않습니다. 통합은 리뷰·production build·브라우저 검증과 문서 갱신을 담당합니다. DnD는 후속 후보로 남깁니다.

## 후속 승인: DnD (2026-09-13)
사용자의 “선택사항 이어서 진행하자”에 따라 남은 선택사항 DnD를 승인 범위에 추가합니다. 새 `codex/dnd` 기능 세션에서 단계 간 드래그 이동을 구현하고 기존 메뉴·Undo·롤백·가상화를 유지합니다. 컬럼 내 순서 변경은 제외하며 키보드와 터치에는 기존 단계 메뉴를 제공합니다. 통합은 리뷰·production build·브라우저 확인을 담당합니다.

## 후속 승인: 재사용 컴포넌트와 구조 정리 (2026-09-13)
사용자의 선택사항 1~4 추가 요청을 구현합니다. `reusable-ui`는 clearButton을 포함한 Input, 의미 있는 버튼 래퍼, left/center/right Header를 담당합니다. `candidate-structure`는 컴포넌트별 폴더와 상수/타입/유틸/훅/API/query key·queryOptions 분리, 용도별 skeleton, 실제 입력 로직 추상화를 담당합니다. 두 독립 세션·워크트리에서 서로 다른 소유 파일을 수정하고 통합합니다. useSuspenseQuery는 브라우저 저장소·조회 취소·오류 복구 계약과 비교해 적합한 곳에만 적용하며 판단 근거를 기록합니다. 억지 추상화 및 사용되지 않는 컴포넌트는 추가하지 않습니다. 기존 전체 회귀 검사와 production 브라우저 검증을 완료합니다.

## 후속 승인: Query와 렌더링 경계 (2026-09-13)
사용자의 추가 요청을 독립 `codex/candidate-boundaries` 워크트리에서 적용합니다. Tailwind 4 canonical class ESLint와 자동 수정, useQuery의 데이터/조회 상태 정규화, 기존 @ alias 활용, route loading 및 영역별 render 예외 복구, 정적 서버 page와 interactive client 후보 영역 분리를 포함합니다. 기존 cancellation/카드 잠금/롤백/Undo/DnD/가상화 계약을 유지하며 통합 검증합니다.

## 후속 승인: 검색 조합과 보드 공간 (2026-09-13)
사용자 요청에 따라 Input 좌우 슬롯과 실제 SearchBar 조합, ReloadButton 역할 분리, 보드 높이 확대 및 목록 끝 카드 가시성을 독립 search-board-polish 세션에서 구현합니다. 기존 native input/포커스/가상화/저장 계약을 유지합니다.

## 후속 승인: DnD 라이브러리와 선언적 조회 경계 (2026-09-13)
사용자 요청에 따라 DnD 직접 구현을 @dnd-kit 기반으로 단순화하고, useQuery 최초 로딩·오류·재시도 처리를 Guard/Wrapper로 캡슐화하며 상세 닫기 호출을 기본값 조합으로 정리합니다. 독립 dnd-kit-migration/query-guard-close 세션에서 구현 후 통합합니다. 커밋 접두사/scope는 영어, 설명은 한글을 사용합니다.

## 후속 승인: 조회 에러 상수화 (2026-09-13)
사용자 요청에 따라 조회 오류 코드와 표시 메시지를 지원자 도메인 상수로 추출하고 생성/소비처에서 재사용합니다. 기존 메시지 및 오류 복구 동작은 유지합니다.

## 후속 승인: API와 지원자 컴포넌트 위치 정리
사용자 요청에 따라 API는 src/api/candidate로, 지원자 컴포넌트는 src/components/candidate 아래 board/card/detail 등 역할별 폴더로 이동합니다. 기존 동작과 나머지 도메인 계층은 유지합니다.

## 사용자 정정: SearchBar 기본 조합
SearchBar가 Input left 돋보기와 right CloseButton 및 지우기/focus 동작을 소유합니다. 최신 사용자 정정에 따라 native onChange를 유지하고 onClear가 전달되고 value가 비어 있지 않을 때만 X를 표시합니다.

## 후속 승인: 빈 결과 Guard
사용자 요청에 따라 빈 지원자 목록/검색 결과 없음 분기와 초기화를 CandidateEmptyGuard 내부로 이동하고 정상 결과에는 children을 반환합니다.

## 사용자 정정: 동시 렌더링 범위 축소
동시 렌더링은 이름 Input에 따른 카드 목록 갱신에만 적용합니다. 새로고침/재시도의 useTransition은 제거하고 Query 조회 상태로 피드백을 유지합니다. 이전 적극 활용 기준보다 이번 사용자 정정을 우선합니다.

## 사용자 정정: UI Provider 제거와 loading 명칭
Zustand UI 상태의 Context/Provider를 제거하고 bound store를 직접 구독합니다. 저장값은 client effect에서 복원하고 검증/영속 저장 범위를 유지합니다. 앱 소유 컴포넌트의 pending은 loading, 카드 집합은 loadingIds로 통일합니다. Query/DnD 라이브러리 Provider는 유지합니다.

## 후속 승인: ErrorBoundary 라이브러리 전환
사용자 요청에 따라 직접 작성한 class 경계를 react-error-boundary로 교체하고 공식 예시의 fallback/reset 조합을 사용합니다. 영역별 렌더 오류 복구와 기존 Query 오류 처리 구분은 유지합니다.

## 사용자 정정: Input primitive
Input은 native props/ref와 스타일·left/right 슬롯만 제공하는 primitive로 둡니다. clearButton 중복 기능은 제거하고 SearchBar의 onClear 동작을 사용합니다. 테스트는 구현과 함께 ui/input.test.tsx에 배치합니다.

## 후속 승인: CloseButton 중복 정리
상세 전용 CloseButton 래퍼를 제거하고 SheetContent의 기본 닫기 버튼을 공용 CloseButton으로 통합합니다. 상세 화면의 최소 설정, 검색 지우기, 키보드 닫기와 포커스 복귀를 유지합니다.

## 후속 승인: 도메인별 최상위 constants
상수는 components와 같은 src/constants 아래 도메인별 파일로 배치합니다. 현재 지원자 단계/직무/스타일/저장 키/검색 제한/오류 코드·메시지/Query 키를 candidate.ts로 모으고 기존 import를 갱신합니다.

## 사용자 정정: Input의 동일 외형과 슬롯 공간
슬롯이 없어도 동일한 wrapper/input을 렌더링합니다. 외곽 스타일은 공통이고 좌/우 슬롯이 있을 때만 해당 콘텐츠 너비와 간격을 확보합니다.

## 사용자 정정: SearchBar 고정 아이콘
SearchBar의 공개 left/right props를 제거하고 내부 Input에 돋보기/CloseButton을 고정 배치합니다. onClear와 비어 있지 않은 value에 따른 지우기 표시 조건은 유지합니다.
