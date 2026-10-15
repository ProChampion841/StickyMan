import type { MoveName } from '../combat/Fighter';
import { TUNING } from '../config';

/** Whoosh shape per move: filter sweep start and end (Hz), length (s), loudness. */
const SWINGS: Record<MoveName, readonly [number, number, number, number]> = {
  palmStrike: [550, 2000, 0.08, 0.12],
  elbowSmash: [420, 1500, 0.11, 0.17],
  risingDragon: [260, 3000, 0.3, 0.24],
  snapKick: [320, 1300, 0.12, 0.17],
  spinKick: [220, 1400, 0.24, 0.22],
  tornadoKick: [180, 1800, 0.34, 0.26],
  legSweep: [160, 700, 0.24, 0.22],
  dashStrike: [600, 2600, 0.14, 0.2],
  flyingKnee: [300, 1600, 0.2, 0.22],
  airChop: [500, 1800, 0.12, 0.16],
  diveKick: [1600, 300, 0.3, 0.24],
  meteorStomp: [1400, 160, 0.36, 0.26],
  shuriken: [3000, 5200, 0.1, 0.12],
  smokeVanish: [400, 1200, 0.2, 0.1],
};

/**
 * Procedural sound effects through Web Audio, so there are no audio files to download.
 * Every sound gets a little random pitch so repeated hits don't sound identical.
 */
export class Sfx {
  /** Silences everything, e.g. for the computer-vs-computer fight behind the title screen. */
  muted = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  /** The looping pencil scratch while someone draws, and its volume. */
  private scratch: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

  /** Browsers only start audio after a user gesture, so call this from input handlers. */
  unlock(): void {
    if (!this.ctx) {
      if (typeof AudioContext === 'undefined') return;
      const ctx = new AudioContext();
      this.master = ctx.createGain();
      this.master.connect(ctx.destination);
      this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.ctx = ctx;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /** Air whoosh as a strike extends: quick and bright for jabs, long and low for kicks, rising for launchers, falling for dives. */
  swing(move: MoveName): void {
    const [fromHz, toHz, seconds, peak] = SWINGS[move];
    this.noiseBurst('bandpass', fromHz * jitter(), seconds, peak, toHz * jitter());
  }

  /**
   * Layered impact: a low thump for weight plus a high crack for sharpness, and a deep boom
   * under heavy hits. `strength` is 0..1.
   */
  hit(strength: number, head: boolean, heavy = false): void {
    const pitch = jitter();
    this.tone('sine', 150 * pitch, 45, 0.14, 0.5 + 0.5 * strength);
    this.noiseBurst('highpass', (head ? 2600 : 1700) * pitch, 0.05, 0.25 + 0.35 * strength);
    if (heavy) this.tone('sine', 80 * pitch, 32, 0.32, 0.7);
  }

  /** Ground-shaking boom of a stomp landing. */
  stomp(): void {
    this.tone('sine', 110 * jitter(), 30, 0.4, 0.9);
    this.noiseBurst('lowpass', 900, 0.35, 0.5, 90);
  }

  /** Short airy rush for a dash, a double jump or a wall kick. */
  motion(kind: 'dash' | 'jump' | 'doubleJump' | 'wallJump'): void {
    if (kind === 'dash') this.noiseBurst('bandpass', 900 * jitter(), 0.14, 0.16, 2400);
    else if (kind === 'jump') this.noiseBurst('bandpass', 500 * jitter(), 0.1, 0.06, 1100);
    else this.noiseBurst('bandpass', 700 * jitter(), 0.2, 0.13, 2600);
    if (kind === 'wallJump') this.tone('sine', 220 * jitter(), 120, 0.08, 0.35);
  }

  /** Metallic "shing" of a throwing star leaving the hand. */
  throwStar(): void {
    this.tone('triangle', 2400 * jitter(), 3400, 0.12, 0.12);
    this.noiseBurst('highpass', 5000, 0.1, 0.12);
  }

  /** A star biting into the scenery: a tiny metallic tink. */
  tink(): void {
    this.tone('square', 3100 * jitter(), 2900, 0.06, 0.05);
    this.tone('sine', 4700 * jitter(), 4500, 0.1, 0.06);
  }

  /** Smoke bomb pop for the vanish, with a softer one where the ninja reappears. */
  poof(): void {
    this.noiseBurst('lowpass', 1800 * jitter(), 0.3, 0.4, 200);
    this.tone('sine', 300 * jitter(), 70, 0.15, 0.4);
    this.noiseBurst('lowpass', 1400, 0.25, 0.25, 200);
  }

  /** Pencil scratching on paper while a stroke is drawn; call with false when it ends. */
  scribble(on: boolean): void {
    if (!on) {
      const scratch = this.scratch;
      this.scratch = null;
      if (scratch && this.ctx) {
        scratch.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.03);
        scratch.src.stop(this.ctx.currentTime + 0.15);
      }
      return;
    }
    const s = this.start();
    if (!s || !this.noise || this.scratch) return;
    const src = s.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = s.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3200;
    filter.Q.value = 1.4;
    // A wobble in loudness, like strokes of the pencil.
    const wobble = s.ctx.createOscillator();
    wobble.frequency.value = 9;
    const depth = s.ctx.createGain();
    depth.gain.value = 0.05;
    const gain = s.ctx.createGain();
    gain.gain.value = 0.09;
    wobble.connect(depth).connect(gain.gain);
    src.connect(filter).connect(gain).connect(s.out);
    src.start(s.t, Math.random() * 0.5);
    wobble.start(s.t);
    src.onended = () => wobble.stop();
    this.scratch = { src, gain };
  }

  /** A drawing turning solid: a snap for a line, a hollow pop for a boulder. */
  solidify(kind: 'line' | 'rock'): void {
    if (kind === 'line') {
      this.noiseBurst('bandpass', 1800 * jitter(), 0.09, 0.2, 600);
      this.tone('triangle', 520 * jitter(), 260, 0.08, 0.18);
    } else {
      this.tone('sine', 220 * jitter(), 90, 0.18, 0.5);
      this.noiseBurst('lowpass', 1200, 0.12, 0.25, 300);
    }
  }

  /** Out of ink, or a stroke too small to become anything. */
  fizzle(): void {
    this.noiseBurst('highpass', 2500 * jitter(), 0.12, 0.08);
  }

  /** Rubber squeaking ink off the page. */
  squeak(): void {
    this.tone('sawtooth', 700 * jitter(), 1100, 0.07, 0.04);
  }

  ko(): void {
    this.tone('sine', 95 * jitter(), 26, 0.55, 1);
    this.noiseBurst('lowpass', 700, 0.5, 0.45, 120);
  }

  /** Boxing-bell ding when a fight starts. */
  bell(): void {
    this.tone('sine', 880, 870, 1.3, 0.3);
    this.tone('sine', 2210, 2190, 0.7, 0.08);
  }

  /** Two quick beeps when the eraser is about to sweep. */
  warning(): void {
    this.tone('square', 1050, 1050, 0.07, 0.07);
    this.tone('square', 1050, 1050, 0.07, 0.07, 0.15);
  }

  /** Rubbery scrub of the eraser crossing the page. */
  sweep(duration: number): void {
    const s = this.start();
    if (!s || !this.noise) return;
    const src = s.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = s.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 320;
    filter.Q.value = 0.8;
    const gain = s.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, s.t);
    gain.gain.exponentialRampToValueAtTime(0.3, s.t + 0.15);
    gain.gain.setValueAtTime(0.3, s.t + duration - 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, s.t + duration);
    src.connect(filter).connect(gain).connect(s.out);
    src.start(s.t);
    src.stop(s.t + duration);
  }

