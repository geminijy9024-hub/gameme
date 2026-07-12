import Phaser from "phaser";
import type { BattleEvent, BattleResult } from "@/src/domains/battle/battle.types";

export class BattleScene extends Phaser.Scene {
  private result!: BattleResult;
  private player!: Phaser.GameObjects.Container;
  private enemy!: Phaser.GameObjects.Container;
  private playerBar!: Phaser.GameObjects.Graphics;
  private enemyBar!: Phaser.GameObjects.Graphics;
  private shieldBar!: Phaser.GameObjects.Graphics;
  private floorText!: Phaser.GameObjects.Text;

  constructor() {
    super("BattleScene");
  }

  init(data: { result: BattleResult }): void {
    this.result = data.result;
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0d1117");
    this.add.rectangle(width / 2, height * 0.75, width, height * 0.5, 0x151b23);
    for (let index = 0; index < 24; index += 1) {
      this.add.circle((index * 83) % width, 40 + ((index * 47) % 180), 1.5, 0xe8d9a7, 0.45);
    }
    this.floorText = this.add.text(width / 2, 24, `${this.result.floor} 階`, {
      fontFamily: "Georgia, serif", fontSize: "24px", color: "#e8d9a7", letterSpacing: 4,
    }).setOrigin(0.5, 0);
    this.add.text(28, 24, "学徒", { fontFamily: "sans-serif", fontSize: "13px", color: "#89939f" });
    this.add.text(width - 28, 24, this.result.enemy.name, { fontFamily: "sans-serif", fontSize: "13px", color: "#89939f" }).setOrigin(1, 0);

    this.player = this.createFighter(width * 0.25, height * 0.59, 0xd4a855, false);
    this.enemy = this.createFighter(width * 0.75, height * 0.55, 0xb9504a, true);
    this.playerBar = this.add.graphics();
    this.enemyBar = this.add.graphics();
    this.shieldBar = this.add.graphics();
    this.drawBars(this.result.events[0]);
    void this.playEvents();
  }

  private createFighter(x: number, y: number, color: number, horned: boolean): Phaser.GameObjects.Container {
    const shadow = this.add.ellipse(0, 72, 92, 18, 0x000000, 0.4);
    const body = this.add.polygon(0, 20, [-34, 58, -24, -24, 0, -54, 24, -24, 34, 58], color, 1);
    const head = this.add.circle(0, -58, 21, 0xe5c5a2);
    const blade = this.add.rectangle(horned ? -36 : 36, 5, 6, 96, 0xc9d0d4).setRotation(horned ? 0.55 : -0.55);
    const parts: Phaser.GameObjects.GameObject[] = [shadow, blade, body, head];
    if (horned) {
      parts.push(this.add.triangle(-12, -80, 0, 14, 8, 0, 16, 14, 0xd8b35f));
      parts.push(this.add.triangle(12, -80, 0, 14, 8, 0, 16, 14, 0xd8b35f));
    }
    return this.add.container(x, y, parts);
  }

  private async playEvents(): Promise<void> {
    for (const event of this.result.events.slice(1)) {
      if (event.type === "player-attack") await this.animateAttack(this.player, this.enemy, event, 1);
      if (event.type === "enemy-attack") await this.animateAttack(this.enemy, this.player, event, -1);
      if (event.type === "enemy-heal") await this.floatText(this.enemy.x, this.enemy.y - 95, `+${event.amount ?? 0}`, "#66d38a");
      if (event.type === "shield-break") {
        this.cameras.main.flash(180, 86, 172, 214, false);
        await this.floatText(this.enemy.x, this.enemy.y - 120, "結界破壊", "#76c8ff");
      }
      this.drawBars(event);
      await this.delay(165);
    }
    this.floorText.setText(this.result.winner === "player" ? "勝利" : this.result.winner === "enemy" ? "敗北" : "膠着");
  }

  private animateAttack(attacker: Phaser.GameObjects.Container, target: Phaser.GameObjects.Container, event: BattleEvent, direction: number): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: attacker,
        x: attacker.x + 42 * direction,
        duration: 100,
        yoyo: true,
        onYoyo: () => {
          this.cameras.main.shake(80, 0.005);
          const amount = event.type === "player-attack"
            ? (event.physicalDamage ?? 0) + (event.magicDamage ?? 0)
            : event.amount ?? 0;
          void this.floatText(target.x, target.y - 95, `-${amount}`, event.blockedPhysical ? "#76c8ff" : "#f2dfb0");
        },
        onComplete: () => resolve(),
      });
    });
  }

  private floatText(x: number, y: number, value: string, color: string): Promise<void> {
    return new Promise((resolve) => {
      const text = this.add.text(x, y, value, { fontFamily: "sans-serif", fontSize: "22px", fontStyle: "bold", color }).setOrigin(0.5);
      this.tweens.add({ targets: text, y: y - 34, alpha: 0, duration: 420, onComplete: () => { text.destroy(); resolve(); } });
    });
  }

  private drawBars(event: BattleEvent): void {
    const width = this.scale.width;
    const draw = (graphics: Phaser.GameObjects.Graphics, x: number, y: number, ratio: number, color: number, barWidth: number): void => {
      graphics.clear();
      graphics.fillStyle(0x222a35, 1).fillRoundedRect(x, y, barWidth, 8, 4);
      graphics.fillStyle(color, 1).fillRoundedRect(x, y, Math.max(0, barWidth * ratio), 8, 4);
    };
    draw(this.playerBar, 28, 50, event.playerHp / this.result.events[0].playerHp, 0xd4a855, 180);
    draw(this.enemyBar, width - 208, 50, event.enemyHp / this.result.enemy.maxHp, 0xb9504a, 180);
    if (this.result.enemy.maxShield > 0) draw(this.shieldBar, width - 208, 62, event.enemyShield / this.result.enemy.maxShield, 0x55a9d9, 180);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, resolve));
  }
}
