import { ARCHETYPE_ORDER, ENEMY_ARCHETYPES } from "@/src/config/enemy-archetypes";
import { BATTLE_CONFIG, floorMultiplier } from "@/src/config/battle.config";
import type { EnemyStats } from "./battle.types";

export function generateEnemy(floor: number): EnemyStats {
  const safeFloor = Math.max(1, Math.floor(floor));
  const archetype = ARCHETYPE_ORDER[(safeFloor - 1) % ARCHETYPE_ORDER.length];
  const config = ENEMY_ARCHETYPES[archetype];
  const growth = floorMultiplier(safeFloor);
  const maxHp = Math.round(BATTLE_CONFIG.baseEnemy.maxHp * growth * config.hp);
  const shieldGrowth = 1 + Math.max(0, safeFloor - BATTLE_CONFIG.shieldStartFloor) * BATTLE_CONFIG.shield.floorBonus;

  return {
    archetype,
    name: config.label,
    attack: Math.max(1, Math.round(BATTLE_CONFIG.baseEnemy.attack * growth * config.attack)),
    maxHp,
    speed: Math.max(1, Math.round(BATTLE_CONFIG.baseEnemy.speed * growth * config.speed)),
    maxShield:
      safeFloor >= BATTLE_CONFIG.shieldStartFloor
        ? Math.round(maxHp * BATTLE_CONFIG.shield.hpRatio * shieldGrowth)
        : 0,
    healEvery: config.heals ? BATTLE_CONFIG.healing.every : 0,
    healAmount: config.heals ? Math.max(1, Math.round(maxHp * BATTLE_CONFIG.healing.maxHpRatio)) : 0,
  };
}
