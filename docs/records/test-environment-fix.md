# 테스트 환경 지연 원인과 수정

## 지시와 접근
남은 통합/보드 테스트 timeout을 생략·시간 제한 증가 없이 해결한다는 승인된 검증 기준에 따라 진단했습니다.

## 실제 관찰
- 실제 브라우저에서는 키보드 메뉴 이동·rollback·포커스·알림이 정상 동작했습니다.
- JSDOM 통합 테스트에서는 메뉴 선택 및 mock API 호출까지 진행된 뒤 100ms 타이머도 약 26~29초 후 실행됐습니다.
- 보드 세션은 Radix close 타이머를 명시적으로 flush하는 검증을 추가했지만 전체 환경의 간헐적 지연은 남았습니다.
- 임시 CPU profile을 생성해 hot frames를 집계했습니다. nwsapi@2.2.27의 get 5.2s, has 4.4s, isFullscreen 2.6s, Element.matches/matchesNative 등 선택자 처리에서 대부분의 시간이 소모됐습니다.
- 설치된 소스에서 isFullscreen → matchesNative(node, ':fullscreen') → JSDOM Element.matches → nwsapi라는 재진입 경로를 확인했습니다. 브라우저 네이티브 matches를 가정한 경로가 JSDOM에서는 동일 엔진으로 돌아옵니다.

## 채택 / 기각
- 채택: pnpm overrides에서 `jsdom>nwsapi`만 2.2.23으로 고정. 앱 런타임 의존성에는 영향을 주지 않습니다.
- 기각: 프로덕션 onMove 타이밍 변경, 실패 테스트 제외, timeout 증가, 낙관적 저장 단계 검증 축소. 최종 acceptance 테스트는 원래 deferred API·저장중 잠금·rollback·알림 검증을 모두 유지했습니다.
- 임시 console 계측과 축소 테스트는 제거했습니다. CPU profile은 추적하지 않는 artifacts에만 있습니다.

## 결과
`pnpm test`: 5 files / **50 tests passed**, **3.91s**. board 8개 모두 통과(250명 렌더 1.26s), acceptance 5개 모두 통과(문제였던 optimistic/rollback 372ms).
위 비교는 이 개발 환경의 관찰 결과이며 모든 버전/환경에 대한 일반 성능 보장은 아닙니다.
