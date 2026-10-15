import { TUNING } from '../config';
import type { Stickman } from '../stickman/Stickman';
import type { PartName, Pose } from '../stickman/skeleton';
import type { EventSink } from '../util/events';
import type { Vec } from '../util/math';

export const MAX_HP = 100;
export const KO_TIME = 3;

/** A press this early during the previous attack still fires as soon as it ends (or cancels it). */
const ATTACK_BUFFER = 0.25;
/** After a move ends, the next press within this many seconds continues the combo. */
const COMBO_WINDOW = 0.4;
/** How close (meters) the striking limb must come to a body part's surface to count as a hit. */
const HIT_REACH = 0.1;
/** Points sampled along the striking limb, so a point-blank strike that reaches past the body still lands. */
const LIMB_SAMPLES = 4;
/** A dash attack comes out if the button is pressed during a dash or this soon after it. */
const DASH_ATTACK_WINDOW = 0.25;
/**
 * Down pressed this soon (s) after the button still picks the down move: thumbs pressing
 * both at once rarely land on the same frame.
 */
const DOWN_GRACE = 0.07;
/** Meteor stomp shockwave: reaches this far (m) along the floor either side of the landing. */
const STOMP_RADIUS = 1.6;
/** A homing air attack arrives this far (m) short of its target, in striking distance. */
const HOMING_STANDOFF = 0.55;
/** Seconds a homing lunge takes to arrive, and its top speeds (m/s). */
const HOMING_TIME = 0.14;
const HOMING_SPEED = { punch: 9, kick: 11 };
export type AttackKind = 'punch' | 'kick' | 'special';
export type MoveName =
  | 'palmStrike'
  | 'elbowSmash'
  | 'risingDragon'
  | 'snapKick'
  | 'spinKick'
  | 'tornadoKick'
  | 'legSweep'
  | 'dashStrike'
  | 'flyingKnee'
  | 'airChop'
  | 'diveKick'
  | 'meteorStomp'
  | 'shuriken'
  | 'smokeVanish';
/** How big a hit is, for effects: freeze length, shake, comic words. */
export type HitTier = 'light' | 'medium' | 'heavy';
export type HitRegion = 'head' | 'body';
export type SpecialName = 'shuriken' | 'smokeVanish';
/** Seconds before each special can be used again. */
export const SPECIAL_COOLDOWN: Record<SpecialName, number> = { shuriken: 0.9, smokeVanish: 3 };

interface PhaseSpec {
  seconds: number;
  /** Whole-body pose: the striking limb, plus the counter-moves that sell it (guard hand, legs). */
  pose: Partial<Pose>;
  /** Stiffness multiplier for the posed joints. */
  strength: number;
  /** Extra forward lean (radians); negative leans back. */
  lean: number;
  /** Forward step (m/s) toward the target. */
  step: number;
  /** Hover height change (m): negative crouches, positive rises. */
  hover?: number;
}

interface MoveSpec {
  kind: AttackKind;
  /** The part whose length is checked for contact (forearm or shin); none for specials. */
  limb: PartName | null;
  /** Contact distance (m) if more generous than the default, e.g. a launcher. */
  reach?: number;
  /** Where this move sits in a ground combo (1-3). Air moves and specials leave the combo as it was. */
  chainStep?: number;
  windup: PhaseSpec;
  strike: PhaseSpec;
  recover: number;
  /** Walking speed multiplier during the whole move, so holding forward can't bulldoze through. */
  speedScale: number;
  /** Velocity (m/s; x along facing, y down) the whole body takes as the strike starts: a hop, a dive. */
  burst?: Vec;
  /** Only hop off the ground, so it can't be repeated in mid-air to fly. */
  burstGroundOnly?: boolean;
  /** A whole-body somersault as the strike starts: rad/s, positive = forward. One full turn. */
  flip?: number;
  /** The strike lasts until landing (up to its time), e.g. a stomp. */
  untilLanding?: boolean;
  /** In the air, zip toward an opponent within this range (m) as the strike starts. */
  homing?: number;
  /** In the air, hang without falling for this long (s) from the strike: room for an air combo. */
  hang?: number;
  /** On an air hit, move with the victim instead of shoving past it, so the next hit connects. */
  stickOnHit?: boolean;
  /** Flick (m/s) given to the striking limb as the strike starts. */
  snap: Vec;
  damage: () => number;
  /** Velocity (m/s; x along facing, y down) added to the victim. */
  knockback: Vec;
  /** Knockback moves the whole body (it flies) rather than just shoving the torso. */
  launches: boolean;
  /** The launch replaces the victim's velocity instead of adding to it: a predictable juggle arc. */
  exact?: boolean;
  stun: number;
  /** Seconds the victim spends knocked to the floor (a trip), instead of a stagger. */
  knockdown?: number;
  tier: HitTier;
  /** Specials: what the strike does instead of hitting with a limb. */
  special?: SpecialName;
}

/** Shorthand for the fast, high-strength phases ninja moves are built from. */
const phase = (seconds: number, pose: Partial<Pose>, strength: number, lean: number, step = 0, hover?: number): PhaseSpec => ({
  seconds,
  pose,
  strength,
  lean,
  step,
  hover,
});

