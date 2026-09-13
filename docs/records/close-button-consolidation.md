# CloseButton 중복 정리 기록

## 실제 요청
“close-button 이 지금 2개 존재하고 있어서 정리 필요”. 이전 요청의 간단한 상세 닫기 조합과 SearchBar의 onClear + 비어 있지 않은 value 계약을 유지합니다.

## 읽기와 판단
PLAN.md, STATUS.md, DECISIONS.md 및 이 기능 작업서를 확인했습니다. 설치된 Next use-client 문서에서 기존 Sheet 클라이언트 경계 유지가 적합함을 확인했습니다. 상세 전용 CloseButton은 공용 버튼에 Sheet 닫기·위치·라벨만 추가했고 SheetContent 자체에도 별도 X 구현이 있었습니다. 따라서 SheetContent 기본 닫기 조합을 공용 CloseButton으로 교체하고 상세 래퍼를 삭제했습니다. 새 의존성은 없습니다.

## 산출물
- buttons/close-button.tsx 단일 구현 유지, 검색 지우기 소스는 변경하지 않음.
- SheetContent가 Radix Close asChild와 공용 버튼을 조합. closeButtonProps로 native props/ref/라벨/스타일 전달. children 앞에 배치하여 최초 닫기 focus 유지.
- CandidateDetail은 closeButtonProps의 상세 닫기 라벨만 지정.
- 상세 wrapper 테스트를 ui/sheet.test.tsx로 옮기고 기본 닫기·키보드·focus 복귀·ref/스타일 override와 닫기 숨김 후 Escape 동작 검증.

## 검증 및 리뷰
- ./node_modules/.bin/vitest run src/components/ui/sheet.test.tsx src/components/search-bar/search-bar.test.tsx src/components/candidate/app/candidates-app.test.tsx: 3 files, 23 tests 통과(10.39초).
- ./node_modules/.bin/eslint .: 통과.
- ./node_modules/.bin/tsc --noEmit: 통과.
- ./node_modules/.bin/prettier --check src/components/ui/sheet.tsx src/components/ui/sheet.test.tsx src/components/candidate/detail/candidate-detail.tsx: 통과.
- 통합 담당 diff/tests 리뷰: native props/ref, class merge, 최초 focus, Escape/hide 책임 적절; 수정 요청 없음.
- production build 및 실제 브라우저 검증은 통합 담당 인계. 기능 미해결 이슈 없음.

## 위치
[기능 작업 공간] / [기능 브랜치]. 커밋은 영어 type/scope와 한글 설명을 사용합니다.
