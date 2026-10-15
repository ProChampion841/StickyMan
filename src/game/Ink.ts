import type { Fighter } from '../combat/Fighter';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import { ALL_BITS, WORLD_BIT, interactionGroups } from '../physics/groups';
import { type Collider, RAPIER, type RigidBody } from '../physics/rapier';
import type { EventSink } from '../util/events';
import { type Vec, clamp, distanceToSegment } from '../util/math';

/** A drawn line turns into a solid wall or platform; a closed shape into a falling boulder. */
export type InkKind = 'line' | 'rock';

export type InkEvent =
  | { type: 'inkDrawn'; owner: Fighter; kind: InkKind; point: Vec }
  | { type: 'inkFizzle'; owner: Fighter; point: Vec }
  | { type: 'inkCrush'; owner: Fighter; victim: Fighter; point: Vec; damage: number; ko: boolean }
  | { type: 'inkErased'; point: Vec };

/** What the eraser looks like to the ink: a box sweeping along the floor. */
export interface InkEraser {
  phase: 'idle' | 'warning' | 'sweeping';
  x: number;
  halfWidth: number;
  top: number;
}

/** A finished drawing, solid in the physics world. */
export interface InkStroke {
  readonly id: number;
  readonly owner: Fighter;
  readonly kind: InkKind;
  /** Lines: the drawn points in world meters. Rocks: the drawn outline in body space. */
  readonly points: readonly Vec[];
  readonly body: RigidBody;
  /** Seconds until it fades away. */
  life: number;
  readonly maxLife: number;
}

/** A stroke still being drawn. */
export interface Sketch {
  readonly owner: Fighter;
  readonly points: Vec[];
  /** Ink spent on it so far, refunded if it fizzles. */
  spent: number;
}

interface Rock extends InkStroke {
  readonly kind: 'rock';
  /** Convex outline in body space: the solid shape. */
  readonly hull: readonly Vec[];
  readonly collider: Collider;
  readonly mass: number;
  /** Per fighter: seconds until this rock may hurt them again. */
  readonly cooldowns: Map<Fighter, number>;
  /**
   * Velocity at the end of the previous step: the speed it hit with. By the time a contact
   * is seen, the solver has already slowed the rock down.
   */
  velocity: Vec;
}

export const MAX_INK = 100;
/** Ink refilled per second, and per hit landed: attacking keeps the pen wet. */
const INK_REGEN = 8;
const INK_PER_HIT = 6;
const INK_PER_METER = 12;
/** Strokes shorter than this (m) fizzle, so a stray tap doesn't make anything. */
const MIN_STROKE = 0.4;
/** Sketch points are kept this far apart (m). */
const SPACING = 0.15;
/** Half the thickness of a drawn line's solid body (m). */
export const LINE_RADIUS = 0.06;
const LINE_LIFE = 8;
const ROCK_LIFE = 6;
/** A stroke ending this close (m) to where it started is a closed shape: a boulder. */
const CLOSE_DISTANCE = 0.45;
/** Closed shapes smaller than this (m²) are just scribbles, kept as lines. */
const MIN_ROCK_AREA = 0.06;
/** Mass per square meter: a fist-sized circle is light, a big one outweighs a fighter. */
const ROCK_DENSITY = 80;
/** Ink never appears this close (m) to a fighter, so nobody gets stuck inside a drawing. */
const FIGHTER_CLEARANCE = 0.16;
/** A rock must be moving at least this fast (m/s) to hurt: falling, not lying there. */
const CRUSH_SPEED = 4;
/** Damage per unit of impact momentum (kg·m/s), within these bounds. */
const CRUSH_PER_MOMENTUM = 0.04;
const CRUSH_MIN = 5;
const CRUSH_MAX = 22;
const CRUSH_STUN = 0.45;
/** Launch (m/s) for someone a rock hits: knocked aside and popped up a little. */
const CRUSH_LAUNCH = { x: 4, y: -4 };
/** The same rock can't hurt the same fighter again for this long. */
const CRUSH_COOLDOWN = 0.6;
/** Oldest drawings vanish beyond this many per player. */
const MAX_STROKES_EACH = 4;

/**
 * The draw-to-fight mechanic. Each fighter has an ink meter; a stroke drawn with it
 * becomes solid when finished. Has no Phaser dependency, so tests and the computer player
 * draw through the same calls as a finger or the mouse.
 */
export class Ink {
  readonly strokes: InkStroke[] = [];
  readonly sketches = new Map<Fighter, Sketch>();
  private readonly levels = new Map<Fighter, number>();
  /** Which fighter each body-part collider belongs to, for rock hits. */
  private readonly partOwners = new Map<number, Fighter>();
  private nextId = 1;

