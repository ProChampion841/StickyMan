export interface Vec {
  x: number;
  y: number;
}

export interface Transform {
  x: number;
  y: number;
  angle: number;
}

export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Wraps an angle to (-PI, PI]. */
export function wrapAngle(a: number): number {
  const t = (a + Math.PI) % (2 * Math.PI);
  return (t <= 0 ? t + 2 * Math.PI : t) - Math.PI;
}

/** Maps a point from a body's local frame into world space. */
export function transformPoint(tf: Transform, local: Vec): Vec {
  const c = Math.cos(tf.angle);
  const s = Math.sin(tf.angle);
  return { x: tf.x + c * local.x - s * local.y, y: tf.y + s * local.x + c * local.y };
}

export const midpoint = (a: Vec, b: Vec): Vec => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export function distanceToSegment(p: Vec, a: Vec, b: Vec): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lenSq = abx * abx + aby * aby;
  const t = lenSq === 0 ? 0 : clamp(((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq, 0, 1);
  return Math.hypot(p.x - (a.x + abx * t), p.y - (a.y + aby * t));
}
