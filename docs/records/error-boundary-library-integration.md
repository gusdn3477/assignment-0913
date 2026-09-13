# ErrorBoundary 라이브러리 전환 통합 기록

## 사용자 요청/배정
사용자: “errorboudary는 직접 구현 대신 어차피 같은 동작만 정확하게 하는 react-error-boundary와 같은 라이브러리 사용해서 코드 감소 및 좋은 예시 참고”.
- 시작 main368904d clean. 새 codex/error-boundary-library/.worktrees/error-boundary-library 독립 기능, boundary/tests/task/record 소유. root는 의존성/최상위 문서/리뷰/build/browser.
- root pnpm add react-error-boundary 성공,6.1.5 추가1패키지. 기존 eslint/whatwg-encoding deprecation 경고는 이번 변경 원인이 아니며 패키지 업그레이드로 범위 확장하지 않음. 범위/의존성b3f2a52 기록.

## 공식 예시와 검토
- https://github.com/bvaughn/react-error-boundary#quick-start 확인. fallbackRender가 resetErrorBoundary를 retry에 연결하고 onReset은 오류 원인 상태를 정리하는 구조.
- 설치6.1.5 구현에서 resetErrorBoundary가 onReset 호출 후 오류 상태를 초기화함을 확인. 기존 onRecover→setState 순서를 유지할 수 있음. peer React18/19 확인.
- API 비동기 오류와 렌더 예외를 합치지 않고 기존 scope별 경계/selectedId key 유지. 원문 error 표시 예시는 그대로 복사하지 않고 기존 사용자 안전 안내 유지.

## 구현/검증
- 기능a3c4bf3/main통합daf119d. 코드 리뷰: public label/children/onRecover 소비처 변경없음, callback을 onReset에 직접 연결하고 retry버튼은 resetErrorBoundary를 호출. 원문오류는 표시하지 않음.
- wc-l 동일기준49→38행(11행 감소); 최초 설명의50은 문자열 줄분리 계산 차이여서 동일기준으로 바로잡음. 직접 class/failed state/getDerivedStateFromError/setState 책임 제거.
- 실제 library throw/격리/raw비노출/단1회복구/지속오류/콜백없는retry/keyremount tests3 및 app14 총17통과, eslint/tsc/prettier 통과. 동일검사 중복없이 main build/browser 후속 확인.

- main pnpm build 성공. production3103 초기 skeleton→250명/5단계, 검색→상세 열기/Enter 닫기/카드 focus복귀/검색 초기화250명, console error/warn[] 확인. 강제 렌더 오류 복구는 실제 라이브러리 자동tests에서 검증했으며 브라우저에 임의 오류 주입하지 않음. 탭/서버 종료, 미해결 기능 이슈 없음.
