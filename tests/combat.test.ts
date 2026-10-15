import { beforeAll, describe, expect, it } from 'vitest';
import { type CombatEvent, Fighter, KO_TIME, MAX_HP } from '../src/combat/Fighter';
import { TUNING } from '../src/config';
import { FIXED_DT, PhysicsWorld } from '../src/physics/PhysicsWorld';
import { initRapier } from '../src/physics/rapier';
import { Stickman } from '../src/stickman/Stickman';

const FLOOR_Y = 10;

beforeAll(async () => {
  await initRapier();
});

/** Two fighters facing each other, `gap` meters apart. */
function duel(gap: number) {
  const physics = new PhysicsWorld();
  physics.addStaticBox({ x: -100, y: FLOOR_Y, w: 200, h: 2 });
  const a = new Fighter(new Stickman(physics, { index: 0, spawn: { x: -gap / 2, y: FLOOR_Y }, facing: 1 }));
  const b = new Fighter(new Stickman(physics, { index: 1, spawn: { x: gap / 2, y: FLOOR_Y }, facing: -1 }));
  return { physics, a, b, fighters: [a, b] };
}

function simulate(physics: PhysicsWorld, fighters: Fighter[], seconds: number, events: CombatEvent[] = []) {
  for (let i = 0; i < Math.round(seconds / FIXED_DT); i++) {
    for (const f of fighters) f.preStep(FIXED_DT, events, fighters);
    for (const f of fighters) f.man.preStep(FIXED_DT);
    physics.step();
    for (const f of fighters) f.postStep(fighters, events);
  }
  return events;
}

const hits = (events: CombatEvent[]) => events.filter((e) => e.type === 'hit');

