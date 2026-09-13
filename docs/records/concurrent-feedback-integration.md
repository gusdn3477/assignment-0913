# 동시 렌더링·상태 피드백 통합 기록

## 실제 사용자 지시
> AGENTS.md와 STATUS.md를 읽고 현재 완료 상태를 파악해줘.
> 추가로 하나만 더. 공통 컴포넌트(input, button 등은 기본 element를 확장시킨 방식으로 구현하자)
> 추가로 동시성 기능이 필요한 곳에 적극적으로 올바르게 활용

> useTransition. useDeffredValue 같은 동시성 기능 적극 활용도 좀 넣고
> 에러 처리나 로딩 처리도 좀 깔끔하게

> 작업 시작

## 초기 확인과 구현 범위
- 기존 `main` HEAD `0cad6b2`. 첫 상태 확인 때 작업 트리는 깨끗했고, 이후 AGENTS/DECISIONS/STATUS에 사용자 요청을 기록했습니다.
- Input/Button은 native element props를 확장하고 props/ref를 전달하는 구현입니다.
- 검색은 useMemo만 사용하고 조회 오류가 기존 데이터의 보드까지 가리는 분기였습니다.
- AGENTS의 기능당 독립 세션·워크트리 규칙에 따라 `codex/concurrent-feedback`을 만들고 기능 세션에 구현·테스트·기능 기록을 맡겼습니다. 통합은 main에서 문서·리뷰·전체 검증을 맡습니다.
- readability 스킬을 읽고 로딩·오류·결과 분기를 분리하도록 적용했습니다. 설치된 Next use-client 가이드를 확인했습니다.
- React 공식 [useTransition](https://react.dev/reference/react/useTransition), [useDeferredValue](https://react.dev/reference/react/useDeferredValue)를 확인했습니다. 비동기 Action의 pending과 결과 렌더링 지연을 구분하며 외부 store 변경이 자동으로 transition이 된다고 가정하지 않습니다.

## 검증 진행
- 구현 전 문서 변경 `git diff --check`: 통과.
- 기능 `4ceb4f7`을 main에 `b02690c`로 병합. 문서 외 실행 코드에 통합 추가 수정 없음.
- main `pnpm format:check && pnpm verify`: format/lint/strict typecheck/56 tests/webpack production build 모두 통과. 테스트 5 files, 56 passed, 12.90s. 성능 벤치마크가 아닌 해당 환경의 테스트 실행 시간입니다.
- 최초 `pnpm start --port 3101`은 sandbox listen EPERM으로 실패. 자동 승인 검토를 거친 `pnpm start --hostname 127.0.0.1 --port 3101` 실행 성공. 첫 연결 실패 탭 대신 새 탭에서 준비된 서버를 확인했습니다.

## 실제 production 브라우저 확인
2026-09-13, Codex in-app browser, `http://127.0.0.1:3101`.
- 초기 skeleton 이후 250명 표시. `김서준` 검색 1명, 빈 검색 결과와 초기화 후 250명 복원.
- 새로고침 직후 pending 안내와 기존 카드가 동시에 보임. 추가 새로고침 두 번째 시도에서 기본 확률 실패 재현, 오류 안내와 250개 카드 유지. 다시 불러오기 성공 후 정상 버튼과 250개 카드 확인.
- 상세 버튼 Enter로 Sheet 열기, Escape 후 해당 상세 버튼의 aria-label을 가진 요소로 포커스 복귀 확인.
- 390×844에서 document 폭 390, main 폭 390, toolbar/board 폭 350 확인. 기본 viewport로 복원. 데스크톱 screenshot 시각 확인.
- 페이지 새로고침 두 번째에서 초기 조회 실패 재현. Enter 재시도 직후 pending/버튼 비활성 확인. 첫 retry도 기본 확률 실패여서 searchbox 대기 timeout이 발생했으나 화면을 재확인해 retry 가능 상태임을 확인. 두 번째 retry 성공 후 activeElement가 INPUT[type=search]인 것을 확인.
- 필터 초기화 후 `전체 250명 중 250명`. 앱 error/warn logs `[]`.
- QA 탭을 닫고 임시 production 서버를 Ctrl-C로 종료했습니다. 이전 연결 실패 임시 탭의 닫기 호출은 브라우저 data URL 정책으로 거절되어 자동 정리에 맡겼습니다. 사용자 기존 dev 서버는 종료하지 않았습니다.

## 결론과 한계
승인된 추가 기능과 검증 완료. 알려진 기능 이슈 없음. 이전 기능의 카드별 rollback/같은 카드 잠금/다른 카드 병렬 저장은 전체 자동 테스트에서 재검증했습니다. React 지연 렌더링의 시간·성능 향상 수치를 측정한 것은 아니며, 250명 동작 및 입력/결과 일관성을 확인했습니다. 다중 탭·가상화 등 기존 제외 범위는 유지합니다.