// Pose angles: the child's rotation relative to its parent; positive swings toward the way
// the fighter faces. L is the lead (far) side, R the rear (near) side.
const CROUCH_LEGS = { hipL: 0.9, kneeL: -1.4, hipR: 0.1, kneeR: -1.2 };

export const MOVES: Record<MoveName, MoveSpec> = {
  // --- Ground combo, step 1 ---
  // Lightning lead-hand palm; the rear hand guards the chin.
  palmStrike: {
    kind: 'punch',
    limb: 'lowerArmL',
    chainStep: 1,
    windup: phase(0.04, { shoulderL: 0.5, elbowL: 2.2, shoulderR: 0.5, elbowR: 2.0 }, 1.8, -0.03),
    strike: phase(0.1, { shoulderL: 1.6, elbowL: 0.05, shoulderR: 0.35, elbowR: 2.3, hipL: 0.55, kneeL: -0.6 }, 3.8, 0.15, 2),
    recover: 0.08,
    speedScale: 0.5,
    snap: { x: 5, y: -1 },
    damage: () => TUNING.punchDamage * 0.75,
    knockback: { x: 2, y: -0.3 },
    launches: false,
    stun: 0.22,
    tier: 'light',
  },
  // Snap kick: the rear knee flicks up and out and straight back.
  snapKick: {
    kind: 'kick',
    limb: 'shinR',
    chainStep: 1,
    windup: phase(
      0.06,
      { hipR: 1.3, kneeR: -2.2, hipL: -0.05, kneeL: -0.25, shoulderL: 0.6, elbowL: 1.9, shoulderR: 0.9, elbowR: 1.7 },
      2.4,
      -0.1,
    ),
    strike: phase(
      0.15,
      { hipR: 1.3, kneeR: -0.05, hipL: -0.1, kneeL: -0.05, shoulderL: -0.3, elbowL: 0.8, shoulderR: 0.2, elbowR: 1.2 },
      3.4,
      -0.22,
      2.4,
    ),
    recover: 0.12,
    speedScale: 0.25,
    snap: { x: 6, y: -1 },
    damage: () => TUNING.kickDamage * 0.8,
    knockback: { x: 2.4, y: -0.6 },
    launches: false,
    stun: 0.3,
    tier: 'light',
  },

  // --- Ground combo, step 2 ---
  // Rear elbow driven in with the hips; the lead hand snaps back to the chin.
  elbowSmash: {
    kind: 'punch',
    limb: 'lowerArmR',
    reach: 0.18,
    chainStep: 2,
    windup: phase(0.06, { shoulderR: -0.2, elbowR: 2.4, shoulderL: 0.9, elbowL: 1.8, hipR: -0.3, kneeR: -0.5 }, 2, -0.1),
    strike: phase(
      0.12,
      { shoulderR: 1.45, elbowR: 2.5, shoulderL: 0.2, elbowL: 2.3, hipR: -0.5, kneeR: -0.1, hipL: 0.6, kneeL: -0.6 },
      3.8,
      0.3,
      4,
    ),
    recover: 0.12,
    speedScale: 0.3,
    snap: { x: 5, y: -2 },
    damage: () => TUNING.punchDamage * 1.1,
    knockback: { x: 2.6, y: -0.5 },
    launches: false,
    stun: 0.35,
    tier: 'medium',
  },
  // Spinning kick: turns its back for an instant, then whips round with the rear leg high.
  spinKick: {
    kind: 'kick',
    limb: 'shinR',
    reach: 0.16,
    chainStep: 2,
    windup: phase(0.1, { hipR: 0.3, kneeR: -1.5, shoulderL: 1.2, elbowL: 0.5, shoulderR: 1.2, elbowR: 0.5 }, 2.4, 0.1, 0, 0.05),
    strike: phase(
      0.16,
      { hipR: 1.8, kneeR: -0.1, hipL: -0.15, kneeL: -0.05, shoulderL: 1.5, elbowL: 0.3, shoulderR: -0.8, elbowR: 0.5 },
      3.4,
      -0.35,
      3,
      0.12,
    ),
    recover: 0.16,
    speedScale: 0.15,
    snap: { x: 5, y: -5 },
    damage: () => TUNING.kickDamage * 1.1,
    knockback: { x: 4.4, y: -1.5 },
    launches: false,
    stun: 0.45,
    tier: 'medium',
  },

  // --- Ground combo, step 3 (launchers) ---
  // Rising Dragon: sink low, then spring up through the opponent's chin and somersault.
  risingDragon: {
    kind: 'punch',
    limb: 'lowerArmR',
    reach: 0.2,
    chainStep: 3,
    windup: phase(0.1, { shoulderR: -0.35, elbowR: 1.3, shoulderL: 0.9, elbowL: 2.0, ...CROUCH_LEGS }, 3.2, 0.25, 0, -0.2),
    strike: phase(
      0.14,
      { shoulderR: 2.7, elbowR: 0.6, shoulderL: 0.3, elbowL: 2.2, hipL: 1.0, kneeL: -1.6, hipR: 0.4, kneeR: -1.0 },
      3.8,
      -0.2,
      2.6,
    ),
    recover: 0.3,
    speedScale: 0.2,
    burst: { x: 3.2, y: -6.2 },
    burstGroundOnly: true,
    flip: 10,
    snap: { x: 2, y: -7 },
    damage: () => TUNING.punchDamage * 1.2,
    // Mostly straight up, so the attacker can follow into the air.
    knockback: { x: 0.6, y: -8.5 },
    launches: true,
    exact: true,
    stun: 0.85,
    tier: 'heavy',
  },
  // Tornado kick: leap and somersault with the leg out, sweeping a full circle.
  tornadoKick: {
    kind: 'kick',
    limb: 'shinR',
    reach: 0.2,
    chainStep: 3,
    windup: phase(0.08, { ...CROUCH_LEGS, shoulderL: -0.4, elbowL: 0.8, shoulderR: -0.4, elbowR: 0.8 }, 3, 0.2, 0, -0.18),
    strike: phase(
      0.4,
      { hipR: 1.6, kneeR: -0.05, hipL: 0.8, kneeL: -1.8, shoulderL: 2.0, elbowL: 0.4, shoulderR: 1.8, elbowR: 0.4 },
      3.5,
      0,
      2.5,
    ),
    recover: 0.22,
    speedScale: 0.2,
    burst: { x: 2.5, y: -6.8 },
    burstGroundOnly: true,
    flip: 14,
    snap: { x: 4, y: -4 },
    damage: () => TUNING.kickDamage,
    knockback: { x: 1.5, y: -8 },
    launches: true,
    exact: true,
    stun: 0.8,
    tier: 'heavy',
  },

  // --- Down + button ---
  // Leg sweep: drop low on one knee and scythe the rear leg along the floor. Trips.
  legSweep: {
    kind: 'kick',
    limb: 'shinR',
    reach: 0.16,
    chainStep: 1,
    windup: phase(
      0.07,
      { hipL: 1.4, kneeL: -2.3, hipR: 0.6, kneeR: -1.6, shoulderL: 1.2, elbowL: 0.8, shoulderR: 0.6, elbowR: 1.4 },
      2.6,
      0.35,
      0,
      -0.35,
    ),
    strike: phase(
      0.2,
      { hipL: 1.4, kneeL: -2.3, hipR: 1.75, kneeR: -0.05, shoulderL: 1.6, elbowL: 0.4, shoulderR: 0.3, elbowR: 1.0 },
      3.4,
      0.55,
      1.6,
      -0.4,
    ),
    recover: 0.16,
    speedScale: 0,
    snap: { x: 5, y: 1 },
    damage: () => TUNING.kickDamage * 0.7,
    knockback: { x: 1.2, y: -3 },
    launches: true,
    stun: 0,
    knockdown: 0.9,
    tier: 'medium',
  },

  // --- Out of a dash ---
  // Dash strike: the dash carries straight into a driving palm.
  dashStrike: {
    kind: 'punch',
    limb: 'lowerArmL',
    chainStep: 1,
    windup: phase(0.03, { shoulderL: 0.4, elbowL: 2.3, shoulderR: 0.4, elbowR: 2.1 }, 2, 0.1, 6),
    strike: phase(0.12, { shoulderL: 1.6, elbowL: 0.05, shoulderR: 0.2, elbowR: 2.4, hipL: 0.7, kneeL: -0.6, hipR: -0.5, kneeR: -0.1 }, 3.8, 0.3, 6),
    recover: 0.15,
    speedScale: 0.3,
    snap: { x: 6, y: -1 },
    damage: () => TUNING.punchDamage * 1.2,
    knockback: { x: 4.5, y: -1 },
    launches: false,
    stun: 0.4,
    tier: 'medium',
  },
  // Flying knee: hop off the dash and drive the knee in, hands up.
  flyingKnee: {
    kind: 'kick',
    limb: 'shinR',
    reach: 0.14,
    chainStep: 1,
    windup: phase(0.04, { hipR: 0.8, kneeR: -2.0, shoulderL: 1.6, elbowL: 1.4, shoulderR: 1.4, elbowR: 1.5 }, 2.4, 0.1),
    strike: phase(
      0.2,
      { hipR: 1.9, kneeR: -2.4, hipL: 0.1, kneeL: -0.8, shoulderL: 1.8, elbowL: 1.2, shoulderR: 1.6, elbowR: 1.4 },
      3.6,
      0.2,
      5,
    ),
    recover: 0.18,
    speedScale: 0.3,
    burst: { x: 6, y: -4 },
    burstGroundOnly: true,
    snap: { x: 3, y: -2 },
    damage: () => TUNING.kickDamage * 1.1,
    knockback: { x: 4, y: -3.5 },
    launches: true,
    stun: 0.5,
    tier: 'heavy',
  },

  // --- In the air ---
  // Air chop: raise the hand and cut down through the opponent.
  airChop: {
    kind: 'punch',
    limb: 'lowerArmR',
    reach: 0.14,
    windup: phase(0.04, { shoulderR: 2.6, elbowR: 1.0, shoulderL: 1.0, elbowL: 1.5 }, 2.4, -0.05),
    strike: phase(0.12, { shoulderR: 1.45, elbowR: 0.1, shoulderL: 0.4, elbowL: 2.0 }, 3.8, 0.15, 2.5),
    recover: 0.08,
    speedScale: 1,
    homing: 2.5,
    hang: 0.25,
    stickOnHit: true,
    snap: { x: 4, y: 4 },
    damage: () => TUNING.punchDamage * 0.8,
    // Pops the victim up a little, to keep an air combo going.
    knockback: { x: 1.5, y: -4.5 },
    launches: true,
    exact: true,
    stun: 0.35,
    tier: 'light',
  },
  // Dive kick: tuck, then dive in feet-first.
  diveKick: {
    kind: 'kick',
    limb: 'shinR',
    windup: phase(
      0.06,
      { hipR: 1.6, kneeR: -2.3, hipL: 1.0, kneeL: -1.8, shoulderL: 2.2, elbowL: 0.4, shoulderR: 1.8, elbowR: 0.5 },
      2.5,
      -0.1,
    ),
    strike: phase(
      0.26,
      { hipR: 1.15, kneeR: -0.05, hipL: 0.6, kneeL: -2.0, shoulderL: 2.6, elbowL: 0.3, shoulderR: -0.6, elbowR: 0.6 },
      3.5,
      0.15,
      // Holds the dive speed against air control.
      8.5,
    ),
    recover: 0.2,
    speedScale: 0,
    burst: { x: 8.5, y: 5 },
    homing: 3,
    snap: { x: 4, y: 2 },
    damage: () => TUNING.kickDamage,
    knockback: { x: 5, y: -2 },
    launches: false,
    stun: 0.55,
    tier: 'heavy',
  },
  // Meteor stomp: plunge straight down, both feet first; the landing sends a shockwave along the floor.
  meteorStomp: {
    kind: 'kick',
    limb: 'shinR',
    reach: 0.16,
    windup: phase(
      0.07,
      { hipR: 1.5, kneeR: -2.2, hipL: 1.5, kneeL: -2.2, shoulderL: 2.8, elbowL: 0.3, shoulderR: 2.8, elbowR: 0.3 },
      2.5,
      0,
    ),
    strike: phase(
      0.6,
      { hipR: 0.15, kneeR: -0.05, hipL: -0.1, kneeL: -0.05, shoulderL: 2.6, elbowL: 0.6, shoulderR: 2.6, elbowR: 0.6 },
      3.5,
      0,
    ),
    recover: 0.22,
    speedScale: 0,
    burst: { x: 0, y: 14 },
    untilLanding: true,
    snap: { x: 0, y: 3 },
    damage: () => TUNING.kickDamage,
    knockback: { x: 1.5, y: -6 },
    launches: true,
    stun: 0.6,
    tier: 'heavy',
  },

  // --- Specials ---
  // Shuriken: whip the arm over the shoulder and let a throwing star fly.
  shuriken: {
    kind: 'special',
    limb: null,
    windup: phase(0.06, { shoulderR: 2.6, elbowR: 2.2, shoulderL: 1.0, elbowL: 1.6 }, 2.5, -0.1),
    strike: phase(0.08, { shoulderR: 1.5, elbowR: 0.1, shoulderL: 0.3, elbowL: 2.0 }, 3.6, 0.15),
    recover: 0.12,
    speedScale: 0.5,
    snap: { x: 3, y: 0 },
    damage: () => 0,
    knockback: { x: 0, y: 0 },
    launches: false,
    stun: 0,
    tier: 'light',
    special: 'shuriken',
  },
  // Smoke vanish: crouch, cross the arms, and blink out to reappear behind the opponent.
  smokeVanish: {
    kind: 'special',
    limb: null,
    windup: phase(0.12, { ...CROUCH_LEGS, shoulderL: 1.6, elbowL: 2.2, shoulderR: 1.6, elbowR: 2.2 }, 2.4, 0.1, 0, -0.2),
    strike: phase(0.05, { shoulderL: 1.6, elbowL: 2.2, shoulderR: 1.6, elbowR: 2.2 }, 2.4, 0),
    recover: 0.15,
    speedScale: 0,
    snap: { x: 0, y: 0 },
    damage: () => 0,
    knockback: { x: 0, y: 0 },
    launches: false,
    stun: 0,
    tier: 'light',
    special: 'smokeVanish',
  },
};

