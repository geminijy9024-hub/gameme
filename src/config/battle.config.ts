export const BATTLE_CONFIG = {
  shieldStartFloor: 1000,
  baseEnemy: { attack: 18, maxHp: 100, speed: 12 },
  floorGrowth: {
    linearPerFloor: 0.006,
    curveScale: 0.012,
    curveExponent: 1.18,
  },
  shield: { hpRatio: 0.52, floorBonus: 0.0015 },
  maxTurns: 80,
  magicBodyMultiplier: 1,
  healing: { every: 3, maxHpRatio: 0.09 },
  animationMs: 480,
} as const;

export function floorMultiplier(floor: number): number {
  const safeFloor = Math.max(1, Math.floor(floor));
  const progress = safeFloor - 1;
  return (
    1 +
    progress * BATTLE_CONFIG.floorGrowth.linearPerFloor +
    BATTLE_CONFIG.floorGrowth.curveScale * Math.pow(progress, BATTLE_CONFIG.floorGrowth.curveExponent)
  );
}
