import type Phaser from 'phaser';
import type { Vec } from '../util/math';

/** How long (s) a smear point lingers. */
const LIFE = 0.11;
const MAX_WIDTH = 15;

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

/**
 * Ink smears behind a striking fist or foot, like the smear frames of hand-drawn
 * animation: a ribbon through the limb's recent positions, thinning and fading with age.
 */
export class Trails {
  private readonly trails: TrailPoint[][];

  constructor(count: number) {
    this.trails = Array.from({ length: count }, () => []);
  }

  /** Ages trail `index` and, if `point` is given, extends it there (pixels). */
  track(index: number, point: Vec | null, dt: number): void {
    const trail = this.trails[index];
    for (const p of trail) p.age += dt;
    while (trail.length > 0 && trail[0].age > LIFE) trail.shift();
    if (point) trail.push({ x: point.x, y: point.y, age: 0 });
  }

  clear(): void {
    for (const trail of this.trails) trail.length = 0;
  }

  draw(g: Phaser.GameObjects.Graphics, colors: readonly number[]): void {
    this.trails.forEach((trail, i) => {
      for (let k = 1; k < trail.length; k++) {
        const t = 1 - trail[k].age / LIFE;
        if (t <= 0) continue;
        const width = MAX_WIDTH * t;
        g.lineStyle(width, colors[i], 0.5 * t);
        g.lineBetween(trail[k - 1].x, trail[k - 1].y, trail[k].x, trail[k].y);
        g.fillStyle(colors[i], 0.5 * t);
        g.fillCircle(trail[k].x, trail[k].y, width / 2);
      }
    });
  }
}
