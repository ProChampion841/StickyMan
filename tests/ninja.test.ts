import { beforeAll, describe, expect, it } from 'vitest';
import { type CombatEvent, Fighter, MAX_HP, type MoveName } from '../src/combat/Fighter';
import { TUNING } from '../src/config';
import { FLOOR_Y } from '../src/game/level';
import { INTRO_TIME, Match, type MatchEvent } from '../src/game/Match';
import { FIXED_DT, PhysicsWorld } from '../src/physics/PhysicsWorld';
import { initRapier } from '../src/physics/rapier';
import { Stickman } from '../src/stickman/Stickman';
import { seededRng } from '../src/util/random';

const FLOOR = 10;

beforeAll(async () => {
  await initRapier();
});

/** Two fighters on a long floor (victim far away unless `gap` is given), plus a step helper. */
function arena(gap = 50) {
  const physics = new PhysicsWorld();
  physics.addStaticBox({ x: -100, y: FLOOR, w: 200, h: 2 });
  const a = new Fighter(new Stickman(physics, { index: 0, spawn: { x: 0, y: FLOOR }, facing: 1 }));
  const b = new Fighter(new Stickman(physics, { index: 1, spawn: { x: gap, y: FLOOR }, facing: -1 }));
  const fighters = [a, b];
  const events: CombatEvent[] = [];
  const step = (seconds = FIXED_DT) => {
    for (let i = 0; i < Math.round(seconds / FIXED_DT); i++) {
      for (const f of fighters) f.preStep(FIXED_DT, events, fighters);
      for (const f of fighters) f.man.preStep(FIXED_DT);
      physics.step();
      for (const f of fighters) f.postStep(fighters, events);
    }
  };
  step(0.5);
  return { physics, a, b, fighters, events, step };
}

const swings = (events: CombatEvent[]) => events.flatMap((e) => (e.type === 'swing' ? [e.move] : []));
const hits = (events: CombatEvent[]) => events.flatMap((e) => (e.type === 'hit' ? [e] : []));
const height = (man: Stickman) => FLOOR - man.pelvis().y;

describe('Ninja moves', () => {
  it('picks the move from context: down, a dash, or the air', () => {
    const cases: [string, (w: ReturnType<typeof arena>) => void, MoveName][] = [
      ['down + punch', (w) => ((w.a.man.input.down = true), w.a.queuePunch()), 'risingDragon'],
      ['down + kick', (w) => ((w.a.man.input.down = true), w.a.queueKick()), 'legSweep'],
      ['dash + punch', (w) => (w.a.queueDash(1), w.step(FIXED_DT * 2), w.a.queuePunch()), 'dashStrike'],
      ['dash + kick', (w) => (w.a.queueDash(1), w.step(FIXED_DT * 2), w.a.queueKick()), 'flyingKnee'],
      ['air punch', (w) => (w.a.man.queueJump(), w.step(0.2), w.a.queuePunch()), 'airChop'],
      ['air kick', (w) => (w.a.man.queueJump(), w.step(0.2), w.a.queueKick()), 'diveKick'],
      [
        'air down + kick',
        (w) => (w.a.man.queueJump(), w.step(0.2), (w.a.man.input.down = true), w.a.queueKick()),
        'meteorStomp',
      ],
      ['special', (w) => w.a.queueSpecial(), 'shuriken'],
      ['down + special', (w) => ((w.a.man.input.down = true), w.a.queueSpecial()), 'smokeVanish'],
    ];
    for (const [label, press, expected] of cases) {
      const world = arena();
      world.a.man.input.jumpHeld = true;
      press(world);
      world.step(0.3);
      expect(swings(world.events), label).toEqual([expected]);
    }
  });

  it('forgives presses a moment apart: down just after the button, punch late in a dash', () => {
    const late = arena();
    late.a.queuePunch();
    late.step(FIXED_DT * 2);
    late.a.man.input.down = true;
    late.step(0.3);
    expect(swings(late.events)).toEqual(['risingDragon']);
    const dash = arena();
    dash.a.queueDash(1);
    dash.step(0.3);
    dash.a.queuePunch();
    dash.step(0.3);
    expect(swings(dash.events)).toEqual(['dashStrike']);
  });

  it('trips with a leg sweep: the victim hits the floor, then gets back up', () => {
    const { a, b, events, step } = arena(1);
    a.man.input.down = true;
    a.queueKick();
    step(0.4);
    a.man.input.down = false;
    expect(hits(events)[0]).toMatchObject({ move: 'legSweep', knockdown: true });
    expect(b.knockedDown).toBe(true);
    expect(b.man.limp).toBe(true);
    step(2.5);
    expect(b.knockedDown).toBe(false);
    expect(b.man.grounded).toBe(true);
    expect(Math.abs(b.man.torsoAngle())).toBeLessThan(0.2);
  });

  it('juggles: rising dragon launches, an air chop and a dive kick follow it up', () => {
    const { a, b, events, step } = arena(0.9);
    b.hp = 1e9;
    a.man.input.down = true;
    a.queuePunch();
    step(FIXED_DT * 2);
    a.man.input.down = false;
    for (let i = 0; i < 40 && hits(events).length === 0; i++) step();
    // Mash like a player: the next button every 6 steps.
    const presses = ['P', 'P', 'K'];
    for (let i = 0; i < 90; i++) {
      if (i % 6 === 0 && presses.length) {
        if (presses.shift() === 'P') a.queuePunch();
        else a.queueKick();
      }
      step();
    }
    expect(hits(events).map((h) => h.move)).toEqual(['risingDragon', 'airChop', 'diveKick']);
  });

  it('lands every flip on its feet', () => {
    for (const presses of [['dP'], ['K', 'K', 'K'], ['jump', 'jump']]) {
      const { a, step } = arena();
      for (const press of presses) {
        if (press === 'jump') {
          a.man.input.jumpHeld = true;
          a.man.queueJump();
          step(0.25);
          continue;
        }
        a.man.input.down = press === 'dP';
        if (press.endsWith('P')) a.queuePunch();
        else a.queueKick();
        step(FIXED_DT);
        while (a.attacking) step();
        a.man.input.down = false;
      }
      a.man.input.jumpHeld = false;
      step(1.5);
      expect(a.man.grounded, presses.join(',')).toBe(true);
      expect(Math.abs(a.man.torsoAngle()), presses.join(',')).toBeLessThan(0.2);
    }
  });
});

