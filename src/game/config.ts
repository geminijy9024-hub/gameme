import Phaser from "phaser";
import { BattleScene, type BattleSceneData } from "./scenes/BattleScene";

export function createBattleGame(parent: HTMLElement, data: BattleSceneData): Phaser.Game {
  const game = new Phaser.Game({ type: Phaser.AUTO, parent, width: 390, height: 500, transparent: true, scene: [BattleScene], render: { antialias: true, pixelArt: false }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH } });
  game.scene.start("BattleScene", data); return game;
}
