import { TUNING } from '../config';
import { ALL_BITS, ARM_BIT, WORLD_BIT, interactionGroups, playerBit } from '../physics/groups';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import { type Collider, RAPIER, type RevoluteImpulseJoint, type RigidBody } from '../physics/rapier';
import {
  type Transform,
  type Vec,
  clamp,
  distanceToSegment,
  lerp,
  midpoint,
  transformPoint,
  wrapAngle,
} from '../util/math';
import { airPose, blendPose, crouchPose, gaitPose, standPose } from './poses';
import {
  DIM,
  JOINTS,
  type JointName,
  PARTS,
  type PartName,
  type PartSpec,
  type Pose,
  bottomOf,
  topOf,
} from './skeleton';

export interface StickmanInput {
  /** Horizontal intent, -1..1. */
  move: number;
  /** Whether jump is held, for variable jump height. Presses go through queueJump(). */
  jumpHeld: boolean;
  /** Holding down: crouch on the ground, and picks the low and plunging moves. */
  down: boolean;
}

/** Movement moments that effects and sounds respond to. */
export type Motion = 'jump' | 'doubleJump' | 'wallJump' | 'dash';

export interface StickmanOptions {
  /** 0-based player slot; picks the collision bit. */
  index: number;
  /** Point on the ground to stand on, in meters. */
  spawn: Vec;
  facing?: 1 | -1;
}

/** Joint positions in world meters, ready to draw. */
export interface Skeleton {
  head: Vec;
  joints: Record<JointName, Vec>;
  handL: Vec;
  handR: Vec;
  footL: Vec;
  footR: Vec;
}

/** Horizontal offsets of the three downward ground probes, so standing on a ledge edge still counts. */
const PROBE_OFFSETS = [-0.18, 0, 0.18];
const PROBE_EXTRA = 0.4;
/** Converts total mass into the effective inertia the upright controller balances. */
const UPRIGHT_INERTIA_PER_KG = 0.25;
/** Speed (m/s) at which the stand pose has fully blended into the run cycle. */
const FULL_GAIT_SPEED = 1.2;
const JUMP_LOCK = 0.2;
const PART_LENGTH = Object.fromEntries(PARTS.map((p) => [p.name, p.length])) as Record<PartName, number>;
/** Spawned with straight legs, the feet start this far above the ground instead of inside it. */
const SPAWN_CLEARANCE = 0.02;
/**
 * Feet nearly frictionless while active: the hover spring carries the weight and the torso
 * drive does the moving, so planted feet would only fight the leg motors (the body ends up
 * "sitting" and creeps backwards). Limp feet grip normally so the ragdoll doesn't skate.
 */
const FOOT_FRICTION_ACTIVE = 0.05;
const FOOT_FRICTION_LIMP = 0.7;
/** Motor and balance strength at the start of a stun; it eases back to full as the stun wears off. */
const STUN_STRENGTH = 0.12;
/**
 * Fraction of normal braking while stunned: low enough that knockback visibly carries
 * the body, high enough that an opponent can't shove a stunned fighter across the floor.
 */
const STUN_BRAKE = 0.25;

// Ninja movement.
/** Extra jumps allowed in the air before landing (a double jump). */
const AIR_JUMPS = 1;
/** A double jump is a little weaker than a jump from the ground. */
const DOUBLE_JUMP_SCALE = 0.85;
/** Front-flip spin speed, rad/s; a flip lasts one full turn. */
const FLIP_RATE = 15;
/** How hard a flip holds its spin against damping and the limbs moving, 1/s. */
const FLIP_HOLD = 20;
const DASH_SPEED = 13;
const DASH_TIME = 0.16;
const DASH_COOLDOWN = 0.35;
/** Horizontal distance (m) from the torso at which a wall is close enough to kick off. */
const WALL_REACH = 0.45;
const WALL_JUMP_PUSH = 7.5;
/** How far the hips sink in a crouch. */
const CROUCH_DROP = 0.25;
const CROUCH_SPEED = 0.35;
/** Extra downward pull (m/s²) the hover may apply while dropping into a crouch. */
const CROUCH_PULL = 30;

