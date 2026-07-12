import { useEffect, useRef } from "react";
import type { BattleResult } from "@/domains/battle/battle.types";

export function BattleCanvas({ result, runId, speed, reducedMotion, sound, haptics, onComplete }: { result: BattleResult; runId: number; speed: number; reducedMotion: boolean; sound: boolean; haptics: boolean; onComplete: () => void }) {
  const ref = useRef<HTMLDivElement>(null); const completeRef = useRef(onComplete);
  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);
  useEffect(() => { let game: import("phaser").Game | undefined; let disposed = false; void import("@/game/config").then(({ createBattleGame }) => { if (!disposed && ref.current) game = createBattleGame(ref.current, { result, speed, reducedMotion, sound, haptics, onComplete: () => completeRef.current() }); }); return () => { disposed = true; game?.destroy(true); }; }, [result, runId, speed, reducedMotion, sound, haptics]);
  return <div className="battle-canvas" ref={ref} aria-label="자동 전투 애니메이션" />;
}