describe('Ninja movement', () => {
  /** Peak pelvis height (m) for a jump, optionally followed by a second press at the given delay. */
  function peakJump(secondPressAfter: number | null) {
    const { a, step } = arena();
    a.man.input.jumpHeld = true;
    a.man.queueJump();
    let peak = 0;
    for (let i = 0; i < 90; i++) {
      if (secondPressAfter !== null && i === Math.round(secondPressAfter / FIXED_DT)) a.man.queueJump();
      step();
      peak = Math.max(peak, height(a.man));
    }
    return { peak, a, step };
  }

  it('double jumps higher than a single jump, with a flip, and lands upright', () => {
    const single = peakJump(null).peak;
    const { peak, a, step } = peakJump(0.3);
    expect(peak).toBeGreaterThan(single + 1);
    step(1.5);
    expect(a.man.grounded).toBe(true);
    expect(Math.abs(a.man.torsoAngle())).toBeLessThan(0.2);
  });

  it('wall jumps off a wall beside it, and never climbs it by walking', () => {
    const { physics, a, step } = arena();
    physics.addStaticBox({ x: 1.0, y: FLOOR - 6, w: 0.5, h: 6 });
    // Walking into the wall keeps the fighter on the floor.
    a.man.input.move = 1;
    step(1);
    expect(height(a.man)).toBeLessThan(TUNING.hoverHeight + 0.2);
    a.man.input.jumpHeld = true;
    a.man.queueJump();
    step(0.3);
    a.man.input.move = 0;
    a.man.queueJump();
    step(FIXED_DT * 2);
    const after = a.man.centerOfMassVelocity();
    expect(a.man.motions).toEqual(['jump', 'wallJump']);
    expect(after.x).toBeLessThan(-4);
    expect(after.y).toBeLessThan(-5);
  });

  it('dashes several meters in a blink, and crouches low', () => {
    const { a, step } = arena();
    const start = a.man.centerOfMass().x;
    a.queueDash(1);
    step(0.3);
    expect(a.man.centerOfMass().x - start).toBeGreaterThan(2);
    a.man.input.down = true;
    step(0.5);
    expect(height(a.man)).toBeLessThan(TUNING.hoverHeight - 0.15);
  });
});

describe('Specials', () => {
  /** A versus match in its fight phase, fighters `gap` apart in the middle of the arena. */
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

  it('throws a shuriken that hits from across the arena, then has to cool down', () => {
    const { a, b, events, play } = fight(6);
    a.queueSpecial();
    play(0.4);
    // Still cooling down: a second press throws nothing.
    a.queueSpecial();
    play(0.6);
    expect(b.hp).toBe(MAX_HP - TUNING.shurikenDamage);
    expect(events.filter((e) => e.type === 'special')).toHaveLength(1);
  });

  it('sticks a shuriken in the wall when it misses', () => {
    const { match, a, events, play } = fight(6);
    a.man.reset({ x: 6, y: FLOOR_Y });
    a.man.facing = -1;
    a.queueSpecial();
    play(1);
    expect(events.some((e) => e.type === 'shurikenStuck')).toBe(true);
    play(1);
    expect(match.shurikens).toHaveLength(0);
  });

  it('vanishes in smoke and reappears behind the opponent, facing their back', () => {
    const { a, b, events, play } = fight(4);
    a.man.input.down = true;
    a.queueSpecial();
    play(0.3);
    a.man.input.down = false;
    expect(events.some((e) => e.type === 'vanish')).toBe(true);
    const ax = a.man.centerOfMass().x;
    const bx = b.man.centerOfMass().x;
    // b faces left (toward where a was); a is now on b's right, facing left at b's back.
    expect(ax).toBeGreaterThan(bx);
    expect(a.man.facing).toBe(-1);
    play(1);
    expect(a.man.grounded).toBe(true);
  });
});
