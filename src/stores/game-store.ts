"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { simulateBattle } from "@/src/domains/battle/battle-engine";
import type { BattleResult, PlayerStats } from "@/src/domains/battle/battle.types";

interface GameState {
  player: PlayerStats;
  floor: number;
  highestFloor: number;
  result: BattleResult | null;
  running: boolean;
  runId: number;
  updatePlayer: (stats: Partial<PlayerStats>) => void;
  setFloor: (floor: number) => void;
  startBattle: () => void;
  advanceFloor: () => void;
  retry: () => void;
  resetProgress: () => void;
}

const INITIAL_PLAYER: PlayerStats = { attack: 34, maxHp: 180, speed: 24, magicDamage: 18 };

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: INITIAL_PLAYER,
      floor: 1,
      highestFloor: 1,
      result: null,
      running: false,
      runId: 0,
      updatePlayer: (stats) => set((state) => ({ player: { ...state.player, ...stats }, result: null, running: false })),
      setFloor: (floor) => set({ floor: Math.max(1, Math.floor(floor)), result: null, running: false }),
      startBattle: () => {
        const { floor, player } = get();
        set((state) => ({ result: simulateBattle({ floor, player }), running: true, runId: state.runId + 1 }));
      },
      advanceFloor: () => set((state) => {
        if (state.result?.winner !== "player") return state;
        const nextFloor = state.floor + 1;
        return { floor: nextFloor, highestFloor: Math.max(state.highestFloor, nextFloor), result: null, running: false };
      }),
      retry: () => set((state) => ({ result: simulateBattle({ floor: state.floor, player: state.player }), running: true, runId: state.runId + 1 })),
      resetProgress: () => set({ player: INITIAL_PLAYER, floor: 1, highestFloor: 1, result: null, running: false }),
    }),
    {
      name: "kotoba-tower-progress-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ player, floor, highestFloor }) => ({ player, floor, highestFloor }),
    },
  ),
);