  constructor(
    private readonly physics: PhysicsWorld,
    private readonly fighters: readonly Fighter[],
  ) {
    for (const fighter of fighters) {
      this.levels.set(fighter, MAX_INK);
      for (const body of Object.values(fighter.man.parts)) {
        for (let i = 0; i < body.numColliders(); i++) this.partOwners.set(body.collider(i).handle, fighter);
      }
    }
  }

  /** Ink left, 0..MAX_INK. */
  level(fighter: Fighter): number {
    return this.levels.get(fighter) ?? 0;
  }

  setLevel(fighter: Fighter, value: number): void {
    this.levels.set(fighter, clamp(value, 0, MAX_INK));
  }

  /** Starts a stroke at `point`; false if there isn't enough ink to make anything. */
  begin(fighter: Fighter, point: Vec): boolean {
    if (fighter.knockedOut || this.level(fighter) < MIN_STROKE * INK_PER_METER) return false;
    this.sketches.set(fighter, { owner: fighter, points: [{ ...point }], spent: 0 });
    return true;
  }

  /** Draws the stroke on toward `point`, for as long as the ink lasts. */
  extend(fighter: Fighter, point: Vec): void {
    const sketch = this.sketches.get(fighter);
    if (!sketch) return;
    const cost = SPACING * INK_PER_METER;
    let last = sketch.points[sketch.points.length - 1];
    let distance = Math.hypot(point.x - last.x, point.y - last.y);
    while (distance >= SPACING && this.level(fighter) >= cost) {
      const t = SPACING / distance;
      last = { x: last.x + (point.x - last.x) * t, y: last.y + (point.y - last.y) * t };
      sketch.points.push(last);
      sketch.spent += cost;
      this.setLevel(fighter, this.level(fighter) - cost);
      distance -= SPACING;
    }
  }

  /** Finishes the stroke: it becomes a wall or a boulder, or fizzles and the ink comes back. */
  finish(fighter: Fighter, events: EventSink<InkEvent>): InkStroke[] {
    const sketch = this.sketches.get(fighter);
    if (!sketch) return [];
    this.sketches.delete(fighter);
    const points = sketch.points;
    const length = (points.length - 1) * SPACING;
    const first = points[0];
    const last = points[points.length - 1];
    const fizzle = () => {
      this.setLevel(fighter, this.level(fighter) + sketch.spent);
      events.push({ type: 'inkFizzle', owner: fighter, point: { ...last } });
      return [];
    };
    if (length < MIN_STROKE) return fizzle();

    const closed = length >= CLOSE_DISTANCE * 3 && Math.hypot(last.x - first.x, last.y - first.y) <= CLOSE_DISTANCE;
    if (closed && polygonArea(convexHull(points)) >= MIN_ROCK_AREA) {
      const rock = this.makeRock(fighter, points);
      if (!rock) return fizzle();
      this.add(rock);
      events.push({ type: 'inkDrawn', owner: fighter, kind: 'rock', point: centroid(points) });
      return [rock];
    }

    const lines = this.clearRuns(points).map((run) => this.makeLine(fighter, run, LINE_LIFE));
    if (lines.length === 0) return fizzle();
    for (const line of lines) this.add(line);
    events.push({ type: 'inkDrawn', owner: fighter, kind: 'line', point: centroid(points) });
    return lines;
  }

  /** Drops a stroke in progress without making anything. */
  cancel(fighter: Fighter): void {
    this.sketches.delete(fighter);
  }

  /** Landing a hit refills a little ink. */
  rewardHit(fighter: Fighter): void {
    this.setLevel(fighter, this.level(fighter) + INK_PER_HIT);
  }

  /**
   * After the physics step: refills ink, ages drawings, lets falling rocks hurt whoever
   * they land on, and lets the eraser rub out anything in its path.
   */
  step(dt: number, events: EventSink<InkEvent>, eraser: InkEraser | null): void {
    for (const fighter of this.fighters) {
      this.setLevel(fighter, this.level(fighter) + INK_REGEN * dt);
      if (fighter.knockedOut) this.cancel(fighter);
    }
    for (const stroke of [...this.strokes]) {
      stroke.life -= dt;
      if (stroke.life <= 0) {
        this.remove(stroke);
        continue;
      }
      if (stroke.kind === 'rock') this.crush(stroke as Rock, dt, events);
    }
    if (eraser?.phase === 'sweeping') this.erase(eraser, events);
  }

