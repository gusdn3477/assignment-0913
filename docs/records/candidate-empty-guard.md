# candidate-empty-guard

## 실제 요청
“=== 0 관련 처리 부분은 Guard 등으로 처리 가능해 보여서, 이런 엣지 케이스를 내부적으로 처리하고 return children 하는 컴포넌트로 래핑하자”

## 출력 및 리뷰
CandidateEmptyGuard(total, filtered, children)를 추가. 결과가 있으면 children을 반환하고 빈 결과는 데이터 유무에 따른 안내와 검색 초기화를 내부 처리한다. CandidatesApp의 인라인 분기와 resetFilters 구독을 제거. Toolbar와 지연 상태 컨테이너는 밖에 유지해 검색/초기화가 계속 가능하며 결과 수와 빈 상태가 같은 deferred 결과를 사용한다. 기존에 함께 표시하던 빈 5개 컬럼은 Guard의 fallback에 따라 미렌더한다.

## 명령과 결과
- 설치된 Next use-client 문서 확인.
- pnpm 명령은 공유 node_modules 링크에서 자동 install을 시도해 NO_TTY로 중단. 의존성 변경 없이 설치된 node_modules/.bin 실행으로 검증.
- prettier --write 변경 3파일: 완료.
- node_modules/.bin/eslint .: 통과.
- node_modules/.bin/tsc --noEmit: 통과.
- node_modules/.bin/vitest run src/components/candidate/app/candidates-app.test.tsx: 14/14 통과. 빈 데이터, 필터 조합/초기화, 배경 조회, 롤백/Undo/DnD 회귀 포함.
- git diff --check: 통과.

## 인계
독립 워크트리 .worktrees/candidate-empty-guard, 브랜치 codex/candidate-empty-guard. 추가 의존성 없음. 통합 production build/browser 검증 예정.

## 통합 검증 완료
기능 3f068eb를 main에 merge. 통합 후 node_modules/.bin/next build --webpack 성공. localhost:3021 production 브라우저에서 250명→없는 이름 검색→0명 및 안내만 표시(보드 없음)→검색 조건 초기화→250명과 보드 복원 확인. console error/warn []. 테스트 탭/서버 정리. 통합 이전 시작한 빌드는 검증으로 집계하지 않고 병합 후 다시 수행. 미해결 사항 없음.