/** The three ground-combo steps for each button. */
const CHAIN: Record<'punch' | 'kick', readonly MoveName[]> = {
  punch: ['palmStrike', 'elbowSmash', 'risingDragon'],
  kick: ['snapKick', 'spinKick', 'tornadoKick'],
};

interface MoveContext {
  /** Ground-combo step this press would be (1-3). */
  step: number;
  airborne: boolean;
  down: boolean;
  dashed: boolean;
}

/** What a press becomes, given where the fighter is and what it's doing. */
export function chooseMove(kind: AttackKind, ctx: MoveContext): MoveName {
  if (kind === 'special') return ctx.down ? 'smokeVanish' : 'shuriken';
  if (ctx.airborne) {
    if (kind === 'punch') return 'airChop';
    return ctx.down ? 'meteorStomp' : 'diveKick';
  }
  if (ctx.dashed) return kind === 'punch' ? 'dashStrike' : 'flyingKnee';
  if (ctx.down) return kind === 'punch' ? 'risingDragon' : 'legSweep';
  return CHAIN[kind][ctx.step - 1];
}

/** A blow as it reaches its target: from a limb, a throwing star, or a shockwave. */
export interface Blow {
  move: MoveName;
  kind: AttackKind;
  part: PartName;
  point: Vec;
  /** Direction of the blow along x. */
  direction: 1 | -1;
  /** Damage before the head multiplier. */
  damage: number;
  /** Velocity (m/s; x along `direction`, y down) added to the victim. */
  knockback: Vec;
  launches: boolean;
  exact?: boolean;
  stun: number;
  knockdown?: number;
  tier: HitTier;
}

