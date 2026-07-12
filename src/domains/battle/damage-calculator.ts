import { BATTLE_CONFIG } from "@/src/config/battle.config";

export interface DamageResolution {
  nextHp: number;
  nextShield: number;
  physicalToBody: number;
  magicToBody: number;
  magicToShield: number;
  blockedPhysical: number;
  shieldBroken: boolean;
}

export function resolvePlayerDamage(
  enemyHp: number,
  enemyShield: number,
  physicalDamage: number,
  magicDamage: number,
): DamageResolution {
  const physical = Math.max(0, Math.floor(physicalDamage));
  const magic = Math.max(0, Math.floor(magicDamage));

  if (enemyShield > 0) {
    const magicToShield = Math.min(enemyShield, magic);
    const nextShield = enemyShield - magicToShield;
    return {
      nextHp: enemyHp,
      nextShield,
      physicalToBody: 0,
      magicToBody: 0,
      magicToShield,
      blockedPhysical: physical,
      shieldBroken: nextShield === 0,
    };
  }

  const magicToBody = Math.floor(magic * BATTLE_CONFIG.magicBodyMultiplier);
  return {
    nextHp: Math.max(0, enemyHp - physical - magicToBody),
    nextShield: 0,
    physicalToBody: physical,
    magicToBody,
    magicToShield: 0,
    blockedPhysical: 0,
    shieldBroken: false,
  };
}
