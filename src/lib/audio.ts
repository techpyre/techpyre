"use client";

class OrganicSoundSystem {
  private ctx: AudioContext | null = null;
  private active: boolean = false;
  private subscribers: Set<(active: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.active = localStorage.getItem("tp_audio") === "1";
    }
  }

  public subscribe(cb: (active: boolean) => void) {
    this.subscribers.add(cb);
    cb(this.active);
    return () => this.subscribers.delete(cb);
  }

  private emit() {
    this.subscribers.forEach((fn) => fn(this.active));
    if (typeof window !== "undefined") {
      localStorage.setItem("tp_audio", this.active ? "1" : "0");
    }
  }

  private initCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public async toggle(): Promise<boolean> {
    const ctx = this.initCtx();
    if (ctx && ctx.state === "suspended") {
      await ctx.resume();
    }
    this.active = !this.active;
    this.emit();
    if (this.active) this.playTap();
    return this.active;
  }

  public getStatus(): boolean {
    return this.active;
  }

  /**
   * Micro-tap morbido su frequenze calde
   */
  public playTap() {
    if (!this.active) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Fallback silenzioso
    }
  }

  /**
   * Rintocco armonico caldo
   */
  public playChime() {
    if (!this.active) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Fallback silenzioso
    }
  }

  // Alias retrocompatibili
  public playSoftPop() {
    this.playTap();
  }

  public playHover() {
    this.playTap();
  }
}

export const sound = new OrganicSoundSystem();
export const soundEngine = sound; // Risolve l'errore di importazione in WarmContact