export interface HitEvent {
  attacker: Fighter;
  victim: Fighter;
  kind: AttackKind;
  move: MoveName;
  tier: HitTier;
  /** Where the blow landed, in meters. */
  point: Vec;
  direction: 1 | -1;
  region: HitRegion;
  damage: number;
  ko: boolean;
  /** The victim was knocked off its feet (a trip), not just staggered. */
  knockdown: boolean;
}

export type CombatEvent =
  | { type: 'swing'; fighter: Fighter; kind: AttackKind; move: MoveName }
  | ({ type: 'hit' } & HitEvent)
  | { type: 'special'; fighter: Fighter; special: SpecialName; point: Vec; direction: 1 | -1 }
  | { type: 'stomp'; fighter: Fighter; point: Vec };

interface Attack {
  move: MoveName;
  kind: AttackKind;
  /** What the press was made in, for the late-down upgrade. */
  context: MoveContext;
  time: number;
  phase: 'windup' | 'strike' | 'recover';
  /** Fighters this attack already hit, so one blow lands once. */
  struck: Set<Fighter>;
  /** The meteor stomp's landing already happened. */
  landed: boolean;
}

/**
 * Health, knockouts and the ninja move set for one stickman. Punch and kick presses build a
 * three-step ground combo (mixed freely); down, a dash, the air and the special button each
 * change what a press does. Hits stagger, trip or launch the victim; a knockout drops it.
 */
