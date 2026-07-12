class AudioManager {
  private context: AudioContext | null = null;
  private enabled = false;
  unlock(): void { this.enabled = true; this.context ??= new AudioContext(); void this.context.resume(); }
  hit(frequency = 150): void {
    if (!this.enabled || !this.context) return;
    const oscillator = this.context.createOscillator(); const gain = this.context.createGain();
    oscillator.frequency.value = frequency; gain.gain.setValueAtTime(0.05, this.context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.08);
    oscillator.connect(gain).connect(this.context.destination); oscillator.start(); oscillator.stop(this.context.currentTime + 0.08);
  }
}
export const audioManager = new AudioManager();
