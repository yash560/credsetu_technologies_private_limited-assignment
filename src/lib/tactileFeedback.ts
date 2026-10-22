/**
 * Tactile Feedback Engine
 * Hardware Haptics (navigator.vibrate) & AudioContext Synthetic Ticks
 * 100% Client-Safe, Zero external audio files, Graceful desktop no-op
 */

class TactileFeedbackEngine {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.audioCtx = new AudioContextClass();
        } catch (_) {}
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /** Standard light micro-click for buttons, tabs, pills (10ms) */
  public tap(): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (_) {}
    }
    this.playSyntheticTick(800, 400, 0.008, 0.03);
  }

  /** Subtle tick for chips, sliders, view switches (5ms) */
  public subtle(): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(5);
      } catch (_) {}
    }
    this.playSyntheticTick(1200, 600, 0.005, 0.02);
  }

  /** Success chord burst for loan creation, repayments, OTP verification */
  public success(): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([12, 40, 15]);
      } catch (_) {}
    }
    this.playSyntheticChord([523.25, 659.25, 783.99]); // C5, E5, G5 triad
  }

  /** Warning or error buzz for deletions, failed validation */
  public warning(): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 40, 30]);
      } catch (_) {}
    }
    this.playSyntheticTick(240, 120, 0.03, 0.06);
  }

  private playSyntheticTick(
    startFreq: number,
    endFreq: number,
    duration: number,
    gainVal: number
  ): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }

  private playSyntheticChord(frequencies: number[]): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + idx * 0.04;
        const dur = 0.18;
        gain.gain.setValueAtTime(0.04, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    } catch (_) {}
  }
}

export const tactile = new TactileFeedbackEngine();