export class Fighter {
  hp = MAX_HP;
  /** Seconds until a knocked-out fighter gets back up; 0 when standing. */
  koTimer = 0;
  /** Whether a knockout wears off by itself. Off in matches, where a knockout ends the round. */
  recovers = true;
  /** Seconds of special cooldown left, per special. */
  readonly cooldowns: Record<SpecialName, number> = { shuriken: 0, smokeVanish: 0 };
  private attack: Attack | null = null;
  private queued: AttackKind | null = null;
  private queuedTimer = 0;
  private dashQueued: 1 | -1 | null = null;
  /** The last ground-combo step performed, and how long the combo stays open. */
  private chainStep = 0;
  private comboTimer = 0;
  /** Seconds left lying on the floor after being tripped; 0 when up. */
  private downTimer = 0;
  /** Everyone in the fight, as of the last step: targets for homing attacks. */
  private fighters: readonly Fighter[] = [];

  constructor(readonly man: Stickman) {}

  get knockedOut(): boolean {
    return this.koTimer > 0;
  }

  /** Tripped to the floor and not yet back up. */
  get knockedDown(): boolean {
    return this.downTimer > 0;
  }

  /** True from the start of an attack until its recovery ends. */
  get attacking(): boolean {
    return this.attack !== null;
  }

  /** The move in progress and its phase, for animation effects. */
  get currentMove(): { move: MoveName; kind: AttackKind; phase: Attack['phase']; limb: PartName | null } | null {
    const attack = this.attack;
    if (!attack) return null;
    const spec = MOVES[attack.move];
    return { move: attack.move, kind: spec.kind, phase: attack.phase, limb: spec.limb };
  }

  queuePunch(): void {
    this.queue('punch');
  }

  queueKick(): void {
    this.queue('kick');
  }

  queueSpecial(): void {
    this.queue('special');
  }

  /** Dash along `dir`; also cancels the recovery of an attack that hit. */
  queueDash(dir: 1 | -1): void {
    this.dashQueued = dir;
  }

  /** Drops all input and queued actions, e.g. while a round is being announced. */
  idle(): void {
    this.man.input.move = 0;
    this.man.input.jumpHeld = false;
    this.man.input.down = false;
    this.man.cancelJump();
    this.queued = null;
    this.dashQueued = null;
  }

