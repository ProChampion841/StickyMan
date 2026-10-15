import { beforeAll, describe, expect, it } from 'vitest';
import { Fighter, MAX_HP } from '../src/combat/Fighter';
import { TUNING } from '../src/config';
import { Ink, type InkEvent, LINE_RADIUS, MAX_INK } from '../src/game/Ink';
import { FLOOR_Y } from '../src/game/level';
import { INTRO_TIME, Match, type MatchEvent, ROUND_OVER_TIME } from '../src/game/Match';
import { FIXED_DT, PhysicsWorld } from '../src/physics/PhysicsWorld';
import { initRapier } from '../src/physics/rapier';
import { Stickman } from '../src/stickman/Stickman';
import type { EventSink } from '../src/util/events';
import type { Vec } from '../src/util/math';
import { seededRng } from '../src/util/random';

const FLOOR = 10;

beforeAll(async () => {
  await initRapier();
});

/** Two fighters far apart on a long floor, their ink, and a step helper. */
function world() {
  const physics = new PhysicsWorld();
  physics.addStaticBox({ x: -100, y: FLOOR, w: 200, h: 2 });
  const a = new Fighter(new Stickman(physics, { index: 0, spawn: { x: 0, y: FLOOR }, facing: 1 }));
  const b = new Fighter(new Stickman(physics, { index: 1, spawn: { x: 10, y: FLOOR }, facing: -1 }));
  const fighters = [a, b];
  const ink = new Ink(physics, fighters);
  const events: InkEvent[] = [];
  const step = (seconds = FIXED_DT) => {
    for (let i = 0; i < Math.round(seconds / FIXED_DT); i++) {
      for (const f of fighters) f.preStep(FIXED_DT, [], fighters);
      for (const f of fighters) f.man.preStep(FIXED_DT);
      physics.step();
      for (const f of fighters) f.postStep(fighters, []);
      ink.step(FIXED_DT, events, null);
    }
  };
  step(0.5);
  return { physics, a, b, ink, events, step };
}

/** Draws `points` as one stroke, like a finger dragged through them. */
function draw(ink: Ink, fighter: Fighter, points: Vec[], events: EventSink<InkEvent>) {
  ink.begin(fighter, points[0]);
  for (const p of points.slice(1)) ink.extend(fighter, p);
  return ink.finish(fighter, events);
}

const line = (from: Vec, to: Vec, n = 20): Vec[] =>
  Array.from({ length: n + 1 }, (_, i) => ({ x: from.x + ((to.x - from.x) * i) / n, y: from.y + ((to.y - from.y) * i) / n }));

const circle = (center: Vec, r: number, n = 28): Vec[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const angle = (i / n) * Math.PI * 2;
    return { x: center.x + Math.cos(angle) * r, y: center.y + Math.sin(angle) * r };
  });

