import { create } from "zustand";
import { simulateBattle } from "@/domains/battle/battle-engine";
import type { BattleResult, PlayerStats } from "@/domains/battle/battle.types";
import { applyStudy, INITIAL_PLAYER, INITIAL_PROGRESS, type LearningProgress, type StudyArea } from "@/domains/learning/learning";
import { storage } from "@/services/storage";
import { loadGame, saveGame } from "@/services/storage/game-save";

export type Route = "tower" | "study" | "growth" | "settings" | "debug";
export interface GameSettings { music: boolean; sound: boolean; haptics: boolean; reducedMotion: boolean }
const INITIAL_SETTINGS: GameSettings = { music: true, sound: true, haptics: true, reducedMotion: false };
const STORAGE_KEY = "kotoba-tower-progress-v2";

interface GameState {
  hydrated: boolean; started: boolean; route: Route; player: PlayerStats; floor: number; highestFloor: number; winStreak: number;
  learning: LearningProgress; settings: GameSettings; result: BattleResult | null; runId: number; battling: boolean;
  hydrate: () => Promise<void>; begin: () => void; navigate: (route: Route) => void; startBattle: () => void; finishPlayback: () => void;
  study: (area: StudyArea, xp: number) => void; setFloor: (floor: number) => void; toggleSetting: (key: keyof GameSettings) => void; reset: () => Promise<void>;
}

function snapshot(state: GameState) {
  return { player: state.player, floor: state.floor, highestFloor: state.highestFloor, winStreak: state.winStreak, learning: state.learning, settings: state.settings, lastResult: state.result };
}
async function save(state: GameState): Promise<void> { await saveGame(storage, STORAGE_KEY, snapshot(state)); }

export const useGameStore = create<GameState>((set, get) => ({
  hydrated: false, started: false, route: "tower", player: INITIAL_PLAYER, floor: 1, highestFloor: 1, winStreak: 0,
  learning: INITIAL_PROGRESS, settings: INITIAL_SETTINGS, result: null, runId: 0, battling: false,
  hydrate: async () => {
    try {
      const parsed = await loadGame(storage, STORAGE_KEY);
      if (parsed) { const { lastResult, ...progress } = parsed; set({ ...progress, result: lastResult as BattleResult | null, hydrated: true }); }
      else set({ hydrated: true });
    } catch { set({ hydrated: true }); }
  },
  begin: () => set({ started: true, route: "tower" }),
  navigate: (route) => set({ route }),
  startBattle: () => {
    const state = get(); if (state.battling || state.result?.winner !== undefined) return;
    set({ result: simulateBattle({ floor: state.floor, player: state.player }), battling: true, runId: state.runId + 1 });
  },
  finishPlayback: () => {
    const state = get(); const result = state.result; if (!result) return;
    if (result.winner === "player") {
      const floor = result.progression.floor; set({ floor, highestFloor: Math.max(state.highestFloor, floor), winStreak: state.winStreak + 1, result: null, battling: false });
    } else set({ battling: false, winStreak: 0 });
    void save(get());
  },
  study: (area, xp) => {
    const state = get(); set({ player: applyStudy(state.player, area, xp), learning: { ...state.learning, [area]: state.learning[area] + xp }, result: null, battling: false, route: "tower" }); void save(get());
  },
  setFloor: (value) => { const floor = Math.max(1, Math.floor(value)); set({ floor, highestFloor: Math.max(get().highestFloor, floor), result: null, battling: false }); void save(get()); },
  toggleSetting: (key) => { set((state) => ({ settings: { ...state.settings, [key]: !state.settings[key] } })); void save(get()); },
  reset: async () => { await storage.remove(STORAGE_KEY); set({ player: INITIAL_PLAYER, floor: 1, highestFloor: 1, winStreak: 0, learning: INITIAL_PROGRESS, settings: INITIAL_SETTINGS, result: null, battling: false, route: "tower" }); }
}));

export { STORAGE_KEY };