  /**
   * Damage from something other than an attack, such as a hazard: launches the whole body
   * at `launch` (m/s) and staggers it, or knocks it out. Returns whether this knocked it out.
   */
  hurt(damage: number, launch: Vec, stunSeconds: number): boolean {
    const alreadyDown = this.knockedOut;
    if (!alreadyDown) this.hp = Math.max(0, this.hp - damage);
    const ko = !alreadyDown && this.hp === 0;
    if (ko) this.knockOut();
    else if (!alreadyDown) this.man.stun(stunSeconds);
    launchAll(this.man, launch);
    return ko;
  }

  reset(): void {
    this.hp = MAX_HP;
    this.koTimer = 0;
    this.downTimer = 0;
    this.queued = null;
    this.dashQueued = null;
    this.chainStep = 0;
    this.comboTimer = 0;
    this.cooldowns.shuriken = 0;
    this.cooldowns.smokeVanish = 0;
    this.endAttack();
  }

  /**
   * Advances knockouts and the current attack by one fixed step and sets this step's pose.
   * Call before Stickman.preStep; call postStep after the physics step.
   */
  preStep(dt: number, events: EventSink<CombatEvent>, fighters: readonly Fighter[] = []): void {
    this.fighters = fighters;
    this.queuedTimer -= dt;
    if (this.queuedTimer <= 0) this.queued = null;
    this.comboTimer -= dt;
    this.cooldowns.shuriken = Math.max(0, this.cooldowns.shuriken - dt);
    this.cooldowns.smokeVanish = Math.max(0, this.cooldowns.smokeVanish - dt);

    if (this.knockedOut) {
      this.koTimer = Math.max(0, this.koTimer - dt);
      if (this.koTimer === 0) {
        this.hp = MAX_HP;
        this.man.setLimp(false);
      }
      return;
    }
    if (this.knockedDown) {
      this.downTimer = Math.max(0, this.downTimer - dt);
      if (this.downTimer === 0) this.man.setLimp(false);
      this.dashQueued = null;
      return;
    }
    // Getting hit cancels your own attack, and the combo with it.
    if (this.man.stunned) {
      this.endAttack();
      this.comboTimer = 0;
      this.dashQueued = null;
      return;
    }

    // A move that connected can have its recovery cut short by the next attack, a jump or a
    // dash: how combos chain, and how a launcher is chased into the air.
    const attack = this.attack;
    if (attack?.phase === 'recover' && attack.struck.size > 0 && (this.queued || this.man.jumpQueued || this.dashQueued)) {
      this.finishAttack(attack);
    }
    if (this.dashQueued !== null) {
      if (!this.attack) this.man.dash(this.dashQueued);
      this.dashQueued = null;
    }

    if (!this.attack && this.queued) this.startAttack(this.queued);
    if (this.attack) this.advanceAttack(this.attack, dt, events);
  }

  /**
   * Checks the striking limb against everyone else, using the state the physics step just
   * produced so a contact made on the strike's last step still counts. Hits are applied
   * immediately (knockback takes effect next step) and pushed to `events`.
   */
  postStep(fighters: readonly Fighter[], events: EventSink<CombatEvent>): void {
    const attack = this.attack;
    if (!attack || attack.phase !== 'strike') return;
    const move = MOVES[attack.move];
    if (move.untilLanding && this.man.grounded && !attack.landed) {
      attack.landed = true;
      this.stompShockwave(attack, fighters, events);
      return;
    }
    if (!move.limb) return;
    // The whole limb counts, not just the fist or foot: at point-blank range the elbow or knee
    // is what touches, the way fighting games give the full arm a hitbox.
    const samples = [...this.man.limbPoints(upperOf(move.limb), 3), ...this.man.limbPoints(move.limb, LIMB_SAMPLES)];
    const reach = move.reach ?? HIT_REACH;
    for (const other of fighters) {
      if (other === this || attack.struck.has(other)) continue;
      // Arms pass through each other, so only the head, torso and legs can be hit.
      let best: { part: PartName; distance: number; point: Vec } | null = null;
      for (const point of samples) {
        const hit = other.man.nearestPart(point, false);
        if (!best || hit.distance < best.distance) best = { part: hit.part, distance: hit.distance, point };
      }
      if (!best || best.distance > reach) continue;
      attack.struck.add(other);
      events.push({ type: 'hit', ...other.receive(this, this.blowFrom(attack.move, best.part, best.point)) });
      if (move.stickOnHit && !this.man.grounded) {
        // Fall together with the victim, so the next air hit is right there.
        this.man.stopFloating();
        this.man.setVelocity(other.man.centerOfMassVelocity());
      }
    }
  }

