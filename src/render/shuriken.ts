import type Phaser from 'phaser';
import { INK, PAPER } from './palette';

/** A four-pointed throwing star of radius `r` (pixels), turned by `angle`, with a hole in the middle. */
export function drawShuriken(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  r: number,
  angle: number,
  color: number,
  alpha = 1,
): void {
  const points: { x: number; y: number }[] = [];
  for (let k = 0; k < 8; k++) {
    const a = angle + (k * Math.PI) / 4;
    const radius = k % 2 === 0 ? r : r * 0.32;
    points.push({ x: x + Math.cos(a) * radius, y: y + Math.sin(a) * radius });
  }
  g.fillStyle(color, alpha);
  g.lineStyle(Math.max(1.5, r * 0.12), INK, alpha);
  g.beginPath();
  g.moveTo(points[0].x, points[0].y);
  for (const p of points.slice(1)) g.lineTo(p.x, p.y);
  g.closePath();
  g.fillPath();
  g.strokePath();
  g.fillStyle(PAPER, alpha);
  g.fillCircle(x, y, r * 0.14);
}
