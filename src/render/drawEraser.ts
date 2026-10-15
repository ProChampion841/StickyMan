import type Phaser from 'phaser';
import { PPM, VIEW_WIDTH } from '../config';
import type { Eraser } from '../game/Eraser';
import { ERASER_PINK, ERASER_SLEEVE, INK, PAPER, WARNING_RED } from './palette';

const WARNING_BLINK_MS = 150;
/** Arrow distance from the screen edge, far enough in that its "!" clears the arena wall. */
const ARROW_INSET = 110;

/** Draws the eraser while it sweeps, or a blinking arrow at the edge it's about to enter from. */
export function drawEraser(g: Phaser.GameObjects.Graphics, eraser: Eraser, timeMs: number): void {
  g.clear();
  const top = eraser.top * PPM;
  const height = eraser.height * PPM;
  if (eraser.phase === 'warning') {
    if (Math.floor(timeMs / WARNING_BLINK_MS) % 2 === 1) return;
    const x = eraser.dir > 0 ? ARROW_INSET : VIEW_WIDTH - ARROW_INSET;
    const y = top + height / 2;
    const d = eraser.dir;
    // Arrow pointing the way it will travel, with an exclamation mark behind it.
    g.fillStyle(WARNING_RED, 1);
    g.fillTriangle(x + d * 34, y, x, y - 26, x, y + 26);
    g.fillRect(d > 0 ? x - 30 : x, y - 9, 30, 18);
    g.lineStyle(6, WARNING_RED, 1);
    g.lineBetween(x - d * 52, y - 26, x - d * 52, y + 6);
    g.fillCircle(x - d * 52, y + 19, 4);
    return;
  }
  if (eraser.phase !== 'sweeping') return;
  const width = eraser.halfWidth * 2 * PPM;
  const left = (eraser.x - eraser.halfWidth) * PPM;
  // The cardboard sleeve covers the trailing 45%.
  const sleeve = width * 0.45;
  const sleeveLeft = eraser.dir > 0 ? left : left + width - sleeve;
  g.fillStyle(ERASER_PINK, 1);
  g.fillRoundedRect(left, top, width, height, 12);
  g.fillStyle(ERASER_SLEEVE, 1);
  g.fillRect(sleeveLeft, top, sleeve, height);
  g.lineStyle(2, PAPER, 0.8);
  for (const offset of [0.3, 0.6]) {
    g.lineBetween(sleeveLeft + 6, top + height * offset, sleeveLeft + sleeve - 6, top + height * offset);
  }
  g.lineStyle(4, INK, 1);
  g.strokeRoundedRect(left, top, width, height, 12);
}