  /** Applies a blow: damage, knockback, a hit reaction, and a stagger, trip or knockout. */
  receive(attacker: Fighter, blow: Blow): HitEvent {
    const T = TUNING;
    const region: HitRegion = blow.part === 'head' ? 'head' : 'body';
    // A ragdoll on the floor can still be knocked around, but takes no more damage.
    const alreadyDown = this.knockedOut;
    const damage = alreadyDown ? 0 : Math.round(blow.damage * (region === 'head' ? T.headMultiplier : 1));
    this.hp = Math.max(0, this.hp - damage);
    const ko = !alreadyDown && this.hp === 0;
    const body = this.man;
    const push = { x: blow.direction * blow.knockback.x, y: blow.knockback.y };
    let knockdown = false;

    if (ko) {
      this.knockOut();
      // Fly off along the blow's direction, always with some lift.
      const length = Math.hypot(push.x, push.y) || 1;
      launchAll(body, {
        x: (push.x / length) * T.koKnockback,
        y: Math.min((push.y / length) * T.koKnockback, -T.koKnockback * 0.45),
      });
    } else {
      if (blow.launches && blow.exact) body.setVelocity(push);
      else if (blow.launches) launchAll(body, push);
      else body.parts.torso.applyImpulse({ x: body.mass * push.x, y: body.mass * push.y }, true);
      if (blow.knockdown && !alreadyDown) {
        knockdown = true;
        this.endAttack();
        this.downTimer = blow.knockdown;
        body.setLimp(true);
      } else {
        body.stun(blow.stun * (region === 'head' ? 1.5 : 1));
        // Hit reaction: a body shot folds the victim toward the attacker, a head shot whips it back.
        const spin = region === 'head' ? blow.direction * 7 : -blow.direction * 4;
        body.parts.torso.applyTorqueImpulse(body.parts.torso.mass() * 0.15 * spin, true);
      }
    }
    // Whip the struck part itself; a snapped-back head sells the hit.
    const struck = body.parts[blow.part];
    const snap = (region === 'head' ? 6 : 3) * struck.mass();
    struck.applyImpulse({ x: blow.direction * snap, y: -snap * 0.3 }, true);

    return {
      attacker,
      victim: this,
      kind: blow.kind,
      move: blow.move,
      tier: ko ? 'heavy' : blow.tier,
      point: blow.point,
      direction: blow.direction,
      region,
      damage,
      ko,
      knockdown,
    };
  }

  private queue(kind: AttackKind): void {
    this.queued = kind;
    this.queuedTimer = ATTACK_BUFFER;
  }

  private startAttack(kind: AttackKind): void {
    const man = this.man;
    const context: MoveContext = {
      step: this.comboTimer > 0 ? (this.chainStep % 3) + 1 : 1,
      airborne: !man.grounded,
      down: man.input.down,
      dashed: man.dashedWithin(DASH_ATTACK_WINDOW),
    };
    const move = chooseMove(kind, context);
    this.queued = null;
    const special = MOVES[move].special;
    if (special && this.cooldowns[special] > 0) return;
    this.attack = { move, kind, context, time: 0, phase: 'windup', struck: new Set(), landed: false };
  }

  /** Down arriving just after the button turns the move into its down version, if it's ready. */
  private lateDown(attack: Attack): void {
    if (attack.phase !== 'windup' || attack.time >= DOWN_GRACE || attack.context.down || !this.man.input.down) return;
    attack.context = { ...attack.context, down: true };
    const upgraded = chooseMove(attack.kind, attack.context);
    const special = MOVES[upgraded].special;
    if (special && this.cooldowns[special] > 0) return;
    attack.move = upgraded;
  }

  private advanceAttack(attack: Attack, dt: number, events: EventSink<CombatEvent>): void {
    this.lateDown(attack);
    const move = MOVES[attack.move];
    const man = this.man;
    attack.time += dt;
    if (attack.phase === 'windup' && attack.time >= move.windup.seconds) {
      attack.phase = 'strike';
      this.beginStrike(attack.move, events);
    }
    const strikeEnd = move.windup.seconds + move.strike.seconds;
    if (attack.phase === 'strike' && (attack.time >= strikeEnd || attack.landed)) {
      attack.phase = 'recover';
      attack.time = Math.max(attack.time, strikeEnd);
    }
    if (attack.phase === 'recover' && attack.time >= strikeEnd + move.recover) {
      this.finishAttack(attack);
      return;
    }

    man.speedScale = move.speedScale;
    if (attack.phase === 'recover') {
      man.poseOverride = null;
      man.leanBias = 0;
      man.stepSpeed = 0;
      man.hoverOffset = 0;
      man.facingLocked = false;
      return;
    }
    const current = attack.phase === 'windup' ? move.windup : move.strike;
    man.poseOverride = current.pose;
    man.overrideStrength = current.strength;
    man.leanBias = current.lean;
    man.stepSpeed = current.step;
    man.hoverOffset = current.hover ?? 0;
    man.facingLocked = true;
    // The spin kick turns its back for the wind-up, then whips round.
    if (attack.move === 'spinKick') this.spinTurn(attack.phase === 'windup');
  }

