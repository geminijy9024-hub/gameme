import Phaser from "phaser";
import { BattleScene } from "./BattleScene";
import type { BattleResult } from "@/src/domains/battle/battle.types";

export function createBattleGame(parent: HTMLElement, result: BattleResult): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 760,
    height: 430,
    transparent: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    banner: false,
    callbacks: { postBoot: (game) => game.scene.add("BattleScene", BattleScene, true, { result }) },
  });
}
