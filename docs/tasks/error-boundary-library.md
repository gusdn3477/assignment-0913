# error-boundary-library

## 사용자 요청
직접 ErrorBoundary 구현 대신 react-error-boundary 등 라이브러리로 동일 동작을 정확히 처리하고 코드 감소/좋은 예시 참고.

## 소유권/계약
- 독립 [기능 브랜치] / [기능 작업 공간]. src/components/candidate/error-boundary/** 및 필요한 실제 소비처(최소화), task/record 소유. package/lock 및 top-level 문서는 통합 담당.
- react-error-boundary 공식 README quick start의 fallbackRender/resetErrorBoundary/onReset 조합 참고. 기존 CandidateErrorBoundary public label/children/onRecover 유지한 얇은 함수 wrapper. 직접 class/state/getDerivedStateFromError 제거.
- 영역별 안내와 alert/RetryButton 스타일/문구 유지, raw error 비노출. onReset에 onRecover 연결하여 복구원인 제거 후 재렌더. 기존 selectedId key 기반 상세 경계 remount 유지. API 조회/저장 오류는 기존 Query/toast; 불필요 resetKeys/QueryErrorResetBoundary/provider 추가 금지.
- 기존 실제 throw→격리→복구 test 유지/보강: onRecover 단1회, onRecover 없는 재시도, 재시도에도 오류면 fallback 유지, key 변경 새내용 복구 등 필요한 contract tests 최소 작성. 라이브러리 mock 금지.
- 코드 감소 실제 줄 수와 제거된 책임 기록. Next 설치 client 경계 문서 확인. lint/typecheck/format/관련 boundary+app tests 검증 후 한글 커밋. root build/browser/통합 기록.

## 기능 인계
- 함수 wrapper 전환 완료. 기존 소비처 변경 없이 fallbackRender/resetErrorBoundary/onReset 사용, 직접 state/class 제거.
- 프로덕션 49→38행, 실제 라이브러리 boundary 3 tests와 app14 총17 tests 통과.
- lint/typecheck/format 모두 통과. 상세 기록: docs/records/error-boundary-library.md. 통합 담당이 build/browser/전체 검사 진행.
