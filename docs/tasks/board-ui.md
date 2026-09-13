# board-ui: 보드·카드·단계 메뉴

## 범위 / 소유 파일
`src/features/candidates/board.tsx`, 관련 보드 컴포넌트/테스트, `docs/records/board-ui.md`, 이 문서.
공유 UI는 기존 `src/components/ui`를 사용합니다. 공유 파일 변경은 통합 담당자에게 요청합니다.

## 계약
export `CandidateBoard({ candidates, pendingIds, onMove, onOpenDetail })`.
candidates: Candidate[], pendingIds: ReadonlySet<string>, onMove: (id:string,stage:Stage)=>void, onOpenDetail: (id:string)=>void.
모든 컬럼 항상 표시, 필터는 호출자가 수행. 지원일 내림차순/id 정렬.

## 디자인
Orbit 채용 서비스. 밝은 중성 배경, 흰 카드, 은은한 보라 포인트, 정돈된 작은 타이포, 충분한 여백. 5컬럼 가로스크롤, 컬럼 상태색·카운트, 아바타 이니셜·직무·날짜·단계, 독립 상세 버튼과 단계 DropdownMenu. 불필요한 가짜 버튼 금지.

## 완료 기준
키보드로 상세/이동, 현재 단계·저장중 이동 비활성, 카드 이동 후 DOM 재배치에 따른 포커스 복원, 빈 컬럼, 250명 렌더 대응.
단계 변경시 전체 카드 렌더 최소화(memo, 안정적인 props). 본문과 메뉴 중첩 버튼 금지.
UI 테스트 및 기록 후 feat(board-ui) 커밋. app/page, globals, package 변경 금지.

## 인계

구현 완료: `src/features/candidates/board.tsx`, 테스트 8개 `board.test.tsx`.
상세/이동 버튼에 각각 `data-candidate-detail`, `data-candidate-move` 제공.
컬럼 목록 독립 스크롤 및 단계 h3 적용. 타입 검사·scoped lint 통과.
Radix 메뉴 async 테스트 지연이 남아 통합에서 브라우저 및 전체 suite 재검증 필요. 상세 내용은 docs/records/board-ui.md.