  private beginStrike(name: MoveName, events: EventSink<CombatEvent>): void {
    const move = MOVES[name];
    const man = this.man;
    const homed = move.homing !== undefined && !man.grounded && this.homeIn(move.homing, HOMING_SPEED[move.kind === 'kick' ? 'kick' : 'punch']);
    const f = man.facing;
    if (!homed && move.burst && (!move.burstGroundOnly || man.grounded)) {
      for (const piece of Object.values(man.parts)) piece.setLinvel({ x: f * move.burst.x, y: move.burst.y }, true);
    }
    if (move.hang && !man.grounded) man.float(move.hang);
    if (move.flip) man.flip(f * move.flip, (Math.PI * 2) / move.flip);
    if (move.limb) {
      const limb = man.parts[move.limb];
      const m = limb.mass();
      limb.applyImpulse({ x: f * m * move.snap.x, y: m * move.snap.y }, true);
    }
    events.push({ type: 'swing', fighter: this, kind: move.kind, move: name });
    if (move.special) {
      this.cooldowns[move.special] = SPECIAL_COOLDOWN[move.special];
      events.push({ type: 'special', fighter: this, special: move.special, point: man.hand('R'), direction: f });
    }
  }

  /**
   * Lunges at the nearest opponent within `range`, arriving in striking distance: the
   * anime-style zip that makes air combos land. Returns whether there was anyone to home in on.
   */
  private homeIn(range: number, maxSpeed: number): boolean {
    const man = this.man;
    const from = man.centerOfMass();
    let target: Fighter | null = null;
    let best = range;
    for (const other of this.fighters) {
      if (other === this || other.knockedOut) continue;
      const there = other.man.centerOfMass();
      const distance = Math.hypot(there.x - from.x, there.y - from.y);
      if (distance < best) {
        best = distance;
        target = other;
      }
    }
    if (!target) return false;
    const to = target.man.centerOfMass();
    const dir = to.x >= from.x ? 1 : -1;
    man.facing = dir;
    let vx = (to.x - dir * HOMING_STANDOFF - from.x) / HOMING_TIME;
    let vy = (to.y - from.y) / HOMING_TIME;
    const speed = Math.hypot(vx, vy);
    if (speed > maxSpeed) {
      vx *= maxSpeed / speed;
      vy *= maxSpeed / speed;
    }
    man.setVelocity({ x: vx, y: vy });
    return true;
  }

  /** The spin kick's wind-up faces away; its strike faces back the way it started. */
  private spinTurned = false;
  private spinTurn(away: boolean): void {
    if (away !== this.spinTurned) {
      this.man.facing = this.man.facing === 1 ? -1 : 1;
      this.spinTurned = away;
    }
  }

  private blowFrom(name: MoveName, part: PartName, point: Vec): Blow {
    const move = MOVES[name];
    return {
      move: name,
      kind: move.kind,
      part,
      point,
      direction: this.man.facing,
      damage: move.damage(),
      knockback: move.knockback,
      launches: move.launches,
      exact: move.exact,
      stun: move.stun,
      knockdown: move.knockdown,
      tier: move.tier,
    };
  }

  /** The meteor stomp's landing: a shockwave pops up anyone standing nearby. */
  private stompShockwave(attack: Attack, fighters: readonly Fighter[], events: EventSink<CombatEvent>): void {
    const here = this.man.centerOfMass();
    const feet = this.man.skeleton().footR;
    events.push({ type: 'stomp', fighter: this, point: feet });
    for (const other of fighters) {
      if (other === this || attack.struck.has(other) || !other.man.grounded) continue;
      const there = other.man.centerOfMass();
      if (Math.abs(there.x - here.x) > STOMP_RADIUS) continue;
      attack.struck.add(other);
      const direction = there.x >= here.x ? 1 : -1;
      const blow = { ...this.blowFrom('meteorStomp', 'shinL', { x: there.x, y: feet.y }), direction } as Blow;
      blow.damage *= 0.6;
      events.push({ type: 'hit', ...other.receive(this, blow) });
    }
  }

  /** Ends an attack normally, keeping the combo open for the next press. */
  private finishAttack(attack: Attack): void {
    const step = MOVES[attack.move].chainStep;
    if (step !== undefined) this.chainStep = step;
    this.comboTimer = COMBO_WINDOW;
    this.endAttack();
  }

  private knockOut(): void {
    this.koTimer = this.recovers ? KO_TIME : Infinity;
    this.downTimer = 0;
    this.endAttack();
    this.man.setLimp(true);
  }

  private endAttack(): void {
    if (this.spinTurned) this.spinTurn(false);
    this.attack = null;
    const man = this.man;
    man.poseOverride = null;
    man.overrideStrength = 1;
    man.leanBias = 0;
    man.stepSpeed = 0;
    man.speedScale = 1;
    man.hoverOffset = 0;
    man.facingLocked = false;
  }
}

/** The segment a forearm or shin hangs from. */
function upperOf(limb: PartName): PartName {
  const upper: Partial<Record<PartName, PartName>> = {
    lowerArmL: 'upperArmL',
    lowerArmR: 'upperArmR',
    shinL: 'thighL',
    shinR: 'thighR',
  };
  return upper[limb] ?? limb;
}

/** Gives every part the same velocity change, so the body moves as one piece. */
function launchAll(man: Stickman, velocity: Vec): void {
  for (const piece of Object.values(man.parts)) {
    const m = piece.mass();
    piece.applyImpulse({ x: m * velocity.x, y: m * velocity.y }, true);
  }
}
