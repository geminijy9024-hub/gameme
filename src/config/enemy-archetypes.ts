import type { EnemyArchetype } from "@/domains/battle/battle.types";

interface ArchetypeConfig {
  label: string;
  attack: number;
  hp: number;
  speed: number;
  heals: boolean;
}

export const ARCHETYPE_ORDER: readonly EnemyArchetype[] = [
  "balanced",
  "tank",
  "striker",
  "swift",
  "regenerator",
];

export const ENEMY_ARCHETYPES: Record<EnemyArchetype, ArchetypeConfig> = {
  balanced: { label: "균형의 무사", attack: 1, hp: 1, speed: 1, heals: false },
  tank: { label: "철벽 오니", attack: 0.76, hp: 1.72, speed: 0.76, heals: false },
  striker: { label: "붉은 칼날", attack: 1.58, hp: 0.72, speed: 0.92, heals: false },
  swift: { label: "질풍 텐구", attack: 0.88, hp: 0.82, speed: 1.62, heals: false },
  regenerator: { label: "재생의 요괴", attack: 0.72, hp: 1.16, speed: 0.84, heals: true },
};
