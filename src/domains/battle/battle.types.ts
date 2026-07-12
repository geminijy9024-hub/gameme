export type EnemyArchetype = "balanced" | "tank" | "striker" | "swift" | "regenerator";

export interface PlayerStats {
  attack: number;
  maxHp: number;
  speed: number;
  magicDamage: number;
}

export interface EnemyStats {
  archetype: EnemyArchetype;
  name: string;
  attack: number;
  maxHp: number;
  speed: number;
  maxShield: number;
  healEvery: number;
  healAmount: number;
}

export interface BattleInput {
  floor: number;
  player: PlayerStats;
  enemy?: EnemyStats;
}

export type BattleEventType =
  | "battle-start"
  | "player-attack"
  | "enemy-attack"
  | "enemy-heal"
  | "shield-break"
  | "battle-end";

export interface BattleEvent {
  turn: number;
  type: BattleEventType;
  actor: "player" | "enemy" | "system";
  playerHp: number;
  enemyHp: number;
  enemyShield: number;
  physicalDamage?: number;
  magicDamage?: number;
  blockedPhysical?: number;
  amount?: number;
  message: string;
}

export interface BattleStats {
  playerAttacks: number;
  enemyAttacks: number;
  playerWentFirst: boolean;
  totalPhysicalDamage: number;
  totalMagicDamage: number;
  totalDamageTaken: number;
  shieldBreakTurn: number | null;
  enemyHealing: number;
}

export interface DefeatAnalysis extends BattleStats {
  remainingEnemyHp: number;
  remainingEnemyShield: number;
  suggestions: string[];
}

export interface BattleResult {
  winner: "player" | "enemy" | "draw";
  reason: "knockout" | "turn-limit";
  floor: number;
  turns: number;
  finalPlayerHp: number;
  finalEnemyHp: number;
  finalEnemyShield: number;
  enemy: EnemyStats;
  stats: BattleStats;
  events: BattleEvent[];
  analysis: DefeatAnalysis | null;
  progression: { floor: number; stopped: boolean };
}
