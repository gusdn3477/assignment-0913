# search-bar-fixed-icons

## 요청/소유
SearchBar의 left/right 제거, 돋보기와 CloseButton 배치. [기능 브랜치] / [기능 작업 공간]. SearchBar 구현/테스트와 task/record 소유.

## 계약
공개 타입에서 type/left/right 제외. 내부 Input left에 돋보기, right에 조건부 CloseButton 고정. onClear+비어 있지 않은 value 조건, native onChange/ref/disabled/readOnly/keyboard focus 유지. 범용 Input 슬롯은 그대로 유지.

## 완료 인계
공개 left/right 제거, 내부 Input 슬롯에 고정 돋보기/CloseButton 배치. SearchBar 슬롯 override 테스트를 고정 아이콘/native 계약 검증으로 정정. 관련20 tests/lint/typecheck/format/diff-check 통과. 신규 의존성/미해결 기능 이슈 없음. 통합 build/browser 후 기록 추가.
