"use client";

import { useEffect, useRef } from "react";
import type { BattleResult } from "@/src/domains/battle/battle.types";

export function BattleCanvas({ result, runId }: { result: BattleResult; runId: number }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    let disposed = false;
    let game: import("phaser").Game | null = null;
    void import("@/src/game/phaser/config").then(({ createBattleGame }) => {
      if (!disposed && hostRef.current) game = createBattleGame(hostRef.current, result);
    });
    return () => { disposed = true; game?.destroy(true); };
  }, [result, runId]);

  return <div ref={hostRef} className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#0d1117]" aria-label="자동 전투 애니메이션" />;
}