  /** What drawing, if any, a point (m) is inside: thrown stars stop on ink. */
  blocks(point: Vec): InkKind | null {
    for (const stroke of this.strokes) {
      if (stroke.kind === 'line') {
        const p = stroke.points;
        for (let i = 1; i < p.length; i++) if (distanceToSegment(point, p[i - 1], p[i]) <= LINE_RADIUS + 0.02) return 'line';
      } else if (insideConvex(toBody(stroke.body, point), (stroke as Rock).hull, 0.03)) {
        return 'rock';
      }
    }
    return null;
  }

  /** Removes every drawing and refills everyone, for a new round. */
  reset(): void {
    for (const stroke of [...this.strokes]) this.remove(stroke);
    this.sketches.clear();
    for (const fighter of this.fighters) this.levels.set(fighter, MAX_INK);
  }

  private add(stroke: InkStroke): void {
    this.strokes.push(stroke);
    const own = this.strokes.filter((s) => s.owner === stroke.owner);
    if (own.length > MAX_STROKES_EACH) this.remove(own[0]);
  }

  private remove(stroke: InkStroke): void {
    const i = this.strokes.indexOf(stroke);
    if (i >= 0) this.strokes.splice(i, 1);
    if (stroke.kind === 'rock') this.physics.lowestPointOf.delete((stroke as Rock).collider.handle);
    this.physics.world.removeRigidBody(stroke.body);
  }

  /** Splits a stroke around fighters: the runs of points far enough from everyone. */
  private clearRuns(points: readonly Vec[]): Vec[][] {
    const clear = (p: Vec) =>
      this.fighters.every((f) => f.man.nearestPart(p).distance > FIGHTER_CLEARANCE + LINE_RADIUS);
    const runs: Vec[][] = [];
    let run: Vec[] = [];
    for (const p of points) {
      if (clear(p)) {
        run.push(p);
      } else {
        runs.push(run);
        run = [];
      }
    }
    runs.push(run);
    return runs.filter((r) => r.length >= 2 && (r.length - 1) * SPACING >= MIN_STROKE / 2);
  }

