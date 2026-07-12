# Architecture

Kotoba Tower는 계산, 표현, 플랫폼 기능을 분리한다.

- `domains/`: 브라우저와 Phaser에 의존하지 않는 결정적 TypeScript 규칙. 향후 서버에서도 공유한다.
- `game/`: 이미 계산된 `BattleEvent[]`를 Phaser로 재생한다. 프레임 속도와 애니메이션은 승패를 바꾸지 않는다.
- `screens/`, `components/`: React 모바일 UI와 화면 이동.
- `stores/`: 자동 진행 오케스트레이션과 앱 상태. 학습 완료 후 같은 층 재도전을 연결한다.
- `services/`: 웹/Capacitor 저장, 오디오, 햅틱 같은 플랫폼 경계.
- `schemas/`: 저장 데이터와 향후 API Structured Output의 Zod 검증 경계.

향후 서버는 별도 Next.js 애플리케이션으로 추가한다. 문제 생성, 계정, 결제와 영수증 검증은 모바일 클라이언트에 넣지 않고 서버 API 뒤에 둔다. 공유 패키지는 전투/학습 타입과 Zod 스키마만 노출한다.

전투 흐름은 `simulateBattle(input) → BattleResult + BattleEvent[] → Zustand → BattleScene playback → progression`이다. Scene은 입력 스탯을 읽거나 피해를 계산하지 않는다.

저장은 `StorageAdapter`를 통해 웹 localStorage와 Capacitor Preferences를 선택한다. 잘못된 데이터는 Zod 검증에서 거부하고 안전한 초기값으로 복구한다.
