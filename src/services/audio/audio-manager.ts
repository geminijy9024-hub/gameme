export type AudioCue = "physical-attack" | "magic-attack" | "hit" | "heavy-hit" | "shield-hit" | "shield-break" | "heal" | "victory" | "defeat" | "floor-up" | "button" | "correct" | "incorrect" | "stat-up";

const FREQUENCIES: Record<AudioCue, number> = {
  "physical-attack": 145, "magic-attack": 520, hit: 105, "heavy-hit": 72, "shield-hit": 680, "shield-break": 840,
  heal: 440, victory: 660, defeat: 90, "floor-up": 590, button: 260, correct: 720, incorrect: 120, "stat-up": 780
};

class AudioManager {
  private context: AudioContext | null = null; private enabled = false;
  unlock(): void { this.enabled = true; this.context ??= new AudioContext(); void this.context.resume(); }
  play(cue: AudioCue): void {
    if (!this.enabled || !this.context) return;
    const now = this.context.currentTime; const oscillator = this.context.createOscillator(); const gain = this.context.createGain();
    oscillator.type = cue.includes("magic") || cue.includes("shield") ? "sine" : "triangle"; oscillator.frequency.setValueAtTime(FREQUENCIES[cue], now);
    if (cue === "physical-attack" || cue === "heavy-hit") oscillator.frequency.exponentialRampToValueAtTime(Math.max(45, FREQUENCIES[cue] * .45), now + .09);
    gain.gain.setValueAtTime(.045, now); gain.gain.exponentialRampToValueAtTime(.001, now + .11); oscillator.connect(gain).connect(this.context.destination); oscillator.start(now); oscillator.stop(now + .12);
  }
  hit(frequency = 150): void { this.play(frequency > 150 ? "magic-attack" : "hit"); }
}
export const audioManager = new AudioManager();
