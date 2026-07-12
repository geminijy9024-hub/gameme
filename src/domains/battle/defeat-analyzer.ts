import type { BattleStats, DefeatAnalysis, EnemyStats, PlayerStats } from "./battle.types";

export function analyzeDefeat(
  player: PlayerStats,
  enemy: EnemyStats,
  stats: BattleStats,
  remainingEnemyHp: number,
  remainingEnemyShield: number,
): DefeatAnalysis {
  const suggestions: string[] = [];
  if (!stats.playerWentFirst) {
    suggestions.push(`청해를 높여 속도 ${enemy.speed + 1} 이상이 되면 선공해 적의 공격 횟수를 줄일 수 있습니다.`);
  }
  suggestions.push(`독해를 높여 최대 체력을 ${player.maxHp + enemy.attack} 이상으로 만들면 현재 피해를 한 번 더 버틸 수 있습니다.`);
  if (remainingEnemyShield > 0 || stats.shieldBreakTurn !== null) {
    suggestions.push("회화를 높이면 마법 쉴드를 더 빨리 파괴하고 전체 전투 시간을 줄일 수 있습니다.");
  }
  if (remainingEnemyHp > 0) {
    suggestions.push("언어지식을 높이면 쉴드 파괴 후 본체 처치에 필요한 공격 횟수를 줄일 수 있습니다.");
  }
  return { ...stats, remainingEnemyHp, remainingEnemyShield, suggestions };
}
