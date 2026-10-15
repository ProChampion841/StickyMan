import type Phaser from 'phaser';
import { PPM } from '../config';
import type { Box } from '../physics/PhysicsWorld';
import { GRAPHITE, INK, PAPER, PAPER_MARGIN, PAPER_RULE } from './palette';

const RULE_SPACING = 32;
const MARGIN_X = 96;

/** Ruled notebook page: the static backdrop. */
export function drawPaper(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
  g.fillStyle(PAPER, 1);
  g.fillRect(0, 0, width, height);
  g.lineStyle(1.5, PAPER_RULE, 0.7);
  for (let y = RULE_SPACING * 2; y < height; y += RULE_SPACING) g.lineBetween(0, y, width, y);
  g.lineStyle(2, PAPER_MARGIN, 0.8);
  g.lineBetween(MARGIN_X, 0, MARGIN_X, height);
  // Binder holes.
  g.fillStyle(0xe3dccb, 1);
  for (const y of [height * 0.2, height * 0.5, height * 0.8]) g.fillCircle(40, y, 13);
}

/** Level geometry as graphite-shaded blocks with an ink outline. */
export function drawLevel(g: Phaser.GameObjects.Graphics, boxes: readonly Box[]): void {
  for (const box of boxes) {
    const x = box.x * PPM;
    const y = box.y * PPM;
    const w = box.w * PPM;
    const h = box.h * PPM;
    g.fillStyle(GRAPHITE, 1);
    g.fillRect(x, y, w, h);
    g.lineStyle(4, INK, 1);
    g.strokeRect(x, y, w, h);
  }
}