  private start(): { ctx: AudioContext; out: GainNode; t: number } | null {
    const ctx = this.ctx;
    if (this.muted || !ctx || !this.master || ctx.state !== 'running') return null;
    this.master.gain.value = TUNING.volume;
    return { ctx, out: this.master, t: ctx.currentTime };
  }

  private tone(type: OscillatorType, fromHz: number, toHz: number, duration: number, peak: number, delay = 0): void {
    const s = this.start();
    if (!s) return;
    const t = s.t + delay;
    const osc = s.ctx.createOscillator();
    osc.type = type;
    const gain = s.ctx.createGain();
    osc.frequency.setValueAtTime(fromHz, t);
    osc.frequency.exponentialRampToValueAtTime(toHz, t + duration);
    gain.gain.setValueAtTime(peak, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(s.out);
    osc.start(t);
    osc.stop(t + duration);
  }

  private noiseBurst(type: BiquadFilterType, hz: number, duration: number, peak: number, sweepToHz?: number): void {
    const s = this.start();
    if (!s || !this.noise) return;
    const src = s.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = s.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(hz, s.t);
    if (sweepToHz) filter.frequency.exponentialRampToValueAtTime(sweepToHz, s.t + duration);
    const gain = s.ctx.createGain();
    gain.gain.setValueAtTime(peak, s.t);
    gain.gain.exponentialRampToValueAtTime(0.0001, s.t + duration);
    src.connect(filter).connect(gain).connect(s.out);
    src.start(s.t, Math.random() * 0.5);
    src.stop(s.t + duration);
  }
}

/** Random multiplier around 1 (±10%). */
function jitter(): number {
  return 0.9 + Math.random() * 0.2;
}
