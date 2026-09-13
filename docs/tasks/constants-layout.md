# constants-layout

## 요청

"constants도 component와 같은 레벨로 빼자. 차라리 constants 하위에서 도메인별로 파일 만드는 방식으로 진행."

## 소유 범위와 구현

- `src/constants/candidate.ts`에 지원자 도메인의 단계·직무·스타일·저장 키·에러 코드와 안내·Query key를 통합합니다.
- 기존 constants 네 파일과 단일 상수만 담은 `queries/candidate-keys.ts`를 제거하고 모든 소스/테스트 import를 새 alias로 연결합니다.
- 공개 export 이름·값·타입과 실행 동작을 유지합니다. Query options 함수와 시드 비공개 데이터는 현 위치에 둡니다.
- 이 작업 문서와 `docs/records/constants-layout.md`를 소유합니다. 통합 담당이 상위 문서 및 production build/browser를 담당합니다.

## 검증 및 인계

구현 완료. 포맷/lint/strict typecheck 통과. 전체 114개 중 113개 통과 후 가상화 1개 시간 제한 실패는 해당 파일 단독 재실행에서 7개 모두 통과했습니다. 테스트/제한 변경 없음. 공개 선언 12개 AST 동일 확인, 이전 import 잔존 0건. 상세 실행 기록은 docs/records/constants-layout.md에 있습니다. 통합 build/browser는 통합 담당에게 인계합니다.
