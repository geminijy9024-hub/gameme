import type { PlayerStats } from "@/domains/battle/battle.types";

export type StudyArea = "language" | "reading" | "listening" | "conversation";
export type LearningProgress = Record<StudyArea, number>;

export const STUDY_AREAS = [
  { id: "language", glyph: "言", ja: "言語知識", ko: "언어지식", stat: "일반 공격력", color: "#ffba55" },
  { id: "reading", glyph: "読", ja: "読解", ko: "독해", stat: "최대 체력", color: "#f06f77" },
  { id: "listening", glyph: "聴", ja: "聴解", ko: "청해", stat: "속도 · 선공권", color: "#65d4d0" },
  { id: "conversation", glyph: "話", ja: "会話", ko: "회화", stat: "마법 피해", color: "#9d8cff" },
] as const;

export const INITIAL_PLAYER: PlayerStats = { attack: 34, maxHp: 180, speed: 24, magicDamage: 18 };
export const INITIAL_PROGRESS: LearningProgress = { language: 0, reading: 0, listening: 0, conversation: 0 };

export function applyStudy(player: PlayerStats, area: StudyArea, xp: number): PlayerStats {
  const gain = Math.max(1, Math.floor(xp / 10));
  if (area === "language") return { ...player, attack: player.attack + gain };
  if (area === "reading") return { ...player, maxHp: player.maxHp + gain * 5 };
  if (area === "listening") return { ...player, speed: player.speed + gain };
  return { ...player, magicDamage: player.magicDamage + gain };
}
