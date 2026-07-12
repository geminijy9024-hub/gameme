import { describe, expect, it } from "vitest";
import { INITIAL_PLAYER, INITIAL_PROGRESS } from "../../src/domains/learning/learning";
import { loadGame, saveGame } from "../../src/services/storage/game-save";
import type { StorageAdapter } from "../../src/services/storage/storage-adapter";

class MemoryStorage implements StorageAdapter {
  values = new Map<string, string>();
  async get(key: string) { return this.values.get(key) ?? null; }
  async set(key: string, value: string) { this.values.set(key, value); }
  async remove(key: string) { this.values.delete(key); }
}

describe("progress storage", () => {
  it("저장한 진행도를 검증해 복원한다", async () => {
    const adapter = new MemoryStorage();
    const progress = { player: INITIAL_PLAYER, floor: 1000, highestFloor: 1000, winStreak: 7, learning: INITIAL_PROGRESS, settings: { music: true, sound: true, haptics: true, reducedMotion: false, battleSpeed: 1 as const }, lastResult: null };
    await saveGame(adapter, "save", progress);
    await expect(loadGame(adapter, "save")).resolves.toEqual(progress);
  });

  it("잘못된 저장 데이터는 안전하게 거부한다", async () => {
    const adapter = new MemoryStorage(); adapter.values.set("broken", JSON.stringify({ floor: -10, player: "invalid" }));
    await expect(loadGame(adapter, "broken")).resolves.toBeNull();
  });
});
