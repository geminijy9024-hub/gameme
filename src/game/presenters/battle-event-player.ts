import type { BattleEvent } from "@/domains/battle/battle.types";

export function playbackDelay(event: BattleEvent, speed: number, reducedMotion: boolean): number {
  if (reducedMotion) return 30;
  const base = event.type === "player-attack" || event.type === "enemy-attack" ? 360 : 210;
  return Math.round(base / Math.max(1, speed));
}
