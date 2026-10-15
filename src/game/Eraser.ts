import type { Fighter } from '../combat/Fighter';
import { TUNING } from '../config';
import type { EventSink } from '../util/events';
import type { Vec } from '../util/math';
import type { Rng } from '../util/random';

export type EraserEvent =
  | { type: 'eraserWarning'; dir: 1 | -1 }
  | { type: 'eraserSweep'; dir: 1 | -1 }
  | { type: 'eraserHit'; victim: Fighter; point: Vec; damage: number; ko: boolean };

const HALF_WIDTH = 0.8;
const HEIGHT = 0.85;
/** Seconds of warning before a sweep enters. */
const WARNING_TIME = 1.4;
/** First sweep of a round comes after this many seconds, plus up to 3 more. */
const FIRST_DELAY = 7;
/** Launch velocity (m/s) for anyone it hits: up, and along the sweep. */
const LAUNCH_UP = 8;
const LAUNCH_ALONG = 4.5;
const STUN = 0.6;
/** Slack (m) around the eraser's box when testing body points, roughly a limb's thickness. */
const CONTACT_MARGIN = 0.06;

/**
 * A giant eraser that periodically sweeps the full width of the floor. It warns first,
 * hurts and launches anyone it touches (once per sweep), and can be dodged by jumping
 * or standing on a platform. It has no collider: contact is tested against body points.
 */
export class Eraser {
  readonly halfWidth = HALF_WIDTH;
  readonly height = HEIGHT;
  phase: 'idle' | 'warning' | 'sweeping' = 'idle';
  /** Center x (m) while sweeping. */
  x = 0;
  dir: 1 | -1 = 1;
  /** Increments every sweep, so observers can tell sweeps apart. */
  sweepId = 0;
  /** Seconds left in the current idle or warning phase. */
  timer = 0;
  private readonly struck = new Set<Fighter>();

  constructor(
    private readonly floorY: number,
    private readonly arenaWidth: number,
    private readonly rng: Rng,
  ) {
    this.reset();
  }

  /** Top edge (m); anything above it is safe. */
  get top(): number {
    return this.floorY - HEIGHT;
  }

  get speed(): number {
    return TUNING.eraserSpeed;
  }

  /**
   * Seconds until the leading edge reaches `x`, counting any warning time left; null if
   * no sweep is coming or the edge is already past it.
   */
  timeToReach(x: number): number | null {
    let edge: number;
    let delay = 0;
    if (this.phase === 'sweeping') {
      edge = this.x + this.dir * HALF_WIDTH;
    } else if (this.phase === 'warning') {
      edge = this.dir > 0 ? 0 : this.arenaWidth;
      delay = this.timer;
    } else {
      return null;
    }
    const distance = (x - edge) * this.dir;
    return distance < 0 ? null : delay + distance / this.speed;
  }

  reset(): void {
    this.phase = 'idle';
    this.timer = FIRST_DELAY + this.rng() * 3;
  }

  /** `allowNew` false lets a running sweep finish without starting another (e.g. between rounds). */
  step(dt: number, fighters: readonly Fighter[], events: EventSink<EraserEvent>, allowNew: boolean): void {
    switch (this.phase) {
      case 'idle':
        if (!allowNew) return;
        this.timer -= dt;
        if (this.timer <= 0) {
          this.phase = 'warning';
          this.timer = WARNING_TIME;
          this.dir = this.rng() < 0.5 ? 1 : -1;
          events.push({ type: 'eraserWarning', dir: this.dir });
        }
        return;
      case 'warning':
        this.timer -= dt;
        if (this.timer <= 0) {
          this.phase = 'sweeping';
          this.sweepId++;
          this.struck.clear();
          this.x = this.dir > 0 ? -HALF_WIDTH : this.arenaWidth + HALF_WIDTH;
          events.push({ type: 'eraserSweep', dir: this.dir });
        }
        return;
      case 'sweeping':
        this.x += this.dir * this.speed * dt;
        this.collide(fighters, events);
        if (this.dir > 0 ? this.x - HALF_WIDTH > this.arenaWidth : this.x + HALF_WIDTH < 0) {
          this.phase = 'idle';
          this.timer = TUNING.eraserInterval * (0.7 + 0.6 * this.rng());
        }
    }
  }

  private collide(fighters: readonly Fighter[], events: EventSink<EraserEvent>): void {
    for (const fighter of fighters) {
      if (this.struck.has(fighter)) continue;
      const s = fighter.man.skeleton();
      const points = [s.head, s.handL, s.handR, s.footL, s.footR, ...Object.values(s.joints)];
      const point = points.find(
        (p) =>
          Math.abs(p.x - this.x) <= HALF_WIDTH + CONTACT_MARGIN &&
          p.y >= this.top - CONTACT_MARGIN &&
          p.y <= this.floorY + CONTACT_MARGIN,
      );
      if (!point) continue;
      this.struck.add(fighter);
      const damage = fighter.knockedOut ? 0 : TUNING.eraserDamage;
      const ko = fighter.hurt(damage, { x: this.dir * LAUNCH_ALONG, y: -LAUNCH_UP }, STUN);
      events.push({ type: 'eraserHit', victim: fighter, point, damage, ko });
    }
  }
}
