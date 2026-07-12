import { describe, expect, it } from "vitest";
import { simulateBattle } from "../../src/domains/battle/battle-engine";
import { resolvePlayerDamage } from "../../src/domains/battle/damage-calculator";
import type { EnemyStats, PlayerStats } from "../../src/domains/battle/battle.types";

const player: PlayerStats = { attack: 30, maxHp: 200, speed: 20, magicDamage: 12 };
const enemy = (overrides: Partial<EnemyStats> = {}): EnemyStats => ({
  archetype: "balanced",
  name: "테스트 적",
  attack: 10,
  maxHp: 100,
  speed: 10,
  maxShield: 0,
  healEvery: 0,
  healAmount: 0,
  ...overrides,
});

describe("deterministic battle engine", () => {
  it("속도가 높은 쪽이 선공한다", () => {
    const playerFirst = simulateBattle({ floor: 1, player, enemy: enemy({ speed: 19 }) });
    const enemyFirst = simulateBattle({ floor: 1, player, enemy: enemy({ speed: 21 }) });
    expect(playerFirst.events[1]?.type).toBe("player-attack");
    expect(enemyFirst.events[1]?.type).toBe("enemy-attack");
  });

  it("동일 입력은 항상 동일한 결과를 반환한다", () => {
    const input = { floor: 77, player };
    expect(simulateBattle(input)).toEqual(simulateBattle(input));
  });

  it("999층 이하에서는 일반 피해와 마법 피해가 본체에 함께 적용된다", () => {
    const result = simulateBattle({ floor: 999, player, enemy: enemy({ maxHp: 200, maxShield: 0 }) });
    const firstHit = result.events.find((event) => event.type === "player-attack");
    expect(firstHit?.physicalDamage).toBe(30);
    expect(firstHit?.magicDamage).toBe(12);
    expect(firstHit?.enemyHp).toBe(158);
  });

  it("1000층 이상 쉴드는 일반 피해를 완전히 차단한다", () => {
    const damage = resolvePlayerDamage(100, 30, 40, 10);
    expect(damage.blockedPhysical).toBe(40);
    expect(damage.physicalToBody).toBe(0);
    expect(damage.nextHp).toBe(100);
  });

  it("마법 피해가 쉴드를 파괴한다", () => {
    const damage = resolvePlayerDamage(100, 10, 40, 12);
    expect(damage.nextShield).toBe(0);
    expect(damage.shieldBroken).toBe(true);
  });

  it("쉴드가 파괴된 다음 공격부터 일반 피해가 본체에 적용된다", () => {
    const result = simulateBattle({ floor: 1000, player, enemy: enemy({ maxHp: 100, maxShield: 10 }) });
    const attacks = result.events.filter((event) => event.type === "player-attack");
    expect(attacks[0]?.physicalDamage).toBe(0);
    expect(attacks[1]?.physicalDamage).toBe(30);
    expect(attacks[1]?.enemyHp).toBe(58);
  });

  it("회복형 적도 최대 턴에서 종료되어 무한 전투가 되지 않는다", () => {
    const result = simulateBattle({
      floor: 5,
      player: { attack: 1, maxHp: 100000, speed: 20, magicDamage: 0 },
      enemy: enemy({ archetype: "regenerator", maxHp: 100, attack: 1, healEvery: 1, healAmount: 10 }),
    });
    expect(result.winner).toBe("draw");
    expect(result.reason).toBe("turn-limit");
    expect(result.turns).toBe(80);
  });
});
