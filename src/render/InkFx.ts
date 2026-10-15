import type Phaser from 'phaser';
import type { Vec } from '../util/math';
import { INK } from './palette';

interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  color: number;
  /** Ink dries into a blot where it stops; eraser crumbs just vanish. */
  stains: boolean;
}

interface Burst {
  x: number;
  y: number;
  size: number;
  life: number;
  spin: number;
}

interface Stain {
  x: number;
  y: number;
  r: number;
  color: number;
}

/** Expanding shockwave circle. */
interface Ring {
  x: number;
  y: number;
  maxRadius: number;
  life: number;
}

/** Dust kicked up by a planted foot, or a curl of smoke. */
interface Puff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Radius gained per second. */
  grow: number;
  life: number;
  maxLife: number;
  color: number;
  alpha: number;
}

/** Speed line streaking behind a lunging body. */
interface Streak {
  x: number;
  y: number;
  length: number;
  /** Unit direction of travel of the body; the line trails the other way. */
  dx: number;
  dy: number;
  life: number;
}

const GRAVITY = 1600;
const BURST_LIFE = 0.12;
const BURST_SPIKES = 9;
const RING_LIFE = 0.24;
const PUFF_LIFE = 0.35;
const PUFF_COLOR = 0xcbc4b4;
const SMOKE_COLOR = 0x8f897c;
const SMOKE_LIFE = 0.55;
const STREAK_LIFE = 0.16;
/** Oldest blots are dropped past this, so a long fight can't slow the redraw down. */
const MAX_STAINS = 160;

/**
 * Hit effects in pixels: ink droplets that fly off an impact and dry as blots on the
 * page where they stop, plus a comic-book impact star. Positions are screen pixels.
 */
export class InkFx {
  private drops: Drop[] = [];
  private bursts: Burst[] = [];
  private stains: Stain[] = [];
  private rings: Ring[] = [];
  private puffs: Puff[] = [];
  private streaks: Streak[] = [];

  constructor(
    /** Drawn under the level, so blots look like they're on the paper. */
    private readonly stainLayer: Phaser.GameObjects.Graphics,
    private readonly layer: Phaser.GameObjects.Graphics,
    /** Floor top in pixels; drops that reach it pool there instead of falling through. */
    private readonly floorY: number,
  ) {}

  /** Flings droplets of `color` mostly along `direction`; `strength` 0..1 scales count and speed. */
  splash(at: Vec, direction: 1 | -1, color: number, strength: number): void {
    const count = Math.round(6 + 16 * strength);
    for (let i = 0; i < count; i++) {
      const speed = 150 + Math.random() * 500 * (0.5 + strength);
      const angle = (Math.random() - 0.5) * 1.7 - 0.35;
      this.drops.push({
        x: at.x,
        y: at.y,
        vx: direction * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.5 + Math.random() * 3.5 * (0.5 + strength),
        life: 0.2 + Math.random() * 0.35,
        color,
        stains: true,
      });
    }
  }

  /** Rubber crumbs kicked up behind the eraser, flying opposite to `direction`. */
  crumbs(at: Vec, direction: 1 | -1, color: number): void {
    for (let i = 0; i < 2; i++) {
      this.drops.push({
        x: at.x + (Math.random() - 0.5) * 20,
        y: at.y - Math.random() * 10,
        vx: -direction * (60 + Math.random() * 160),
        vy: -(120 + Math.random() * 260),
        r: 1.5 + Math.random() * 2,
        life: 0.35 + Math.random() * 0.3,
        color,
        stains: false,
      });
    }
  }

  /** Wipes blots inside a pixel rectangle off the page. */
  erase(left: number, top: number, right: number, bottom: number): void {
    const before = this.stains.length;
    this.stains = this.stains.filter((s) => s.x < left || s.x > right || s.y < top || s.y > bottom);
    if (this.stains.length !== before) this.redrawStains();
  }

  burst(at: Vec, strength: number): void {
    this.bursts.push({ x: at.x, y: at.y, size: 18 + 34 * strength, life: BURST_LIFE, spin: Math.random() * Math.PI });
  }

  /** A shockwave circle racing out from a heavy impact. */
  ring(at: Vec, strength: number): void {
    this.rings.push({ x: at.x, y: at.y, maxRadius: 40 + 70 * strength, life: RING_LIFE });
  }

  /** Dust puffs kicked back from a foot driving off the floor; the body moves along `direction`. */
  puff(at: Vec, direction: 1 | -1, count = 5): void {
    for (let i = 0; i < count; i++) {
      const life = PUFF_LIFE * (0.7 + Math.random() * 0.3);
      this.puffs.push({
        x: at.x + (Math.random() - 0.5) * 16,
        y: at.y - Math.random() * 6,
        vx: -direction * (40 + Math.random() * 110),
        vy: -(10 + Math.random() * 50),
        r: 3 + Math.random() * 4,
        grow: 30,
        life,
        maxLife: life,
        color: PUFF_COLOR,
        alpha: 0.75,
      });
    }
  }

  /** Dust thrown out both ways along the floor, as from a stomp landing. */
  dustWave(at: Vec): void {
    this.puff(at, 1, 6);
    this.puff(at, -1, 6);
  }

