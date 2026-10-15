import { beforeAll, describe, expect, it } from 'vitest';
import { TUNING } from '../src/config';
import { FIXED_DT, PhysicsWorld } from '../src/physics/PhysicsWorld';
import { initRapier } from '../src/physics/rapier';
import { Stickman } from '../src/stickman/Stickman';

const FLOOR_Y = 10;

beforeAll(async () => {
  await initRapier();
});

function setup(facing: 1 | -1 = 1) {
  const physics = new PhysicsWorld();
  physics.addStaticBox({ x: -100, y: FLOOR_Y, w: 200, h: 2 });
  const man = new Stickman(physics, { index: 0, spawn: { x: 0, y: FLOOR_Y }, facing });
  return { physics, man };
}

function simulate(physics: PhysicsWorld, man: Stickman, seconds: number, eachStep?: () => void): void {
  const steps = Math.round(seconds / FIXED_DT);
  for (let i = 0; i < steps; i++) {
    eachStep?.();
    man.preStep(FIXED_DT);
    physics.step();
  }
}

const pelvisHeight = (man: Stickman) => FLOOR_Y - man.pelvis().y;

describe('Stickman balance', () => {
  it('stands upright at hover height when idle', () => {
    const { physics, man } = setup();
    simulate(physics, man, 3);
    expect(man.grounded).toBe(true);
    expect(Math.abs(man.torsoAngle())).toBeLessThan(0.12);
    expect(Math.abs(pelvisHeight(man) - TUNING.hoverHeight)).toBeLessThan(0.12);
    expect(Math.abs(man.centerOfMassVelocity().x)).toBeLessThan(0.15);
  });

  it('settles into its stance: upright, front foot ahead, back foot behind', () => {
    for (const facing of [1, -1] as const) {
      const { physics, man } = setup(facing);
      simulate(physics, man, 2);
      const s = man.skeleton();
      const pelvisX = man.pelvis().x;
      expect(Math.abs(man.torsoAngle())).toBeLessThan(0.08);
      expect((s.footL.x - pelvisX) * facing).toBeGreaterThan(0.05);
      expect((s.footR.x - pelvisX) * facing).toBeLessThan(-0.05);
    }
  });

  it('does not creep while idle', () => {
    for (const facing of [1, -1] as const) {
      const { physics, man } = setup(facing);
      simulate(physics, man, 1);
      const startX = man.centerOfMass().x;
      simulate(physics, man, 5);
      expect(Math.abs(man.centerOfMass().x - startX)).toBeLessThan(0.05);
    }
  });

  it('holds its guard: the near fist is ahead of and above its elbow', () => {
    for (const facing of [1, -1] as const) {
      const { physics, man } = setup(facing);
      simulate(physics, man, 2);
      const s = man.skeleton();
      expect((s.handR.x - s.joints.elbowR.x) * facing).toBeGreaterThan(0.1);
      expect(s.handR.y).toBeLessThan(s.joints.elbowR.y);
    }
  });

  it('runs right and left while staying upright', () => {
    for (const dir of [1, -1] as const) {
      const { physics, man } = setup();
      simulate(physics, man, 0.5);
      man.input.move = dir;
      let maxTilt = 0;
      simulate(physics, man, 2, () => {
        maxTilt = Math.max(maxTilt, Math.abs(man.torsoAngle()));
      });
      expect(man.facing).toBe(dir);
      expect(man.centerOfMass().x * dir).toBeGreaterThan(6);
      expect(Math.abs(man.centerOfMassVelocity().x)).toBeGreaterThan(TUNING.maxSpeed * 0.8);
      expect(maxTilt).toBeLessThan(0.5);
      expect(man.grounded).toBe(true);
    }
  });

  it('stops when input is released', () => {
    const { physics, man } = setup();
    man.input.move = 1;
    simulate(physics, man, 1.5);
    man.input.move = 0;
    simulate(physics, man, 1);
    expect(Math.abs(man.centerOfMassVelocity().x)).toBeLessThan(0.2);
    expect(Math.abs(man.torsoAngle())).toBeLessThan(0.15);
  });

  it('jumps over a meter high and lands on its feet', () => {
    const { physics, man } = setup();
    simulate(physics, man, 1);
    man.input.jumpHeld = true;
    man.queueJump();
    let peak = 0;
    simulate(physics, man, 1, () => {
      peak = Math.max(peak, pelvisHeight(man));
    });
    man.input.jumpHeld = false;
    simulate(physics, man, 1.5);
    expect(peak - TUNING.hoverHeight).toBeGreaterThan(1);
    expect(man.grounded).toBe(true);
    expect(Math.abs(man.torsoAngle())).toBeLessThan(0.15);
  });

  it('jumps lower on a tap than on a hold', () => {
    const peakFor = (holdSteps: number) => {
      const { physics, man } = setup();
      simulate(physics, man, 1);
      man.queueJump();
      let peak = 0;
      let step = 0;
      simulate(physics, man, 1, () => {
        man.input.jumpHeld = step++ < holdSteps;
        peak = Math.max(peak, pelvisHeight(man));
      });
      return peak;
    };
    expect(peakFor(3)).toBeLessThan(peakFor(60) - 0.4);
  });

  it('jumps up through a one-way platform and lands on top of it', () => {
    const { physics, man } = setup();
    physics.addStaticBox({ x: -2, y: FLOOR_Y - 2.3, w: 4, h: 0.25, oneWay: true });
    simulate(physics, man, 0.5);
    man.input.jumpHeld = true;
    man.queueJump();
    simulate(physics, man, 0.4);
    man.input.jumpHeld = false;
    simulate(physics, man, 1.5);
    expect(man.grounded).toBe(true);
    expect(Math.abs(pelvisHeight(man) - (2.3 + TUNING.hoverHeight))).toBeLessThan(0.15);
  });

  it('recovers after a hard shove', () => {
    const { physics, man } = setup();
    simulate(physics, man, 1);
    man.parts.torso.applyImpulse({ x: man.mass * 4, y: 0 }, true);
    simulate(physics, man, 3);
    expect(man.grounded).toBe(true);
    expect(Math.abs(man.torsoAngle())).toBeLessThan(0.15);
  });

  it('collapses when limp and gets back up afterwards', () => {
    const { physics, man } = setup();
    simulate(physics, man, 1);
    man.setLimp(true);
    simulate(physics, man, 2);
    expect(pelvisHeight(man)).toBeLessThan(0.45);
    man.setLimp(false);
    simulate(physics, man, 3);
    expect(man.grounded).toBe(true);
    expect(Math.abs(man.torsoAngle())).toBeLessThan(0.2);
    expect(Math.abs(pelvisHeight(man) - TUNING.hoverHeight)).toBeLessThan(0.15);
  });
});
