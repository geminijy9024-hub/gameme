import { persistedGameSchema, type PersistedGame } from "@/schemas/game-state";
import type { StorageAdapter } from "./storage-adapter";

export async function saveGame(adapter: StorageAdapter, key: string, value: PersistedGame): Promise<void> { await adapter.set(key, JSON.stringify(value)); }
export async function loadGame(adapter: StorageAdapter, key: string): Promise<PersistedGame | null> {
  const raw = await adapter.get(key); if (!raw) return null;
  try { const parsed = persistedGameSchema.safeParse(JSON.parse(raw)); return parsed.success ? parsed.data : null; } catch { return null; }
}