  /** A ring of air puffs under the feet, for a jump kicked off thin air. */
  airPuff(at: Vec): void {
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI * (0.15 + 0.7 * (i / 6));
      const life = PUFF_LIFE * 0.8;
      this.puffs.push({
        x: at.x,
        y: at.y,
        vx: -Math.cos(angle) * 120,
        vy: Math.sin(angle) * 50,
        r: 3,
        grow: 22,
        life,
        maxLife: life,
        color: PUFF_COLOR,
        alpha: 0.7,
      });
    }
  }

  /** A billowing smoke-bomb cloud around `at`, `size` pixels across. */
  smoke(at: Vec, size = 120): void {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 90;
      const life = SMOKE_LIFE * (0.7 + Math.random() * 0.3);
      this.puffs.push({
        x: at.x + Math.cos(angle) * size * 0.2 * Math.random(),
        y: at.y + Math.sin(angle) * size * 0.3 * Math.random(),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6 - 25,
        r: size * (0.1 + Math.random() * 0.1),
        grow: size * 0.5,
        life,
        maxLife: life,
        color: i % 3 === 0 ? PUFF_COLOR : SMOKE_COLOR,
        alpha: 0.85,
      });
    }
  }

  /**
   * Speed lines streaming behind a body moving along `direction` (horizontal), or along
   * (dx, dy) when given as a vector, around `at`.
   */
  speedLines(at: Vec, direction: 1 | -1 | Vec): void {
    const d = typeof direction === 'number' ? { x: direction, y: 0 } : direction;
    const length = Math.hypot(d.x, d.y) || 1;
    const dx = d.x / length;
    const dy = d.y / length;
    for (let i = 0; i < 5; i++) {
      const back = 20 + Math.random() * 40;
      const side = (Math.random() - 0.5) * 90;
      this.streaks.push({
        x: at.x - dx * back - dy * side,
        y: at.y - dy * back + dx * side,
        length: 30 + Math.random() * 45,
        dx,
        dy,
        life: STREAK_LIFE,
      });
    }
  }

  clear(): void {
    this.drops = [];
    this.bursts = [];
    this.stains = [];
    this.rings = [];
    this.puffs = [];
    this.streaks = [];
    this.stainLayer.clear();
    this.layer.clear();
  }

  update(dt: number): void {
    let stained = false;
    for (const d of this.drops) {
      d.vy += GRAVITY * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.life -= dt;
      if (d.y >= this.floorY) {
        // Half of the blot hides behind the floor block, so it reads as a puddle on its edge.
        d.life = 0;
        if (d.stains) this.stains.push({ x: d.x, y: this.floorY, r: d.r * 1.6, color: d.color });
        stained ||= d.stains;
      } else if (d.life <= 0 && d.stains) {
        this.stains.push({ x: d.x, y: d.y, r: d.r * 1.25, color: d.color });
        stained = true;
      }
    }
    this.drops = this.drops.filter((d) => d.life > 0);
    for (const b of this.bursts) b.life -= dt;
    this.bursts = this.bursts.filter((b) => b.life > 0);
    for (const r of this.rings) r.life -= dt;
    this.rings = this.rings.filter((r) => r.life > 0);
    for (const p of this.puffs) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += p.grow * dt;
      p.life -= dt;
    }
    this.puffs = this.puffs.filter((p) => p.life > 0);
    for (const s of this.streaks) {
      s.x -= s.dx * 260 * dt;
      s.y -= s.dy * 260 * dt;
      s.life -= dt;
    }
    this.streaks = this.streaks.filter((s) => s.life > 0);
    if (stained) {
      if (this.stains.length > MAX_STAINS) this.stains.splice(0, this.stains.length - MAX_STAINS);
      this.redrawStains();
    }
  }

  draw(): void {
    const g = this.layer;
    g.clear();
    for (const p of this.puffs) {
      g.fillStyle(p.color, p.alpha * (p.life / p.maxLife));
      g.fillCircle(p.x, p.y, p.r);
    }
    for (const s of this.streaks) {
      const t = s.life / STREAK_LIFE;
      g.lineStyle(3, INK, 0.7 * t);
      g.lineBetween(s.x, s.y, s.x - s.dx * s.length * t, s.y - s.dy * s.length * t);
    }
    for (const r of this.rings) {
      const t = 1 - r.life / RING_LIFE;
      g.lineStyle(6 * (1 - t) + 1, INK, 0.8 * (1 - t));
      g.strokeCircle(r.x, r.y, 8 + (r.maxRadius - 8) * Math.sqrt(t));
    }
    for (const d of this.drops) {
      g.fillStyle(d.color, 1);
      g.fillCircle(d.x, d.y, d.r);
    }
    for (const b of this.bursts) {
      // Spikes alternate long and short, growing a little as the burst fades.
      const grow = 1 + (1 - b.life / BURST_LIFE) * 0.35;
      g.lineStyle(3, INK, 1);
      for (let i = 0; i < BURST_SPIKES * 2; i++) {
        const angle = b.spin + (i / (BURST_SPIKES * 2)) * Math.PI * 2;
        const outer = b.size * grow * (i % 2 === 0 ? 1 : 0.55);
        const inner = b.size * 0.3;
        g.lineBetween(
          b.x + Math.cos(angle) * inner,
          b.y + Math.sin(angle) * inner,
          b.x + Math.cos(angle) * outer,
          b.y + Math.sin(angle) * outer,
        );
      }
    }
  }

  private redrawStains(): void {
    const g = this.stainLayer;
    g.clear();
    for (const s of this.stains) {
      g.fillStyle(s.color, 0.45);
      g.fillCircle(s.x, s.y, s.r);
    }
  }
}