describe('Fighter punch', () => {
  it('lands once at close range and pushes the victim back', () => {
    const { physics, a, b, fighters } = duel(0.9);
    simulate(physics, fighters, 0.5);
    const before = b.man.centerOfMass().x;
    a.queuePunch();
    const events = simulate(physics, fighters, 0.5);
    expect(hits(events)).toHaveLength(1);
    expect(b.hp).toBeLessThan(MAX_HP);
    expect(b.man.centerOfMass().x - before).toBeGreaterThan(0.1);
  });

  it('lands at point-blank range, where the fist reaches past the body', () => {
    for (const attacker of [0, 1]) {
      const { physics, fighters } = duel(0.35);
      simulate(physics, fighters, 0.3);
      fighters[attacker].queuePunch();
      const events = simulate(physics, fighters, 0.4);
      expect(hits(events)).toHaveLength(1);
    }
  });

  it('pushes a combo victim back without letting the attacker bulldoze them across the arena', () => {
    const { physics, a, b, fighters } = duel(1.2);
    simulate(physics, fighters, 0.5);
    const start = b.man.centerOfMass().x;
    a.man.input.move = 1;
    for (let p = 0; p < 4; p++) {
      a.queuePunch();
      simulate(physics, fighters, 20 * FIXED_DT);
    }
    a.man.input.move = 0;
    simulate(physics, fighters, 1);
    expect(b.man.centerOfMass().x - start).toBeLessThan(5);
  });

  it('kicks reach further than punches and hit harder', () => {
    const attack = (kind: 'punch' | 'kick') => {
      const { physics, a, b, fighters } = duel(1.25);
      simulate(physics, fighters, 0.5);
      const start = b.man.centerOfMass().x;
      if (kind === 'punch') a.queuePunch();
      else a.queueKick();
      const events = simulate(physics, fighters, 1);
      return { hits: hits(events), slide: b.man.centerOfMass().x - start, attacker: a };
    };
    expect(attack('punch').hits).toHaveLength(0);
    const kick = attack('kick');
    expect(kick.hits).toHaveLength(1);
    expect(kick.hits[0]).toMatchObject({ kind: 'kick', move: 'snapKick' });
    expect(kick.hits[0].damage).toBeGreaterThan(TUNING.punchDamage);
    // The kicker stays on its feet.
    expect(kick.attacker.man.grounded).toBe(true);
    expect(Math.abs(kick.attacker.man.torsoAngle())).toBeLessThan(0.15);
  });

  it('whiffs out of range but still swings', () => {
    const { physics, a, fighters } = duel(3);
    simulate(physics, fighters, 0.5);
    a.queuePunch();
    const events = simulate(physics, fighters, 0.5);
    expect(events.some((e) => e.type === 'swing')).toBe(true);
    expect(hits(events)).toHaveLength(0);
  });

  /** Presses each button as soon as the previous move has finished (well inside the combo window). */
  function chain(presses: ('punch' | 'kick' | 'jump')[], gap = 3) {
    const { physics, a, fighters } = duel(gap);
    simulate(physics, fighters, 0.5);
    const events: CombatEvent[] = [];
    for (const press of presses) {
      if (press === 'jump') {
        a.man.input.jumpHeld = true;
        a.man.queueJump();
        simulate(physics, fighters, 0.15, events);
        continue;
      }
      // Ground combo presses wait for the feet to be down (a launcher's hop lands first).
      if (presses[presses.indexOf(press) - 1] !== 'jump') while (!a.man.grounded) simulate(physics, fighters, FIXED_DT, events);
      if (press === 'punch') a.queuePunch();
      else a.queueKick();
      simulate(physics, fighters, FIXED_DT, events);
      while (a.attacking) simulate(physics, fighters, FIXED_DT, events);
    }
    return events.flatMap((e) => (e.type === 'swing' ? [e.move] : []));
  }

  it('chains punches into palm strike, elbow smash, rising dragon, then starts over', () => {
    expect(chain(['punch', 'punch', 'punch', 'punch'])).toEqual(['palmStrike', 'elbowSmash', 'risingDragon', 'palmStrike']);
  });

  it('chains kicks into snap kick, spin kick, tornado kick, and mixes freely with punches', () => {
    expect(chain(['kick', 'kick', 'kick'])).toEqual(['snapKick', 'spinKick', 'tornadoKick']);
    expect(chain(['punch', 'kick', 'kick'])).toEqual(['palmStrike', 'spinKick', 'tornadoKick']);
    expect(chain(['kick', 'punch', 'punch'])).toEqual(['snapKick', 'elbowSmash', 'risingDragon']);
    expect(chain(['jump', 'kick'])).toEqual(['diveKick']);
  });

  it('lands combos when mashing punch while pressing forward, without climbing onto the victim', () => {
    const { physics, a, b, fighters } = duel(1.2);
    b.recovers = true;
    simulate(physics, fighters, 0.5);
    a.man.input.move = 1;
    const events: CombatEvent[] = [];
    let highestPelvis = Infinity;
    for (let i = 0; i < 3 / FIXED_DT; i++) {
      if (!a.attacking) a.queuePunch();
      simulate(physics, fighters, FIXED_DT, events);
      if (a.man.grounded) highestPelvis = Math.min(highestPelvis, a.man.pelvis().y);
    }
    expect(hits(events).length).toBeGreaterThanOrEqual(4);
    expect(b.hp).toBeLessThanOrEqual(MAX_HP - 25);
    // Whenever it stands, it stands on the floor, never on the victim (pelvis 0.8 m standing).
    expect(FLOOR_Y - highestPelvis).toBeLessThan(1.3);
  });

  it('knocks out at zero health, then gets back up with full health', () => {
    const { physics, a, b, fighters } = duel(0.9);
    simulate(physics, fighters, 0.5);
    b.hp = 1;
    a.queuePunch();
    const events = simulate(physics, fighters, 0.5);
    expect(hits(events)[0]).toMatchObject({ ko: true });
    expect(b.knockedOut).toBe(true);
    expect(b.man.limp).toBe(true);

    simulate(physics, fighters, KO_TIME + 2.5);
    expect(b.knockedOut).toBe(false);
    expect(b.hp).toBe(MAX_HP);
    expect(b.man.limp).toBe(false);
    expect(b.man.grounded).toBe(true);
    expect(Math.abs(b.man.torsoAngle())).toBeLessThan(0.2);
  });

  it('staggers the victim and recovers its balance afterwards', () => {
    const { physics, a, b, fighters } = duel(0.9);
    simulate(physics, fighters, 0.5);
    a.queuePunch();
    const events: CombatEvent[] = [];
    for (let i = 0; i < 30 && hits(events).length === 0; i++) simulate(physics, fighters, FIXED_DT, events);
    expect(hits(events)).toHaveLength(1);
    expect(b.man.stunned).toBe(true);
    simulate(physics, fighters, TUNING.stunTime * 1.5 + 1.5);
    expect(b.man.stunned).toBe(false);
    expect(b.man.grounded).toBe(true);
    expect(Math.abs(b.man.torsoAngle())).toBeLessThan(0.15);
  });
});
