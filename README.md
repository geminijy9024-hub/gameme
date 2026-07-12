# 言ノ葉の塔 — Kotoba Infinite Tower

언어지식·독해·청해·회화 학습이 각각 일반 공격력·최대 체력·속도·마법 피해로 성장하고, 전투 선택 없이 자동으로 무한 탑을 오르는 일본어 학습 RPG의 첫 전투 프로토타입입니다.

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4
- Phaser 3 (시각화 전용), Zustand (localStorage 영속화)
- Vitest (순수 전투 엔진 테스트)
- 이후 단계: Zod, OpenAI Responses API, PostgreSQL, Prisma, Playwright

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## 핵심 규칙

- 플레이어 속도가 적 속도 이상이면 플레이어 선공(동속도 결정 규칙)
- 999층 이하: 일반 피해 + 마법 피해가 본체에 동시 적용
- 1000층 이상: 쉴드가 있는 동안 일반 피해 완전 차단, 마법 피해만 쉴드에 적용
- 쉴드가 파괴된 다음 플레이어 공격부터 두 피해가 본체에 적용
- 회복형을 포함해 모든 전투는 최대 80턴에서 종료
- 같은 입력은 언제나 같은 전투 결과를 반환

## 구조

```text
app/                         Next.js 진입점과 전역 스타일
src/components/tower/        탑 대시보드와 Phaser 마운트
src/config/                  성장식, 쉴드, 적 유형 설정
src/domains/battle/          순수 전투 엔진과 패배 분석
src/game/phaser/             전투 결과 시각화
src/stores/                  Zustand + localStorage 진행 상태
tests/battle/                전투 규칙 단위 테스트
```

## 수동 테스트

1. 1층 시작: 균형형 적과 자동전투 후 승리 시 다음 층으로 자동 이동합니다.
2. 5층 시작: 회복형 적이 매 3번째 행동에 회복하며, 장기전도 80턴에서 멈춥니다.
3. 999층 시작: 쉴드가 0이고 일반·마법 피해가 모두 적 체력에 표시됩니다.
4. 1000층 시작: 파란 쉴드가 보이며 일반 피해가 차단됩니다. 회화 피해로 쉴드가 깨진 다음 공격부터 본체 피해가 들어갑니다.
5. 약한 스탯으로 패배: 진행이 멈추고 우측에 여러 성장 선택지가 표시됩니다.
6. 새로고침: 현재 층, 최고층, 네 스탯이 localStorage에서 복원됩니다.

## 문제 해결

- 화면이 비면 브라우저 콘솔에서 Phaser WebGL 오류를 확인하고 하드웨어 가속을 켭니다. Canvas로 자동 대체됩니다.
- 저장값이 이상하면 개발자 도구에서 `kotoba-tower-progress-v1` localStorage 항목을 지우거나 초기화 버튼을 누릅니다.
- 타입 오류가 나면 Node.js 22.13 이상과 `npm install` 완료 여부를 확인합니다.
- 포트 충돌 시 `npm run dev -- --port 3001`로 실행합니다.
