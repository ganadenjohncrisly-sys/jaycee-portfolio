// Synthesized UI sounds (Web Audio) — no audio files needed.
type Listener = (on: boolean) => void;

class SoundEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  ambient: { stop: () => void } | null = null;
  enabled = false;
  listeners = new Set<Listener>();
  lastHover = 0;

  init() {
    if (this.ctx || typeof window === "undefined") return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
  }
  subscribe(l: Listener) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
  setEnabled(on: boolean) {
    this.init();
    this.enabled = on;
    if (on) { void this.ctx?.resume(); this.startAmbient(); } else { this.stopAmbient(); }
    this.listeners.forEach((l) => l(on));
  }
  toggle() { this.setEnabled(!this.enabled); }

  private tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.15, slideTo?: number, delay = 0) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  private noise(dur: number, vol = 0.2, filterFreq = 2000, type: BiquadFilterType = "bandpass", delay = 0, sweepTo?: number) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.setValueAtTime(filterFreq, t); f.Q.value = 1.2;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
  }

  hover() { const n = performance.now(); if (n - this.lastHover < 60) return; this.lastHover = n; this.tone(1800, 0.05, "sine", 0.04); }
  click() { this.tone(900, 0.08, "triangle", 0.1, 500); this.noise(0.03, 0.08, 4000, "highpass"); }
  shutter() {
    this.noise(0.04, 0.35, 3000, "highpass");
    this.tone(160, 0.08, "square", 0.05, 70);
    this.noise(0.06, 0.25, 2200, "bandpass", 0.09);
    this.tone(120, 0.06, "square", 0.04, 60, 0.09);
  }
  whoosh() { this.noise(0.6, 0.12, 300, "bandpass", 0, 3500); }
  tick() { this.tone(2600, 0.02, "square", 0.025); }
  chime() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 1.1, "sine", 0.07, undefined, i * 0.08)); }
  boot() { this.tone(80, 1.2, "sawtooth", 0.06, 220); this.whoosh(); setTimeout(() => this.chime(), 500); }

  startAmbient() {
    if (!this.ctx || !this.master || this.ambient) return;
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 3);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 700;
    const lfo = ctx.createOscillator(); const lfoG = ctx.createGain();
    lfo.frequency.value = 0.07; lfoG.gain.value = 350;
    lfo.connect(lfoG).connect(filter.frequency); lfo.start();
    const oscs = [110, 164.81, 220.5, 277.18].map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 ? "triangle" : "sine";
      o.frequency.value = f; o.detune.value = (i - 1.5) * 6;
      o.connect(filter); o.start(); return o;
    });
    filter.connect(g).connect(this.master);
    this.ambient = {
      stop: () => {
        const t = ctx.currentTime;
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        setTimeout(() => { oscs.forEach((o) => o.stop()); lfo.stop(); }, 900);
      },
    };
  }
  stopAmbient() { this.ambient?.stop(); this.ambient = null; }
}

export const sound = new SoundEngine();
