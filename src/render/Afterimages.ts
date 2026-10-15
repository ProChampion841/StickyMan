import type Phaser from 'phaser';
import type { Skeleton } from '../stickman/Stickman';
import { drawStickman } from './drawStickman';
import type { InkStyle } from './palette';

interface Ghost {
  skeleton: Skeleton;
  facing: 1 | -1;
  owner: number;
  age: number;
}

/** A new ghost is left behind this often (seconds) while a fighter moves fast. */
const SPACING = 0.035;
/** Seconds a ghost takes to fade out. */
const LIFE = 0.2;
const START_ALPHA = 0.32;

/**
 * Fading copies of a fighter left behind during dashes, flips and lunges: the classic
 * ninja-speed blur. Ghosts are drawn in the player's pale ink, under the fighters.
 */
export class Afterimages {
  private ghosts: Ghost[] = [];
  private readonly sinceLast: number[];

  constructor(fighters: number) {
    this.sinceLast = new Array<number>(fighters).fill(Infinity);
  }

  /** Call once per frame per fighter with its drawn pose; `fast` says whether to leave ghosts. */
  track(owner: number, skeleton: Skeleton, facing: 1 | -1, fast: boolean, dt: number): void {
    this.sinceLast[owner] += dt;
    if (!fast) {
      this.sinceLast[owner] = Infinity;
      return;
    }
    if (this.sinceLast[owner] < SPACING) return;
    this.sinceLast[owner] = 0;
    this.ghosts.push({ skeleton, facing, owner, age: 0 });
  }

  update(dt: number): void {
    for (const ghost of this.ghosts) ghost.age += dt;
    this.ghosts = this.ghosts.filter((ghost) => ghost.age < LIFE);
  }

  draw(g: Phaser.GameObjects.Graphics, pens: readonly InkStyle[]): void {
    for (const ghost of this.ghosts) {
      const pale = pens[ghost.owner].far;
      drawStickman(g, ghost.skeleton, ghost.facing, { near: pale, far: pale }, 0, 0, {
        alpha: START_ALPHA * (1 - ghost.age / LIFE),
      });
    }
  }

  clear(): void {
    this.ghosts = [];
    this.sinceLast.fill(Infinity);
  }
}