/**
 * An active-ragdoll stick figure: ten rigid bodies joined by motorized hinges.
 * Each step it hovers the pelvis above the ground with a spring, keeps the torso
 * upright with a PD torque, and drives every joint toward a procedural pose.
 * Going limp switches all of that off and leaves a plain ragdoll.
 */
export class Stickman {
  readonly index: number;
  readonly input: StickmanInput = { move: 0, jumpHeld: false, down: false };
  /** Movement moments since the last drain (jumps, dashes), for effects. */
  readonly motions: Motion[] = [];
  readonly parts: Record<PartName, RigidBody>;
  readonly mass: number;

  facing: 1 | -1;
  grounded = false;
  limp = false;
  /** Distance from the pelvis down to whatever is below it, or null when nothing is in range. */
  groundDistance: number | null = null;

  // Hooks for whoever drives this body beyond walking (combat sets these every step).
  /** Joint targets that replace the procedural pose, e.g. a punching arm. */
  poseOverride: Partial<Pose> | null = null;
  /** Stiffness multiplier for the overridden joints, so a strike snaps out faster than the guard. */
  overrideStrength = 1;
  /** Extra forward lean in radians, e.g. leaning into a punch. */
  leanBias = 0;
  /** Extra speed (m/s) toward the facing direction, e.g. stepping into a punch. */
  stepSpeed = 0;
  /** Multiplier on walking speed, e.g. slower while mid-punch. */
  speedScale = 1;
  /** Keeps the current facing while set, so a swing can't flip around mid-strike. */
  facingLocked = false;
  /** Change to the hover height (m): negative crouches (an uppercut's dip), positive rises onto the toes. */
  hoverOffset = 0;

  private readonly joints: Record<JointName, RevoluteImpulseJoint>;
  /** For each joint, the parts it carries (its child and everything below it). */
  private readonly carried: Record<JointName, PartSpec[]>;
  private readonly feet: Collider[] = [];
  private readonly probeGroups: number;
  private readonly ray = new RAPIER.Ray({ x: 0, y: 0 }, { x: 0, y: 1 });
  private readonly prev: Transform[];
  private spawn: Vec;
  private readonly spawnFacing: 1 | -1;
  private stunTimer = 0;
  private stunDuration = 0;
  private time = 0;
  private phase = 0;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private jumpLockTimer = 0;
  private rising = false;
  private airJumpsLeft = AIR_JUMPS;
  private airDashUsed = false;
  private dashTimer = 0;
  private dashDir: 1 | -1 = 1;
  private dashCooldown = 0;
  /** Seconds since the last dash ended (large when there hasn't been one). */
  private sinceDash = Infinity;
  private flipTimer = 0;
  private flipRate = 0;
  private floatTimer = 0;
  private readonly wallRay = new RAPIER.Ray({ x: 0, y: 0 }, { x: 1, y: 0 });

