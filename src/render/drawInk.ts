import type Phaser from 'phaser';
import type { Fighter } from '../combat/Fighter';
import { PPM } from '../config';
import { type Ink, LINE_RADIUS } from '../game/Ink';
import type { Vec } from '../util/math';
import { INK, type InkStyle } from './palette';

/** Drawings fade out over their last this-many seconds. */
const FADE_TIME = 1;
/** A drawing flashes bold black for this long as it turns solid. */
const SOLIDIFY_FLASH = 0.12;
const LINE_WIDTH = LINE_RADIUS * 2 * PPM;
const SKETCH_WIDTH = 3;
const ROCK_OUTLINE = 4;
const HATCH_SPACING = 9;

/** Cheap deterministic noise in [-1, 1]. */
function noise(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

/**
 * Draws every finished drawing and every stroke in progress. Lines and boulders wobble
 * with the same hand-drawn boil as the fighters; sketches show a pencil tip.
 */
export function drawInk(
  g: Phaser.GameObjects.Graphics,
  ink: Ink,
  penOf: (owner: Fighter) => InkStyle,
  boilSeed: number,
  boil: number,
): void {
  for (const stroke of ink.strokes) {
    const pen = penOf(stroke.owner);
    const alpha = Math.min(1, stroke.life / FADE_TIME);
    const fresh = stroke.maxLife - stroke.life < SOLIDIFY_FLASH;
    const wobble = (p: Vec, i: number): Vec => {
      const id = boilSeed * 31 + stroke.id * 977 + i * 7;
      return { x: p.x * PPM + noise(id) * boil * 0.6, y: p.y * PPM + noise(id + 3) * boil * 0.6 };
    };
    if (stroke.kind === 'line') {
      const points = stroke.points.map(wobble);
      polyline(g, points, fresh ? LINE_WIDTH * 1.4 : LINE_WIDTH, fresh ? INK : pen.near, alpha);
      continue;
    }
    // Boulders: the drawn outline, carried along by the body as it falls and tumbles.
    const t = stroke.body.translation();
    const angle = stroke.body.rotation();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const outline = stroke.points.map((p, i) =>
      wobble({ x: t.x + p.x * cos - p.y * sin, y: t.y + p.x * sin + p.y * cos }, i),
    );
    g.fillStyle(pen.far, 0.95 * alpha);
    tracePath(g, outline);
    g.fillPath();
    hatch(g, outline, pen.near, 0.35 * alpha);
    g.lineStyle(fresh ? ROCK_OUTLINE * 1.6 : ROCK_OUTLINE, fresh ? INK : pen.near, alpha);
    tracePath(g, outline);
    g.strokePath();
  }

  for (const sketch of ink.sketches.values()) {
    const pen = penOf(sketch.owner);
    const points = sketch.points.map((p) => ({ x: p.x * PPM, y: p.y * PPM }));
    polyline(g, points, SKETCH_WIDTH, pen.near, 0.9);
    pencil(g, points[points.length - 1]);
  }
}

/** A closed path through `points`, ready to fill or stroke. */
function tracePath(g: Phaser.GameObjects.Graphics, points: Vec[]): void {
  g.beginPath();
  g.moveTo(points[0].x, points[0].y);
  for (const p of points.slice(1)) g.lineTo(p.x, p.y);
  g.closePath();
}

function polyline(g: Phaser.GameObjects.Graphics, points: Vec[], width: number, color: number, alpha: number): void {
  g.lineStyle(width, color, alpha);
  for (let i = 1; i < points.length; i++) g.lineBetween(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
  // Round joints and ends.
  g.fillStyle(color, alpha);
  for (const p of points) g.fillCircle(p.x, p.y, width / 2);
}

/** Diagonal pencil shading across a boulder, clipped by eye to its bounding box. */
function hatch(g: Phaser.GameObjects.Graphics, outline: Vec[], color: number, alpha: number): void {
  const xs = outline.map((p) => p.x);
  const ys = outline.map((p) => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const r = Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 0.32;
  g.lineStyle(2, color, alpha);
  for (let d = -r; d <= r; d += HATCH_SPACING) {
    const half = Math.sqrt(Math.max(0, r * r - d * d));
    g.lineBetween(cx + d - half * 0.7, cy - half * 0.7, cx + d + half * 0.7, cy + half * 0.7);
  }
}

/** The tip of the pen drawing a stroke. */
function pencil(g: Phaser.GameObjects.Graphics, tip: Vec): void {
  g.fillStyle(0xf2c14e, 1);
  g.fillTriangle(tip.x, tip.y, tip.x + 7, tip.y - 18, tip.x + 15, tip.y - 12);
  g.lineStyle(2, INK, 1);
  g.strokeTriangle(tip.x, tip.y, tip.x + 7, tip.y - 18, tip.x + 15, tip.y - 12);
  g.fillStyle(INK, 1);
  g.fillCircle(tip.x + 1.5, tip.y - 2.5, 2.5);
}
