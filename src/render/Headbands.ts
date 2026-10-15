import type Phaser from 'phaser';
import { PPM } from '../config';
import { DIM } from '../stickman/skeleton';
import type { Vec } from '../util/math';

/** Points per ribbon tail and the pixel length between them. */
const POINTS = 7;
const SEGMENT = 7;
/** Pixels per second squared pulling the ribbons down, and drag on their motion per frame. */
const GRAVITY = 700;
const DAMPING = 0.88;
/** A steady breeze pushing the ribbons back, behind the fighter (px/s²). */
const BREEZE = 260;
/** A head that moves farther than this in one frame (a vanish) resets its ribbons. */
const TELEPORT = 120;
const HEAD_RADIUS = DIM.headRadius * PPM;
const WIDTH_START = 5;
const WIDTH_END = 2;

interface Tail {
  points: Vec[];
  previous: Vec[];
}

/**
 * The ninja headband's two ribbon tails: little verlet ropes tied to the back of each head,
 * so they trail behind runs, whip around flips and settle when standing. Pixels throughout.
 */
export class Headbands {
  private readonly tails: Tail[][] = [];

  /** Advances fighter `index`'s ribbons; `head` is the head's center (px). */
  update(index: number, head: Vec, facing: 1 | -1, dt: number): void {
    const knots = [knot(head, facing, 0), knot(head, facing, 3)];
    let tails = this.tails[index];
    if (!tails || Math.hypot(tails[0].points[0].x - knots[0].x, tails[0].points[0].y - knots[0].y) > TELEPORT) {
      tails = knots.map((k, t) => hangingTail(k, facing, t));
      this.tails[index] = tails;
    }
    if (dt <= 0) return;
    tails.forEach((tail, t) => {
      const { points, previous } = tail;
      points[0] = { ...knots[t] };
      for (let i = 1; i < POINTS; i++) {
        const p = points[i];
        const vx = (p.x - previous[i].x) * DAMPING;
        const vy = (p.y - previous[i].y) * DAMPING;
        previous[i] = { ...p };
        // The lower ribbon hangs a little heavier, so the two fan apart.
        p.x += vx - facing * BREEZE * dt * dt;
        p.y += vy + GRAVITY * (1 + t * 0.25) * dt * dt;
      }
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 1; i < POINTS; i++) {
          const a = points[i - 1];
          const b = points[i];
          const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          b.x = a.x + ((b.x - a.x) / length) * SEGMENT;
          b.y = a.y + ((b.y - a.y) / length) * SEGMENT;
        }
      }
    });
  }

  /** Draws fighter `index`'s ribbons, tapering toward the ends. Call before drawing the fighter. */
  draw(g: Phaser.GameObjects.Graphics, index: number, color: number, offset: Vec, alpha = 1): void {
    for (const { points } of this.tails[index] ?? []) {
      for (let i = 1; i < points.length; i++) {
        const width = WIDTH_START + ((WIDTH_END - WIDTH_START) * i) / (points.length - 1);
        g.lineStyle(width, color, alpha);
        g.lineBetween(points[i - 1].x + offset.x, points[i - 1].y + offset.y, points[i].x + offset.x, points[i].y + offset.y);
        g.fillStyle(color, alpha);
        g.fillCircle(points[i].x + offset.x, points[i].y + offset.y, width / 2);
      }
    }
  }

  clear(): void {
    this.tails.length = 0;
  }
}

/** Where a ribbon is tied: the back of the head, just above center. */
function knot(head: Vec, facing: 1 | -1, drop: number): Vec {
  return { x: head.x - facing * HEAD_RADIUS * 0.85, y: head.y - HEAD_RADIUS * 0.6 + drop };
}

function hangingTail(from: Vec, facing: 1 | -1, t: number): Tail {
  const points = Array.from({ length: POINTS }, (_, i) => ({
    x: from.x - facing * i * SEGMENT * 0.7,
    y: from.y + i * SEGMENT * (0.7 + t * 0.2),
  }));
  return { points, previous: points.map((p) => ({ ...p })) };
}
