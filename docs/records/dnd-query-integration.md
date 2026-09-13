# DnD 라이브러리·조회 Guard 통합 기록

## 실제 사용자 요청
- DnD 구현 코드가 늘어 @dnd-kit 등을 고려하는 방향으로 구현.
- useQuery loading은 Guard/Wrapper로 감싸 사용처가 loading만 던지거나 몰라도 Suspense와 비슷한 효과.
- 상세 CloseButton의 반복 variant/size/aria-label/className/null children을 기본 호출 <CloseButton />로 정리.
- 이전 사용자 지시: 커밋 접두사/scope는 영어, 내용은 한글.

## 범위/배정
- AGENTS의 독립 기능 세션·워크트리 규칙에 따라 dnd-kit-migration과 query-guard-close를 별도 배정. DnD는 board/card/native DnD tests, Guard는 app/query presentation/detail/buttons를 소유하여 겹침 방지.
- readability skill 적용: app의 initial loading/error/retry 중첩 분기를 실제 Guard로 분리. 단순 파일 이동으로 복잡성을 숨기지 않고 사용처 계약 단순화.
- 기준 main ca655ae: 108 tests 통과한 직전 코드. native drag hook 158행, token/DataTransfer/drag image/edge scroll 직접 처리.

## 공식 API/설치
- 최신 공식 https://dndkit.com/react/quickstart/ 및 provider/feedback 가이드 확인. legacy @dnd-kit/core 대신 최신 React binding API를 우선 검토.
- 통합 담당 `pnpm add @dnd-kit/react`: 0.5.0 설치 성공, 7 packages 추가. 명시적으로 가져올 한국어 accessibility/feedback API 때문에 기능 담당이 @dnd-kit/dom 0.5.0 직접 의존성 요청.
- 실제 구현/검증/비교 수치는 기능 records와 최종 통합 결과에 이어 기록합니다.
