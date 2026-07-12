import { z } from "zod";

export const persistedGameSchema = z.object({
  player: z.object({ attack: z.number().int().positive(), maxHp: z.number().int().positive(), speed: z.number().int().positive(), magicDamage: z.number().int().nonnegative() }),
  floor: z.number().int().positive(), highestFloor: z.number().int().positive(), winStreak: z.number().int().nonnegative(),
  learning: z.object({ language: z.number().nonnegative(), reading: z.number().nonnegative(), listening: z.number().nonnegative(), conversation: z.number().nonnegative() }),
  settings: z.object({ music: z.boolean(), sound: z.boolean(), haptics: z.boolean(), reducedMotion: z.boolean() }),
  lastResult: z.unknown().nullable()
});

export type PersistedGame = z.infer<typeof persistedGameSchema>;