  constructor(
    private readonly physics: PhysicsWorld,
    opts: StickmanOptions,
  ) {
    this.index = opts.index;
    this.spawn = { ...opts.spawn };
    this.spawnFacing = opts.facing ?? 1;
    this.facing = this.spawnFacing;

    const bit = playerBit(opts.index);
    const bodyGroups = interactionGroups(bit, ALL_BITS & ~bit);
    // Arms hit the level and other bodies, but never other arms (or this body).
    const armGroups = interactionGroups(ARM_BIT, ALL_BITS & ~bit & ~ARM_BIT);
    // The ground probe only finds level geometry. If it found other players, the side probes would
    // hover a stickman up onto an opponent it walks into, and since the hover spring pushes nothing
    // back down, the pair would ride upward together.
    this.probeGroups = interactionGroups(WORLD_BIT, WORLD_BIT);

    const world = physics.world;
    const parts = {} as Record<PartName, RigidBody>;
    for (const spec of PARTS) {
      const rest = restPosition(this.spawn, spec);
      const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().setTranslation(rest.x, rest.y).setAngularDamping(1).setCanSleep(false),
      );
      const shape =
        spec.length > 0
          ? RAPIER.ColliderDesc.capsule(Math.max(0.01, spec.length / 2 - spec.radius), spec.radius)
          : RAPIER.ColliderDesc.ball(spec.radius);
      const collider = world.createCollider(
        shape
          .setMass(spec.mass)
          .setFriction(0.6)
          .setCollisionGroups(isArm(spec.name) ? armGroups : bodyGroups),
        body,
      );
      if (spec.name === 'shinL' || spec.name === 'shinR') {
        // Min, so the foot's own friction wins over the ground's instead of averaging with it.
        collider.setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min);
        this.feet.push(collider);
      }
      parts[spec.name] = body;
    }
    this.parts = parts;
    this.mass = PARTS.reduce((sum, p) => sum + p.mass, 0);

    const joints = {} as Record<JointName, RevoluteImpulseJoint>;
    for (const spec of JOINTS) {
      const joint = world.createImpulseJoint(
        RAPIER.JointData.revolute(spec.parentAnchor, spec.childAnchor),
        parts[spec.parent],
        parts[spec.child],
        true,
      ) as RevoluteImpulseJoint;
      // Acceleration-based motors behave the same on a 2 kg forearm and a 30 kg torso.
      joint.configureMotorModel(RAPIER.MotorModel.AccelerationBased);
      if (spec.limits) joint.setLimits(spec.limits[0], spec.limits[1]);
      joints[spec.name] = joint;
    }
    this.joints = joints;

    const carried = {} as Record<JointName, PartSpec[]>;
    for (const spec of JOINTS) carried[spec.name] = PARTS.filter((p) => isBelow(p.name, spec.child));
    this.carried = carried;

    this.prev = PARTS.map(() => ({ x: 0, y: 0, angle: 0 }));
    this.setLimp(false);
    this.snapshot();
  }

  /** Buffers a jump press so it still fires if it lands slightly before touching the ground. */
  queueJump(): void {
    this.jumpBufferTimer = TUNING.jumpBuffer;
  }

  cancelJump(): void {
    this.jumpBufferTimer = 0;
  }

  /** A jump press is waiting to be used. */
  get jumpQueued(): boolean {
    return this.jumpBufferTimer > 0;
  }

  /** The double jump hasn't been spent since leaving the ground. */
  get canAirJump(): boolean {
    return this.airJumpsLeft > 0;
  }

  /**
   * Shadow dash: a burst of speed along `dir` for a moment, once per jump in the air.
   * Returns whether it happened.
   */
  dash(dir: 1 | -1): boolean {
    if (this.limp || this.stunned || this.dashCooldown > 0) return false;
    if (!this.grounded) {
      if (this.airDashUsed) return false;
      this.airDashUsed = true;
    }
    this.facing = dir;
    this.dashDir = dir;
    this.dashTimer = DASH_TIME;
    this.dashCooldown = DASH_COOLDOWN;
    this.rising = false;
    for (const spec of PARTS) {
      const body = this.parts[spec.name];
      // In the air the dash flattens the arc into a straight streak.
      const vy = this.grounded ? body.linvel().y : Math.min(body.linvel().y, 0) * 0.3;
      body.setLinvel({ x: dir * DASH_SPEED, y: vy }, true);
    }
    this.motions.push('dash');
    return true;
  }

  get dashing(): boolean {
    return this.dashTimer > 0;
  }

  /** Dashing now, or finished a dash within `seconds`: dash attacks come out of this window. */
  dashedWithin(seconds: number): boolean {
    return this.dashing || this.sinceDash <= seconds;
  }

  /**
   * Spins the whole body: `rate` rad/s (positive turns clockwise on screen) for `seconds`,
   * with the upright balance off. The spin is started evenly across every part so the
   * body turns as one piece, and held against damping until it finishes.
   */
  flip(rate: number, seconds: number): void {
    this.flipTimer = seconds;
    this.flipRate = rate;
    const com = this.centerOfMass();
    const v = this.centerOfMassVelocity();
    for (const spec of PARTS) {
      const body = this.parts[spec.name];
      const p = body.translation();
      body.setLinvel({ x: v.x - rate * (p.y - com.y), y: v.y + rate * (p.x - com.x) }, true);
      body.setAngvel(rate, true);
    }
  }

  get flipping(): boolean {
    return this.flipTimer > 0;
  }

  /** Cancels gravity for `seconds`: the hang in the air that lets an air combo land. */
  float(seconds: number): void {
    this.floatTimer = Math.max(this.floatTimer, seconds);
  }

  stopFloating(): void {
    this.floatTimer = 0;
  }

  /** Sets every part to the same velocity, so the body moves off as one piece. */
  setVelocity(v: Vec): void {
    for (const spec of PARTS) this.parts[spec.name].setLinvel(v, true);
  }

  get crouching(): boolean {
    return this.grounded && this.input.down && !this.stunned && !this.limp;
  }

  setLimp(limp: boolean): void {
    this.limp = limp;
    if (limp) this.rising = false;
    for (const foot of this.feet) foot.setFriction(limp ? FOOT_FRICTION_LIMP : FOOT_FRICTION_ACTIVE);
  }

  /** Staggers for `seconds`: no control, floppy limbs and a weak balance that firms up as it wears off. */
  stun(seconds: number): void {
    if (seconds <= this.stunTimer) return;
    this.stunTimer = seconds;
    this.stunDuration = seconds;
  }

  get stunned(): boolean {
    return this.stunTimer > 0;
  }

  /** Seconds left of the current stun, and how long it was in total. */
  get stunInfo(): { left: number; total: number } {
    return { left: this.stunTimer, total: this.stunDuration };
  }

  /** Teleports back to the rest pose standing at `spawn` (default: the last spawn point). */
  reset(spawn: Vec = this.spawn): void {
    this.spawn = { ...spawn };
    for (const spec of PARTS) {
      const body = this.parts[spec.name];
      body.setTranslation(restPosition(spawn, spec), true);
      body.setRotation(0, true);
      body.setLinvel({ x: 0, y: 0 }, true);
      body.setAngvel(0, true);
    }
    this.setLimp(false);
    this.facing = this.spawnFacing;
    this.input.move = 0;
    this.input.jumpHeld = false;
    this.input.down = false;
    this.motions.length = 0;
    this.airJumpsLeft = AIR_JUMPS;
    this.airDashUsed = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.sinceDash = Infinity;
    this.flipTimer = 0;
    this.floatTimer = 0;
    this.poseOverride = null;
    this.overrideStrength = 1;
    this.leanBias = 0;
    this.stepSpeed = 0;
    this.speedScale = 1;
    this.facingLocked = false;
    this.hoverOffset = 0;
    this.stunTimer = 0;
    this.rising = false;
    this.phase = 0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.jumpLockTimer = 0;
    this.snapshot();
  }

  /** Runs the controller for one fixed step. Call before PhysicsWorld.step(). */
  preStep(dt: number): void {
    const T = TUNING;
    this.time += dt;
    this.jumpBufferTimer -= dt;
    this.jumpLockTimer -= dt;
    this.stunTimer = Math.max(0, this.stunTimer - dt);
    this.dashCooldown -= dt;
    this.flipTimer -= dt;
    this.floatTimer -= dt;
    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) this.sinceDash = 0;
    } else {
      this.sinceDash += dt;
    }

    const torso = this.parts.torso;
    const vel = this.centerOfMassVelocity();
    const crouchDrop = this.input.down && !this.stunned && this.hoverOffset === 0 ? -CROUCH_DROP : 0;
    const hoverTarget = T.hoverHeight + this.hoverOffset + crouchDrop;
    this.groundDistance = this.probeGround();
    this.grounded =
      !this.limp &&
      this.jumpLockTimer <= 0 &&
      this.groundDistance !== null &&
      this.groundDistance <= T.hoverHeight + Math.max(0, this.hoverOffset) + T.groundSnap;
    this.coyoteTimer = this.grounded ? T.coyoteTime : this.coyoteTimer - dt;
    if (this.grounded) {
      this.airJumpsLeft = AIR_JUMPS;
      this.airDashUsed = false;
    }

    if (this.limp) {
      this.driveJoints(null, 0);
      return;
    }

    // 1 normally; while stunned, starts low and eases back so the body flops then firms up.
    const strength = this.stunned
      ? STUN_STRENGTH + (1 - STUN_STRENGTH) * (1 - this.stunTimer / this.stunDuration) ** 2
      : 1;
    const move = this.stunned ? 0 : clamp(this.input.move, -1, 1);
    if (!this.facingLocked && !this.dashing && Math.abs(move) > 0.1) this.facing = move > 0 ? 1 : -1;

    // Steer the center of mass toward the target speed. Pushing only the torso lets limbs trail behind.
    // Stunned fighters only brake gently, so knockback carries them. A dash holds its own speed.
    if (this.dashing && !this.stunned) {
      const dv = this.dashDir * DASH_SPEED - vel.x;
      torso.applyImpulse({ x: this.mass * dv, y: 0 }, true);
      // An air dash floats level instead of falling.
      if (!this.grounded) this.floatTimer = Math.max(this.floatTimer, dt);
    } else if (this.grounded || move !== 0 || this.stepSpeed !== 0) {
      const accel = (this.grounded ? T.groundAccel : T.airAccel) * (this.stunned ? STUN_BRAKE : 1);
      const speedScale = this.speedScale * (crouchDrop < 0 && this.grounded ? CROUCH_SPEED : 1);
      const target = move * T.maxSpeed * speedScale + this.facing * this.stepSpeed;
      const dv = clamp(target - vel.x, -accel * dt, accel * dt);
      torso.applyImpulse({ x: this.mass * dv, y: 0 }, true);
    }

    // Variable jump height. Checked before a new jump, because `vel` predates it.
    if (this.rising) {
      if (vel.y >= 0) {
        this.rising = false;
      } else if (!this.input.jumpHeld) {
        this.scaleVerticalVelocity(T.jumpCut);
        this.rising = false;
      }
    }

    // Jumps: from the ground, off a wall, or once more in mid-air with a flip.
    if (!this.stunned && this.jumpBufferTimer > 0) {
      if (this.coyoteTimer > 0) {
        this.jump(1);
        this.motions.push('jump');
      } else if (!this.grounded) {
        const wall = this.wallSide();
        if (wall !== 0) this.wallJump(wall);
        else if (this.airJumpsLeft > 0 && this.jumpLockTimer <= 0) this.doubleJump();
      }
    }

    let gravity = T.gravity;
    if (this.floatTimer > 0 && !this.grounded) {
      // Hanging in the air: cancel gravity and bleed off any fall.
      for (const spec of PARTS) {
        const body = this.parts[spec.name];
        body.applyImpulse({ x: 0, y: -spec.mass * T.gravity * dt }, true);
        if (body.linvel().y > 0) body.applyImpulse({ x: 0, y: -spec.mass * body.linvel().y * 0.2 }, true);
      }
    } else if (!this.grounded && vel.y > 0 && T.fallGravityMultiplier > 1) {
      const extra = T.gravity * (T.fallGravityMultiplier - 1);
      gravity += extra;
      for (const spec of PARTS) this.parts[spec.name].applyImpulse({ x: 0, y: spec.mass * extra * dt }, true);
    }
    this.compensateGravity(gravity * strength, dt);

    // Hover spring: carry the whole body's weight at the pelvis, so the legs only have to look like they do.
    if (this.grounded && this.groundDistance !== null) {
      const error = hoverTarget - this.groundDistance;
      const upwardSpeed = -torso.linvel().y;
      // Normally the spring only holds up (gravity brings the body down); dropping into a
      // crouch or a sweep it also pulls down, so the drop is snappy.
      const pullDown = hoverTarget < T.hoverHeight ? CROUCH_PULL : 0;
      const accel = clamp(T.hoverStiffness * error - T.hoverDamping * upwardSpeed, -T.gravity - pullDown, T.hoverMaxAccel);
      torso.applyImpulse({ x: 0, y: -this.mass * (T.gravity + accel) * dt }, true);
    }

    const inertia = this.mass * UPRIGHT_INERTIA_PER_KG;
    if (this.flipping) {
      // Mid-flip the balance lets go; instead the spin is held at its rate until the turn is done.
      torso.applyTorqueImpulse(inertia * FLIP_HOLD * (this.flipRate - torso.angvel()) * dt, true);
    } else {
      // Upright PD torque, leaning slightly into the run.
      const lean =
        T.runLean * clamp(vel.x / T.maxSpeed, -1, 1) * (this.grounded ? 1 : 0.4) + this.facing * this.leanBias;
      const angleError = wrapAngle(lean - torso.rotation());
      const torque = clamp(
        inertia * (T.uprightStiffness * angleError - T.uprightDamping * torso.angvel()),
        -T.uprightMaxTorque,
        T.uprightMaxTorque,
      );
      torso.applyTorqueImpulse(torque * strength * dt, true);
    }

    let pose = this.choosePose(dt, vel);
    if (this.flipping) pose = airPose(-1);
    else if (crouchDrop < 0 && this.grounded) pose = crouchPose();
    if (this.poseOverride) Object.assign(pose, this.poseOverride);
    this.driveJoints(pose, strength);
  }

  /** Records transforms before a physics step so rendering can interpolate between steps. */
  snapshot(): void {
    PARTS.forEach((spec, i) => {
      const body = this.parts[spec.name];
      const t = body.translation();
      this.prev[i] = { x: t.x, y: t.y, angle: body.rotation() };
    });
  }

  /** Joint positions interpolated `alpha` of the way from the last snapshot to the current state. */
  skeleton(alpha = 1): Skeleton {
    const tf = {} as Record<PartName, Transform>;
    PARTS.forEach((spec, i) => {
      const body = this.parts[spec.name];
      const p = this.prev[i];
      const t = body.translation();
      tf[spec.name] = {
        x: lerp(p.x, t.x, alpha),
        y: lerp(p.y, t.y, alpha),
        angle: p.angle + wrapAngle(body.rotation() - p.angle) * alpha,
      };
    });
    const joints = {} as Record<JointName, Vec>;
    for (const spec of JOINTS) {
      // Averaging both anchors hides any small joint separation under load.
      joints[spec.name] = midpoint(
        transformPoint(tf[spec.parent], spec.parentAnchor),
        transformPoint(tf[spec.child], spec.childAnchor),
      );
    }
    return {
      head: { x: tf.head.x, y: tf.head.y },
      joints,
      handL: transformPoint(tf.lowerArmL, bottomOf(DIM.lowerArm)),
      handR: transformPoint(tf.lowerArmR, bottomOf(DIM.lowerArm)),
      footL: transformPoint(tf.shinL, bottomOf(DIM.shin)),
      footR: transformPoint(tf.shinR, bottomOf(DIM.shin)),
    };
  }

  /** The body part closest to `point` (meters), measured to its surface. Arms are skipped unless asked for. */
  nearestPart(point: Vec, includeArms = true): { part: PartName; body: RigidBody; distance: number } {
    let best = { part: 'torso' as PartName, body: this.parts.torso, distance: Infinity };
    for (const spec of PARTS) {
      if (!includeArms && isArm(spec.name)) continue;
      const body = this.parts[spec.name];
      const tf = currentTransform(body);
      const centerDistance =
        spec.length === 0
          ? Math.hypot(point.x - tf.x, point.y - tf.y)
          : distanceToSegment(point, transformPoint(tf, topOf(spec.length)), transformPoint(tf, bottomOf(spec.length)));
      const distance = Math.max(0, centerDistance - spec.radius);
      if (distance < best.distance) best = { part: spec.name, body, distance };
    }
    return best;
  }

  /** Current world position of a fist. */
  hand(side: 'L' | 'R'): Vec {
    return transformPoint(currentTransform(this.parts[`lowerArm${side}`]), bottomOf(DIM.lowerArm));
  }

  /** `count` points evenly spaced along a limb part, from its attached end to its free end (fist, foot). */
  limbPoints(part: PartName, count: number): Vec[] {
    const tf = currentTransform(this.parts[part]);
    const half = PART_LENGTH[part] / 2;
    return Array.from({ length: count }, (_, i) => transformPoint(tf, { x: 0, y: half * ((2 * i) / (count - 1) - 1) }));
  }

  centerOfMass(): Vec {
    return this.massWeighted((body) => body.translation());
  }

  centerOfMassVelocity(): Vec {
    return this.massWeighted((body) => body.linvel());
  }

  pelvis(): Vec {
    return transformPoint(currentTransform(this.parts.torso), bottomOf(DIM.torso));
  }

  torsoAngle(): number {
    return wrapAngle(this.parts.torso.rotation());
  }

  private massWeighted(read: (body: RigidBody) => Vec): Vec {
    let x = 0;
    let y = 0;
    for (const spec of PARTS) {
      const v = read(this.parts[spec.name]);
      x += v.x * spec.mass;
      y += v.y * spec.mass;
    }
    return { x: x / this.mass, y: y / this.mass };
  }

  private probeGround(): number | null {
    const pelvis = this.pelvis();
    let best: number | null = null;
    for (const offset of PROBE_OFFSETS) {
      this.ray.origin = { x: pelvis.x + offset, y: pelvis.y };
      const hit = this.physics.world.castRay(
        this.ray,
        TUNING.hoverHeight + PROBE_EXTRA,
        true,
        undefined,
        this.probeGroups,
      );
      // A ray starting inside a wall hits at 0: that's the wall beside us, not ground below.
      // Counting it would let a fighter pressed against a wall walk straight up it.
      if (!hit || hit.timeOfImpact <= 0) continue;
      if (best === null || hit.timeOfImpact < best) best = hit.timeOfImpact;
    }
    return best;
  }

  private choosePose(dt: number, vel: Vec): Pose {
    const T = TUNING;
    if (!this.grounded) return airPose(vel.y / T.jumpSpeed);
    // Advance the cycle by distance covered, backwards when pushed backwards, so feet don't skate.
    this.phase += ((vel.x * this.facing * dt) / T.strideLength) * Math.PI;
    const speed = Math.abs(vel.x);
    const gait = gaitPose(this.phase, clamp(speed / T.maxSpeed, 0.35, 1));
    return blendPose(standPose(this.time), gait, clamp(speed / FULL_GAIT_SPEED, 0, 1));
  }

  /**
   * Cancels the gravity torque each joint carries, so the motors only shape the pose.
   * Without it, Rapier's acceleration-based motors (scaled by each limb's own inertia,
   * not its inertia about the joint) let arms sag far from their targets. Skipped while
   * limp so the ragdoll still drops naturally.
   *
   * Reactions are not passed on to the torso: the upright controller owns its balance,
   * and arms held forward would otherwise pitch it over.
   */
  private compensateGravity(gravity: number, dt: number): void {
    for (const spec of JOINTS) {
      let mass = 0;
      let momentX = 0;
      for (const part of this.carried[spec.name]) {
        mass += part.mass;
        momentX += part.mass * this.parts[part.name].translation().x;
      }
      const child = this.parts[spec.child];
      const jointX = transformPoint(currentTransform(child), spec.childAnchor).x;
      const torque = (momentX / mass - jointX) * mass * gravity;
      child.applyTorqueImpulse(-torque * dt, true);
      if (spec.parent !== 'torso') this.parts[spec.parent].applyTorqueImpulse(torque * dt, true);
    }
  }

  /**
   * Points every joint motor at `pose`, mirrored for facing, at `strength` times normal
   * stiffness (overridden joints get `overrideStrength` on top). `null` makes the joints go slack.
   */
  private driveJoints(pose: Pose | null, strength: number): void {
    const T = TUNING;
    for (const spec of JOINTS) {
      const joint = this.joints[spec.name];
      if (pose) {
        const boost = this.poseOverride && spec.name in this.poseOverride ? this.overrideStrength : 1;
        const s = spec.strength * strength * boost;
        joint.configureMotorPosition(-this.facing * pose[spec.name], T.jointStiffness * s, T.jointDamping * Math.sqrt(s));
      } else {
        joint.configureMotorPosition(0, 0, T.limpDamping);
      }
    }
  }

  /** Launches upward at `scale` of the jump speed, keeping horizontal speed. */
  private jump(scale: number): void {
    for (const spec of PARTS) {
      const body = this.parts[spec.name];
      body.setLinvel({ x: body.linvel().x, y: -TUNING.jumpSpeed * scale }, true);
    }
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
    this.jumpLockTimer = JUMP_LOCK;
    this.grounded = false;
    this.rising = true;
  }

  private doubleJump(): void {
    this.airJumpsLeft--;
    this.jump(DOUBLE_JUMP_SCALE);
    this.flip(this.facing * FLIP_RATE, (Math.PI * 2) / FLIP_RATE);
    this.motions.push('doubleJump');
  }

  /** Kicks off the wall on `side` (-1 left, 1 right) with a flip, and gets the double jump back. */
  private wallJump(side: -1 | 1): void {
    this.facing = side === 1 ? -1 : 1;
    this.jump(0.95);
    for (const spec of PARTS) {
      const body = this.parts[spec.name];
      body.setLinvel({ x: this.facing * WALL_JUMP_PUSH, y: body.linvel().y }, true);
    }
    this.airJumpsLeft = AIR_JUMPS;
    this.airDashUsed = false;
    this.flip(this.facing * FLIP_RATE, (Math.PI * 2) / FLIP_RATE);
    this.motions.push('wallJump');
  }

  /** Which side (-1 left, 1 right) a wall is within reach of the torso, or 0. */
  private wallSide(): -1 | 0 | 1 {
    const t = this.parts.torso.translation();
    for (const side of [-1, 1] as const) {
      this.wallRay.origin = { x: t.x, y: t.y };
      this.wallRay.dir = { x: side, y: 0 };
      if (this.physics.world.castRay(this.wallRay, WALL_REACH, true, undefined, this.probeGroups)) return side;
    }
    return 0;
  }

  private scaleVerticalVelocity(factor: number): void {
    for (const spec of PARTS) {
      const body = this.parts[spec.name];
      const v = body.linvel();
      body.setLinvel({ x: v.x, y: v.y * factor }, true);
    }
  }
}

/** Where a part sits in the straight-limbed rest pose when standing on `ground`. */
function restPosition(ground: Vec, spec: PartSpec): Vec {
  const pelvisY = ground.y - DIM.thigh - DIM.shin - SPAWN_CLEARANCE;
  return { x: ground.x + spec.rest.x, y: pelvisY + spec.rest.y };
}

export function isArm(part: PartName): boolean {
  return part.includes('Arm');
}

/** True if `part` is `root` or hangs below it in the joint tree. */
function isBelow(part: PartName, root: PartName): boolean {
  for (let p: PartName | undefined = part; p; p = JOINTS.find((j) => j.child === p)?.parent) {
    if (p === root) return true;
  }
  return false;
}

function currentTransform(body: RigidBody): Transform {
  const t = body.translation();
  return { x: t.x, y: t.y, angle: body.rotation() };
}