  /** A fixed body made of capsules along the stroke, so it's solid from every side. */
  private makeLine(owner: Fighter, points: Vec[], life: number): InkStroke {
    const world = this.physics.world;
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      // Capsules run along their local y axis; turn that axis onto the segment.
      const desc = RAPIER.ColliderDesc.capsule(Math.hypot(dx, dy) / 2, LINE_RADIUS)
        .setTranslation((a.x + b.x) / 2, (a.y + b.y) / 2)
        .setRotation(Math.atan2(-dx, dy))
        .setFriction(0.8)
        .setCollisionGroups(interactionGroups(WORLD_BIT, ALL_BITS));
      world.createCollider(desc, body);
    }
    return { id: this.nextId++, owner, kind: 'line', points, body, life, maxLife: LINE_LIFE };
  }

  /** A dynamic convex boulder with the drawn outline, or null if it would land inside a fighter. */
  private makeRock(owner: Fighter, points: Vec[]): Rock | null {
    const center = centroid(points);
    const outline = points.map((p) => ({ x: p.x - center.x, y: p.y - center.y }));
    const hull = convexHull(outline);
    const reach = Math.max(...hull.map((p) => Math.hypot(p.x, p.y)));
    if (this.fighters.some((f) => f.man.nearestPart(center).distance < reach + 0.05)) return null;
    const desc = RAPIER.ColliderDesc.convexHull(new Float32Array(hull.flatMap((p) => [p.x, p.y])));
    if (!desc) return null;
    const world = this.physics.world;
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(center.x, center.y).setAngularDamping(0.4).setCcdEnabled(true),
    );
    const collider = world.createCollider(
      desc
        .setDensity(ROCK_DENSITY)
        .setFriction(0.7)
        .setRestitution(0.15)
        .setCollisionGroups(interactionGroups(WORLD_BIT, ALL_BITS)),
      body,
    );
    // One-way platforms need the rock's true lowest point, which Rapier can't give for a polygon.
    this.physics.lowestPointOf.set(collider.handle, () => {
      const t = body.translation();
      const angle = body.rotation();
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      return t.y + Math.max(...hull.map((p) => p.x * sin + p.y * cos));
    });
    return {
      id: this.nextId++,
      owner,
      kind: 'rock',
      points: outline,
      body,
      life: ROCK_LIFE,
      maxLife: ROCK_LIFE,
      hull,
      collider,
      mass: body.mass(),
      cooldowns: new Map(),
      velocity: { x: 0, y: 0 },
    };
  }

  /** A falling rock hurts the fighters it touches, its owner included. */
  private crush(rock: Rock, dt: number, events: EventSink<InkEvent>): void {
    for (const [fighter, t] of rock.cooldowns) rock.cooldowns.set(fighter, t - dt);
    const v = rock.velocity;
    const now = rock.body.linvel();
    rock.velocity = { x: now.x, y: now.y };
    const speed = Math.hypot(v.x, v.y);
    if (speed < CRUSH_SPEED) return;
    const world = this.physics.world;
    // Collect first, query after: no calls back into Rapier from inside its iteration.
    const touching: Collider[] = [];
    world.contactPairsWith(rock.collider, (other) => touching.push(other));
    for (const other of touching) {
      const victim = this.partOwners.get(other.handle);
      if (!victim || (rock.cooldowns.get(victim) ?? 0) > 0) continue;
      let contact: Vec | null = null;
      world.contactPair(rock.collider, other, (manifold) => {
        if (manifold.numContacts() > 0) contact = manifold.solverContactPoint(0) ?? other.translation();
      });
      if (!contact) continue;
      // Hurts by its own speed: whatever it touched first (often a raised arm) has already
      // been knocked along with it, so the speed between them says little.
      const damage = victim.knockedOut ? 0 : Math.round(clamp(rock.mass * speed * CRUSH_PER_MOMENTUM, CRUSH_MIN, CRUSH_MAX));
      const away = Math.sign(other.translation().x - rock.body.translation().x) || 1;
      const ko = victim.hurt(damage, { x: away * CRUSH_LAUNCH.x, y: CRUSH_LAUNCH.y }, CRUSH_STUN);
      rock.cooldowns.set(victim, CRUSH_COOLDOWN);
      events.push({ type: 'inkCrush', owner: rock.owner, victim, point: { ...(contact as Vec) }, damage, ko });
    }
  }

  /** The eraser rubs out rocks and the parts of lines inside its box. */
  private erase(eraser: InkEraser, events: EventSink<InkEvent>): void {
    const inside = (p: Vec, margin: number) => Math.abs(p.x - eraser.x) <= eraser.halfWidth + margin && p.y >= eraser.top - margin;
    for (const stroke of [...this.strokes]) {
      if (stroke.kind === 'rock') {
        const reach = Math.max(...(stroke as Rock).hull.map((p) => Math.hypot(p.x, p.y)));
        const center = stroke.body.translation();
        if (inside(center, reach)) {
          this.remove(stroke);
          events.push({ type: 'inkErased', point: { x: center.x, y: center.y } });
        }
        continue;
      }
      const hit = stroke.points.findIndex((p) => inside(p, LINE_RADIUS));
      if (hit < 0) continue;
      // Keep what's outside the eraser as separate, shorter lines.
      const runs: Vec[][] = [];
      let run: Vec[] = [];
      for (const p of stroke.points) {
        if (inside(p, LINE_RADIUS)) {
          runs.push(run);
          run = [];
        } else {
          run.push(p);
        }
      }
      runs.push(run);
      this.remove(stroke);
      for (const kept of runs.filter((r) => r.length >= 2)) {
        this.strokes.push(this.makeLine(stroke.owner, kept, stroke.life));
      }
      events.push({ type: 'inkErased', point: { ...stroke.points[hit] } });
    }
  }
}

function centroid(points: readonly Vec[]): Vec {
  const sum = points.reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

/** Convex hull by the monotone chain method, counter-clockwise (in y-up terms). */
export function convexHull(points: readonly Vec[]): Vec[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (sorted.length < 3) return sorted;
  const cross = (o: Vec, a: Vec, b: Vec) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const half = (pts: Vec[]) => {
    const out: Vec[] = [];
    for (const p of pts) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    out.pop();
    return out;
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}

export function polygonArea(points: readonly Vec[]): number {
  let twice = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    twice += a.x * b.y - b.x * a.y;
  }
  return Math.abs(twice) / 2;
}

/** A world point in a body's local frame. */
function toBody(body: RigidBody, p: Vec): Vec {
  const t = body.translation();
  const angle = -body.rotation();
  const dx = p.x - t.x;
  const dy = p.y - t.y;
  return { x: dx * Math.cos(angle) - dy * Math.sin(angle), y: dx * Math.sin(angle) + dy * Math.cos(angle) };
}

function insideConvex(p: Vec, hull: readonly Vec[], margin: number): boolean {
  let inside = true;
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    if ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) < 0) inside = false;
  }
  if (inside) return true;
  for (let i = 0; i < hull.length; i++) {
    if (distanceToSegment(p, hull[i], hull[(i + 1) % hull.length]) <= margin) return true;
  }
  return false;
}
