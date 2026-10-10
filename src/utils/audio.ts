// Synthesized Audio Feedback using Web Audio API (Zero external assets required)
// Restrained, low-volume, non-overlapping audio chimes

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.25; // Default subtle, low volume (25%)
  private activeGains: GainNode[] = [];

  constructor() {
    // Lazily initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Fade out and stop any actively playing sounds so they never stack or collide
  private stopActiveSounds() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const gain of this.activeGains) {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0.0001, now + 0.015);
      } catch {}
    }
    this.activeGains = [];
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleSound(enabled?: boolean) {
    if (enabled !== undefined) {
      this.enabled = enabled;
    } else {
      this.enabled = !this.enabled;
    }
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playSuccess() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      this.stopActiveSounds();

      const now = ctx.currentTime;
      // Gentle, restrained 2-note harmonic chime (523Hz -> 659Hz)
      const notes = [523.25, 659.25];
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      this.activeGains.push(masterGain);

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        const peakGain = 0.07 * this.volume;
        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(peakGain, now + idx * 0.06 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.22);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.22);
      });
    } catch {
      // Audio context might fail silently without blocking UI
    }
  }

  public playError() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      this.stopActiveSounds();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      this.activeGains.push(gain);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(130, now + 0.14);

      const peakGain = 0.05 * this.volume;
      gain.gain.setValueAtTime(peakGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Silently ignore
    }
  }

  public playClick() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      this.stopActiveSounds();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      this.activeGains.push(gain);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.02);

      const peakGain = 0.03 * this.volume;
      gain.gain.setValueAtTime(peakGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // Silently ignore
    }
  }
}

export const sound = new SoundEngine();
