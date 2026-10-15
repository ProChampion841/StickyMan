import type Phaser from 'phaser';
import { PPM } from '../config';
import type { Skeleton } from '../stickman/Stickman';
import { DIM } from '../stickman/skeleton';
import type { Vec } from '../util/math';
import { INK, type InkStyle, PAPER } from './palette';

const LIMB_WIDTH = 0.16 * PPM;
const EYE_RADIUS = 0.04 * PPM;
const HEAD_RADIUS = DIM.headRadius * PPM;
/** A striking fist or foot is drawn as a ball this much wider than the limb, so it reads at speed. */
const STRIKER_SCALE = 1.9;
const STAR_COLOR = 0xffe45c;

export type Face = 'normal' | 'hurt' | 'ko';
export type Extremity = 'handL' | 'handR' | 'footL' | 'footR';

export interface StickmanLook {
  /** Shifts the whole figure (pixels), e.g. to shake a fighter frozen by a hit. */
  offset?: Vec;
  face?: Face;
  /** The fist or foot currently striking, drawn bigger. */
  striker?: Extremity | null;
  /** Opacity, below 1 for afterimages. */
  alpha?: number;
  /** Color of the ninja headband across the forehead; none if omitted. */
  band?: number;
}

/** Cheap deterministic noise in [-1, 1]. */
function noise(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

/**
 * Draws one stick figure in pen ink. `boilSeed` changes a few times per second to make
 * the lines jitter like hand-drawn animation; `boil` is the jitter size in pixels.
 * Returns the head's center in pixels, for effects drawn around it.
 */
export function drawStickman(
  g: Phaser.GameObjects.Graphics,
  s: Skeleton,
  facing: 1 | -1,
  ink: InkStyle,
  boilSeed: number,
  boil: number,
  look: StickmanLook = {},
): Vec {
  const offset = look.offset ?? { x: 0, y: 0 };
  const alpha = look.alpha ?? 1;
  let pointId = 0;
  // Every point gets its own stable jitter, so shared joints stay connected.
  const px = (p: Vec): Vec => {
    const id = boilSeed * 97 + pointId++ * 13;
    return { x: p.x * PPM + noise(id) * boil + offset.x, y: p.y * PPM + noise(id + 7) * boil + offset.y };
  };
  const j = s.joints;
  const pelvis = px({ x: (j.hipL.x + j.hipR.x) / 2, y: (j.hipL.y + j.hipR.y) / 2 });
  const ends = { handL: px(s.handL), handR: px(s.handR), footL: px(s.footL), footR: px(s.footR) };

  // Far side first so the near limbs overlap it.
  polyline(g, [px(j.shoulderL), px(j.elbowL), ends.handL], ink.far, alpha);
  polyline(g, [pelvis, px(j.kneeL), ends.footL], ink.far, alpha);

  polyline(g, [px(j.neck), pelvis], ink.near, alpha);
  const head = px(s.head);
  g.fillStyle(ink.near, alpha);
  g.fillCircle(head.x, head.y, HEAD_RADIUS);
  if (look.band !== undefined) {
    // A band around the forehead, tilted a touch down toward the face.
    g.lineStyle(HEAD_RADIUS * 0.34, look.band, alpha);
    g.lineBetween(
      head.x - facing * HEAD_RADIUS * 0.9,
      head.y - HEAD_RADIUS * 0.58,
      head.x + facing * HEAD_RADIUS * 0.9,
      head.y - HEAD_RADIUS * 0.46,
    );
  }
  drawFace(g, head, facing, look.face ?? 'normal', alpha);

  polyline(g, [pelvis, px(j.kneeR), ends.footR], ink.near, alpha);
  polyline(g, [px(j.shoulderR), px(j.elbowR), ends.handR], ink.near, alpha);

  if (look.striker) {
    const end = ends[look.striker];
    g.fillStyle(look.striker.endsWith('L') ? ink.far : ink.near, alpha);
    g.fillCircle(end.x, end.y, (LIMB_WIDTH / 2) * STRIKER_SCALE);
  }
  return head;
}

/** The eye: a dot normally, a squint (">") when hurt, a cross when knocked out. */
function drawFace(g: Phaser.GameObjects.Graphics, head: Vec, facing: 1 | -1, face: Face, alpha: number): void {
  const x = head.x + facing * 0.09 * PPM;
  const y = head.y - 0.03 * PPM;
  if (face === 'normal') {
    g.fillStyle(PAPER, alpha);
    g.fillCircle(x, y, EYE_RADIUS);
    return;
  }
  const e = EYE_RADIUS * 1.6;
  g.lineStyle(2.5, PAPER, alpha);
  if (face === 'ko') {
    g.lineBetween(x - e, y - e, x + e, y + e);
    g.lineBetween(x - e, y + e, x + e, y - e);
  } else {
    // Squint pointing at whatever hit it.
    g.lineBetween(x - facing * e, y - e, x + facing * e, y);
    g.lineBetween(x + facing * e, y, x - facing * e, y + e);
  }
}

/** Cartoon stars circling a dazed fighter's head. */
export function drawDizzyStars(g: Phaser.GameObjects.Graphics, head: Vec, timeSeconds: number): void {
  const count = 3;
  for (let i = 0; i < count; i++) {
    const angle = timeSeconds * 6 + (i * Math.PI * 2) / count;
    const x = head.x + Math.cos(angle) * HEAD_RADIUS * 1.5;
    const y = head.y - HEAD_RADIUS * 1.7 + Math.sin(angle) * HEAD_RADIUS * 0.45;
    // Stars passing behind the head are drawn smaller.
    star(g, x, y, Math.sin(angle) > 0 ? 6 : 4.5, timeSeconds * 4 + i);
  }
}

function star(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, spin: number): void {
  g.fillStyle(STAR_COLOR, 1);
  g.lineStyle(1.5, INK, 1);
  g.beginPath();
  for (let k = 0; k < 10; k++) {
    const angle = spin + (k * Math.PI) / 5;
    const radius = k % 2 === 0 ? r : r * 0.45;
    const sx = x + Math.cos(angle) * radius;
    const sy = y + Math.sin(angle) * radius;
    if (k === 0) g.moveTo(sx, sy);
    else g.lineTo(sx, sy);
  }
  g.closePath();
  g.fillPath();
  g.strokePath();
}

function polyline(g: Phaser.GameObjects.Graphics, points: Vec[], color: number, alpha: number): void {
  g.lineStyle(LIMB_WIDTH, color, alpha);
  for (let i = 1; i < points.length; i++) {
    g.lineBetween(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
  }
  // Round caps and joints.
  g.fillStyle(color, alpha);
  for (const p of points) g.fillCircle(p.x, p.y, LIMB_WIDTH / 2);
}
