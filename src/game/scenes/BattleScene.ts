import Phaser from "phaser";
import type { BattleEvent, BattleResult } from "@/domains/battle/battle.types";
import { playbackDelay } from "@/game/presenters/battle-event-player";
import { gameAudio } from "@/game/audio/game-audio";
import { impact } from "@/services/haptics/haptics";

export interface BattleSceneData { result: BattleResult; speed: number; reducedMotion: boolean; sound: boolean; haptics: boolean; onComplete: () => void }

export class BattleScene extends Phaser.Scene {
  private dataValue!: BattleSceneData; private player!: Phaser.GameObjects.Container; private enemy!: Phaser.GameObjects.Container;
  private hp!: Phaser.GameObjects.Graphics; private lagHp!: Phaser.GameObjects.Graphics; private enemyHp!: Phaser.GameObjects.Graphics; private lagEnemyHp!: Phaser.GameObjects.Graphics; private shield!: Phaser.GameObjects.Graphics;
  constructor() { super("BattleScene"); }
  init(data: BattleSceneData): void { this.dataValue = data; }
  preload(): void { this.load.image("floor-001", "/assets/art/backgrounds/floor-001-training-tower.png"); }
  create(): void {
    const { width, height } = this.scale; this.cameras.main.setBackgroundColor("#0b1024");
    if (this.dataValue.result.floor <= 99) this.add.image(width / 2, height / 2, "floor-001").setDisplaySize(width, height).setAlpha(.72);
    else { this.add.rectangle(width / 2, height * .78, width, height * .44, 0x151d39).setStrokeStyle(1, 0x7186c8, .18); this.add.circle(width * .5, height * .18, 88, 0x6959aa, .13); }
    this.add.rectangle(width / 2, height / 2, width, height, 0x071020, .18);
    for (let i = 0; i < 18; i += 1) this.add.circle((i * 79) % width, 35 + ((i * 53) % 220), 1.2, 0xc5d2ff, .35);
    this.add.text(width / 2, 18, `${this.dataValue.result.floor}F`, { fontFamily: "system-ui", fontSize: "22px", fontStyle: "bold", color: "#fff0bc" }).setOrigin(.5, 0);
    this.player = this.fighter(width * .24, height * .67, 0xf2b650, false); this.enemy = this.fighter(width * .76, height * .63, 0xf06478, true);
    this.lagHp = this.add.graphics(); this.hp = this.add.graphics(); this.lagEnemyHp = this.add.graphics(); this.enemyHp = this.add.graphics(); this.shield = this.add.graphics(); this.bars(this.dataValue.result.events[0]!);
    if (this.dataValue.result.enemy.maxShield > 0) this.tweens.add({ targets: this.enemy, alpha: { from: .82, to: 1 }, duration: 520, yoyo: true, repeat: -1 });
    void this.play();
  }
  private fighter(x: number, y: number, color: number, enemy: boolean): Phaser.GameObjects.Container {
    const shadow = this.add.ellipse(0, 65, 88, 17, 0x000000, .38); const cape = this.add.triangle(0, 18, -34, 54, 0, -45, 34, 54, color, 1);
    const head = this.add.circle(0, -44, 20, enemy ? 0x9a3f57 : 0xf4d4a7); const eye = this.add.circle(enemy ? -7 : 7, -47, 3, 0xffffff);
    const weapon = this.add.rectangle(enemy ? -34 : 34, 0, 7, 92, enemy ? 0x9bd7ef : 0xf5e3a7).setRotation(enemy ? .55 : -.55);
    return this.add.container(x, y, [shadow, weapon, cape, head, eye]);
  }
  private async play(): Promise<void> {
    for (const event of this.dataValue.result.events.slice(1)) {
      if (event.type === "player-attack") await this.attack(this.player, this.enemy, event, 1);
      else if (event.type === "enemy-attack") await this.attack(this.enemy, this.player, event, -1);
      else if (event.type === "enemy-heal") await this.heal(event);
      else if (event.type === "shield-break") await this.breakShield();
      this.bars(event); await this.wait(playbackDelay(event, this.dataValue.speed, this.dataValue.reducedMotion));
    }
    if (this.dataValue.result.winner === "player") { this.time.timeScale = .45; this.cameras.main.flash(160, 255, 219, 119, false); await this.float(195, 170, "勝利", "#ffe298", 34); this.time.timeScale = 1; this.cameras.main.fade(230, 10, 13, 30); }
    else await this.float(195, 170, this.dataValue.result.winner === "draw" ? "膠着" : "敗北", "#ff8591", 34);
    this.time.delayedCall(260, this.dataValue.onComplete);
  }
  private attack(attacker: Phaser.GameObjects.Container, target: Phaser.GameObjects.Container, event: BattleEvent, direction: number): Promise<void> {
    if (this.dataValue.reducedMotion) { this.damageText(target, event); return Promise.resolve(); }
    return new Promise((resolve) => {
      const origin = attacker.x; this.tweens.chain({ targets: attacker, tweens: [
        { x: origin - direction * 10, scaleX: .94, duration: 70 },
        { x: origin + direction * 92, scaleX: 1.08, duration: 65, ease: "Quad.easeIn", onComplete: () => {
          const ghost = this.add.ellipse(attacker.x - direction * 22, attacker.y, 45, 100, event.actor === "player" ? 0xf2b650 : 0xf06478, .2); this.tweens.add({ targets: ghost, alpha: 0, duration: 120, onComplete: () => ghost.destroy() });
          this.cameras.main.shake(75, .008); this.cameras.main.flash(55, 255, 244, 207, false); this.damageText(target, event);
          if ((event.blockedPhysical ?? 0) > 0) { const wave = this.add.circle(target.x, target.y - 20, 22, 0x55c7f2, .14).setStrokeStyle(3, 0x8de4ff, .9); this.tweens.add({ targets: wave, scale: 2.2, alpha: 0, duration: 190, onComplete: () => wave.destroy() }); }
          if (this.dataValue.sound) { gameAudio.play((event.blockedPhysical ?? 0) > 0 ? "shield-hit" : event.actor === "player" ? "physical-attack" : "heavy-hit"); } void impact(this.dataValue.haptics);
          this.tweens.timeScale = .12; window.setTimeout(() => { if (this.tweens) this.tweens.timeScale = 1; }, 62);
          this.tweens.add({ targets: target, scaleX: 1.18, scaleY: .82, x: target.x + direction * 7, duration: 55, yoyo: true });
        } },
        { x: origin - direction * 7, duration: 95 }, { x: origin, scaleX: 1, duration: 70 }
      ], onComplete: () => resolve() });
    });
  }
  private damageText(target: Phaser.GameObjects.Container, event: BattleEvent): void {
    if (event.type === "player-attack") {
      if ((event.physicalDamage ?? 0) > 0) void this.float(target.x - 18, target.y - 95, `-${event.physicalDamage}`, "#ffd36b", 21 + Math.min(10, (event.physicalDamage ?? 0) / 20));
      if ((event.magicDamage ?? 0) > 0) void this.float(target.x + 18, target.y - 125, `✦${event.magicDamage}`, "#83cfff", 20 + Math.min(10, (event.magicDamage ?? 0) / 20));
      if ((event.blockedPhysical ?? 0) > 0) void this.float(target.x, target.y - 78, "BLOCK", "#80cfff", 14);
    } else void this.float(target.x, target.y - 100, `-${event.amount ?? 0}`, "#ff7883", 25);
  }
  private heal(event: BattleEvent): Promise<void> { if (this.dataValue.sound) gameAudio.play("heal"); this.tweens.add({ targets: this.enemy, tint: 0x66ff99, duration: 130, yoyo: true }); return this.float(this.enemy.x, this.enemy.y - 105, `+${event.amount ?? 0}`, "#70ee9d", 24); }
  private breakShield(): Promise<void> { if (this.dataValue.sound) gameAudio.play("shield-break"); for (let i = 0; i < 12; i += 1) { const p = this.add.rectangle(this.enemy.x, this.enemy.y - 30, 5, 10, 0x71cfff); this.tweens.add({ targets: p, x: p.x + Math.cos(i) * (35 + i * 3), y: p.y + Math.sin(i) * (35 + i * 2), alpha: 0, angle: 120, duration: 360, onComplete: () => p.destroy() }); } return this.float(this.enemy.x, this.enemy.y - 145, "結界破壊", "#79d5ff", 22); }
  private bars(event: BattleEvent): void {
    const draw = (g: Phaser.GameObjects.Graphics, x: number, y: number, ratio: number, color: number, alpha = 1) => { g.clear().fillStyle(0x222a43, .9).fillRoundedRect(x, y, 142, 9, 5).fillStyle(color, alpha).fillRoundedRect(x, y, Math.max(0, 142 * ratio), 9, 5); };
    const p = event.playerHp / this.dataValue.result.events[0]!.playerHp; const e = event.enemyHp / this.dataValue.result.enemy.maxHp;
    draw(this.lagHp, 20, 54, p, 0xffffff, .25); draw(this.hp, 20, 54, p, 0x66d6b1); draw(this.lagEnemyHp, 228, 54, e, 0xffffff, .25); draw(this.enemyHp, 228, 54, e, 0xf06478);
    if (this.dataValue.result.enemy.maxShield > 0) draw(this.shield, 228, 68, event.enemyShield / this.dataValue.result.enemy.maxShield, 0x67c9ff, .85);
  }
  private float(x: number, y: number, value: string, color: string, size: number): Promise<void> { return new Promise((resolve) => { const t = this.add.text(x, y, value, { fontFamily: "system-ui", fontSize: `${size}px`, fontStyle: "bold", color, stroke: "#11152a", strokeThickness: 4 }).setOrigin(.5); this.tweens.add({ targets: t, y: y - 35, scale: 1.12, alpha: 0, duration: 390, onComplete: () => { t.destroy(); resolve(); } }); }); }
  private wait(ms: number): Promise<void> { return new Promise((resolve) => this.time.delayedCall(ms, resolve)); }
}
