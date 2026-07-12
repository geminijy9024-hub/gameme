import { BATTLE_CONFIG } from "@/src/config/battle.config";
import { resolvePlayerDamage } from "./damage-calculator";
import { analyzeDefeat } from "./defeat-analyzer";
import { generateEnemy } from "./enemy-generator";
import type { BattleEvent, BattleInput, BattleResult, BattleStats } from "./battle.types";

export function simulateBattle(input: BattleInput): BattleResult {
  const floor = Math.max(1, Math.floor(input.floor));
  const enemy = input.enemy ?? generateEnemy(floor);
  let playerHp = Math.max(1, Math.floor(input.player.maxHp));
  let enemyHp = enemy.maxHp;
  let shield = enemy.maxShield;
  const playerFirst = input.player.speed >= enemy.speed;
  const stats: BattleStats = {
    playerAttacks: 0,
    enemyAttacks: 0,
    playerWentFirst: playerFirst,
    totalPhysicalDamage: 0,
    totalMagicDamage: 0,
    totalDamageTaken: 0,
    shieldBreakTurn: null,
    enemyHealing: 0,
  };
  const events: BattleEvent[] = [{
    turn: 0,
    type: "battle-start",
    actor: "system",
    playerHp,
    enemyHp,
    enemyShield: shield,
    message: `${playerFirst ? "플레이어" : enemy.name} 선공`,
  }];
  let enemyActions = 0;

  const playerAttack = (turn: number): void => {
    stats.playerAttacks += 1;
    const damage = resolvePlayerDamage(enemyHp, shield, input.player.attack, input.player.magicDamage);
    enemyHp = damage.nextHp;
    shield = damage.nextShield;
    stats.totalPhysicalDamage += damage.physicalToBody;
    stats.totalMagicDamage += damage.magicToBody + damage.magicToShield;
    events.push({
      turn,
      type: "player-attack",
      actor: "player",
      playerHp,
      enemyHp,
      enemyShield: shield,
      physicalDamage: damage.physicalToBody,
      magicDamage: damage.magicToBody + damage.magicToShield,
      blockedPhysical: damage.blockedPhysical,
      message: damage.blockedPhysical > 0
        ? `마법 ${damage.magicToShield} · 일반 ${damage.blockedPhysical} 차단`
        : `일반 ${damage.physicalToBody} · 마법 ${damage.magicToBody}`,
    });
    if (damage.shieldBroken && stats.shieldBreakTurn === null) {
      stats.shieldBreakTurn = turn;
      events.push({ turn, type: "shield-break", actor: "system", playerHp, enemyHp, enemyShield: shield, message: "마법 쉴드 파괴" });
    }
  };

  const enemyAttack = (turn: number): void => {
    enemyActions += 1;
    stats.enemyAttacks += 1;
    playerHp = Math.max(0, playerHp - enemy.attack);
    stats.totalDamageTaken += enemy.attack;
    events.push({ turn, type: "enemy-attack", actor: "enemy", playerHp, enemyHp, enemyShield: shield, amount: enemy.attack, message: `피해 ${enemy.attack}` });
    if (playerHp > 0 && enemy.healEvery > 0 && enemyActions % enemy.healEvery === 0) {
      const healed = Math.min(enemy.healAmount, enemy.maxHp - enemyHp);
      enemyHp += healed;
      stats.enemyHealing += healed;
      events.push({ turn, type: "enemy-heal", actor: "enemy", playerHp, enemyHp, enemyShield: shield, amount: healed, message: `체력 ${healed} 회복` });
    }
  };

  for (let turn = 1; turn <= BATTLE_CONFIG.maxTurns; turn += 1) {
    if (playerFirst) {
      playerAttack(turn);
      if (enemyHp <= 0) return finish("player", "knockout", turn);
      enemyAttack(turn);
      if (playerHp <= 0) return finish("enemy", "knockout", turn);
    } else {
      enemyAttack(turn);
      if (playerHp <= 0) return finish("enemy", "knockout", turn);
      playerAttack(turn);
      if (enemyHp <= 0) return finish("player", "knockout", turn);
    }
  }
  return finish("draw", "turn-limit", BATTLE_CONFIG.maxTurns);

  function finish(winner: BattleResult["winner"], reason: BattleResult["reason"], turns: number): BattleResult {
    events.push({ turn: turns, type: "battle-end", actor: "system", playerHp, enemyHp, enemyShield: shield, message: winner === "player" ? "승리" : winner === "enemy" ? "패배" : "턴 제한" });
    const isFailure = winner !== "player";
    return {
      winner,
      reason,
      floor,
      turns,
      finalPlayerHp: playerHp,
      finalEnemyHp: enemyHp,
      finalEnemyShield: shield,
      enemy,
      stats,
      events,
      analysis: isFailure ? analyzeDefeat(input.player, enemy, stats, enemyHp, shield) : null,
    };
  }
}