describe('Ink', () => {
  it('turns a drawn line into a solid platform a fighter can stand on', () => {
    const { a, ink, events, step } = world();
    const made = draw(ink, a, line({ x: 3, y: FLOOR - 3 }, { x: 6, y: FLOOR - 3 }), events);
    expect(made.map((s) => s.kind)).toEqual(['line']);
    expect(events.map((e) => e.type)).toEqual(['inkDrawn']);
    a.man.reset({ x: 4.5, y: FLOOR - 3.3 });
    step(1.5);
    expect(a.man.grounded).toBe(true);
    expect(FLOOR - a.man.pelvis().y).toBeGreaterThan(3);
  });

  it('spends ink by length, refills it over time, and draws nothing from an empty pen', () => {
    const { a, ink, events, step } = world();
    draw(ink, a, line({ x: 3, y: 5 }, { x: 6, y: 5 }), events);
    const afterLine = ink.level(a);
    expect(afterLine).toBeLessThan(MAX_INK - 30);
    step(1);
    expect(ink.level(a)).toBeGreaterThan(afterLine + 5);
    ink.setLevel(a, 0);
    expect(ink.begin(a, { x: 3, y: 4 })).toBe(false);
    // A pen running dry mid-stroke just stops the line short.
    ink.setLevel(a, 20);
    const [short] = draw(ink, a, line({ x: -6, y: 4 }, { x: -1, y: 4 }), events);
    // 20 ink buys about 1.6 m of the 5 m asked for.
    expect(short.points.length).toBeLessThan(15);
  });

  it('fizzles a tiny stroke and gives the ink back', () => {
    const { a, ink, events } = world();
    const before = ink.level(a);
    expect(draw(ink, a, line({ x: 3, y: 5 }, { x: 3.2, y: 5 }, 4), events)).toEqual([]);
    expect(events.map((e) => e.type)).toEqual(['inkFizzle']);
    expect(ink.level(a)).toBe(before);
  });

  it('turns a closed loop into a boulder that falls and crushes whoever is below, hurting them', () => {
    const { a, b, ink, events, step } = world();
    const head = b.man.parts.head.translation();
    const [rock] = draw(ink, a, circle({ x: head.x, y: head.y - 2.2 }, 0.35), events);
    expect(rock.kind).toBe('rock');
    step(1.2);
    const crush = events.find((e) => e.type === 'inkCrush');
    expect(crush).toMatchObject({ owner: a, victim: b });
    // A 0.35 m boulder dropped about 1.5 m lands a solid blow, short of the cap.
    expect(b.hp).toBeLessThan(MAX_HP - 8);
    expect(b.hp).toBeGreaterThan(MAX_HP - 22);
  });

  it('never puts ink inside a fighter: a line drawn through one leaves a gap around them', () => {
    const { a, b, ink, events, step } = world();
    const torso = b.man.parts.torso.translation();
    const made = draw(ink, a, line({ x: torso.x - 2, y: torso.y }, { x: torso.x + 2, y: torso.y }), events);
    expect(made).toHaveLength(2);
    for (const stroke of made) {
      for (const p of stroke.points) expect(b.man.nearestPart(p).distance).toBeGreaterThan(LINE_RADIUS);
    }
    // And no boulder appears inside anyone.
    const before = ink.level(a);
    expect(draw(ink, a, circle(torso, 0.4), events)).toEqual([]);
    expect(ink.level(a)).toBeCloseTo(before, 6);
    step(0.5);
    expect(b.man.grounded).toBe(true);
  });

  it('is rubbed out by the eraser: lines lose the part under it, boulders vanish', () => {
    const { a, ink, events } = world();
    draw(ink, a, line({ x: 2, y: FLOOR - 0.4 }, { x: 6, y: FLOOR - 0.4 }), events);
    const eraser = { phase: 'sweeping' as const, x: 4, halfWidth: 0.8, top: FLOOR - 0.85 };
    ink.step(FIXED_DT, events, eraser);
    const lines = ink.strokes.filter((s) => s.kind === 'line');
    expect(lines).toHaveLength(2);
    for (const stroke of lines) for (const p of stroke.points) expect(Math.abs(p.x - 4)).toBeGreaterThan(0.8);
    expect(events.some((e) => e.type === 'inkErased')).toBe(true);
  });

  it('keeps at most four drawings per player, fading the oldest', () => {
    const { a, ink, events } = world();
    for (let i = 0; i < 6; i++) {
      ink.setLevel(a, MAX_INK);
      draw(ink, a, line({ x: 2, y: 2 + i }, { x: 4, y: 2 + i }), events);
    }
    expect(ink.strokes.map((s) => s.points[0].y)).toEqual([4, 5, 6, 7]);
  });

  it('lets lines fade away after a while', () => {
    const { a, ink, events, step } = world();
    draw(ink, a, line({ x: 2, y: 5 }, { x: 4, y: 5 }), events);
    step(9);
    expect(ink.strokes).toHaveLength(0);
  });

  it('stops thrown stars, and tells walls from boulders', () => {
    const { a, ink, events } = world();
    draw(ink, a, line({ x: 3, y: 4 }, { x: 3, y: 7 }), events);
    draw(ink, a, circle({ x: -5, y: 3 }, 0.4), events);
    expect(ink.blocks({ x: 3.03, y: 5 })).toBe('line');
    expect(ink.blocks({ x: -5.1, y: 3.05 })).toBe('rock');
    expect(ink.blocks({ x: 1, y: 5 })).toBeNull();
    expect(TUNING.gravity).toBeGreaterThan(0);
  });
});

describe('Ink in a match', () => {
  /** A versus match in its fight phase, fighters `gap` apart, no eraser. */
  function fight(gap: number) {
    const match = new Match({ mode: 'versus', rng: seededRng(5) });
    const events: MatchEvent[] = [];
    const play = (seconds: number) => {
      for (let i = 0; i < Math.round(seconds / FIXED_DT); i++) match.step(FIXED_DT, events);
    };
    play(INTRO_TIME + 0.1);
    match.eraser.timer = 1e9;
    const [a, b] = match.fighters;
    a.man.reset({ x: 6, y: FLOOR_Y });
    b.man.reset({ x: 6 + gap, y: FLOOR_Y });
    play(0.3);
    return { match, a, b, events, play };
  }

  it('catches a thrown star on a drawn wall', () => {
    const { match, a, b, events, play } = fight(6);
    draw(match.ink, b, line({ x: 9, y: FLOOR_Y - 0.1 }, { x: 9, y: FLOOR_Y - 2 }), events);
    a.queueSpecial();
    play(1);
    expect(b.hp).toBe(MAX_HP);
    expect(events.some((e) => e.type === 'shurikenStuck')).toBe(true);
  });

  it('wipes the page clean and refills everyone for each new round', () => {
    const { match, a, b, events, play } = fight(4);
    draw(match.ink, a, line({ x: 2, y: 4 }, { x: 5, y: 4 }), events);
    expect(match.ink.strokes).toHaveLength(1);
    b.hurt(MAX_HP, { x: 0, y: 0 }, 0);
    play(ROUND_OVER_TIME + 0.2);
    expect(match.round).toBe(2);
    expect(match.ink.strokes).toHaveLength(0);
    expect(match.ink.level(a)).toBe(MAX_INK);
  });

  it('has computer players draw boulders and walls during a match', () => {
    const match = new Match({ mode: 'demo', botLevel: 'hard', rng: seededRng(10) });
    const events: MatchEvent[] = [];
    for (let i = 0; i < Math.round(120 / FIXED_DT) && match.phase !== 'matchOver'; i++) match.step(FIXED_DT, events);
    const drawn = events.flatMap((e) => (e.type === 'inkDrawn' ? [e.kind] : []));
    expect(drawn).toContain('rock');
    expect(drawn).toContain('line');
    expect(events.some((e) => e.type === 'inkCrush')).toBe(true);
  });
});
