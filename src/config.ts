/** Logical canvas size; Phaser scales it to fit the window. */
export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;

/** Pixels per physics meter. Physics runs in meters (y points down), rendering in pixels. */
export const PPM = 64;

const DEFAULTS = {
  gravity: 25,

  // Movement
  maxSpeed: 6.5,
  groundAccel: 45,
  airAccel: 18,
  jumpSpeed: 11,
  /** Vertical speed multiplier applied once when jump is released early (variable jump height). */
  jumpCut: 0.45,
  /** Extra gravity while falling, for a snappier arc. 1 = none. */
  fallGravityMultiplier: 1.6,
  coyoteTime: 0.1,
  jumpBuffer: 0.12,

  // Balance: a spring "hovers" the pelvis above the ground, a PD torque keeps the torso upright.
  hoverHeight: 0.8,
  /** How far above hoverHeight the stickman still counts as grounded. */
  groundSnap: 0.12,
  hoverStiffness: 220,
  hoverDamping: 24,
  hoverMaxAccel: 60,
  uprightStiffness: 80,
  uprightDamping: 14,
  uprightMaxTorque: 900,
  runLean: 0.15,

  // Joint motors pull each limb toward the current pose.
  jointStiffness: 900,
  jointDamping: 50,
  /** Joint friction while limp, so the ragdoll flops without spinning forever. */
  limpDamping: 0.6,

  // Procedural gait
  strideLength: 0.85,
  legSwing: 0.6,
  armSwing: 0.7,

  // Combat
  punchDamage: 8,
  headMultiplier: 1.75,
  kickDamage: 12,
  shurikenDamage: 5,
  /** Velocity (m/s) a knockout launches the ragdoll with. */
  koKnockback: 7,
  stunTime: 0.3,

  // Hit feel
  /** Freeze on impact, scaled with damage and capped (Sakurai's rule). */
  hitstopBase: 0.05,
  hitstopPerDamage: 0.004,
  hitstopMax: 0.13,
  koHitstop: 0.22,
  /** Seconds of slow motion after a knockout. */
  koSlowMo: 0.7,
  slowMoScale: 0.3,
  /** Screen shake multiplier. 0 turns it off (accessibility). */
  screenShake: 1,
  volume: 0.6,

  // Match
  roundTime: 60,

  // Eraser hazard
  eraserSpeed: 8,
  eraserDamage: 15,
  /** Average seconds between sweeps (each gap varies ±30%). */
  eraserInterval: 12,

  // Look
  /** Hand-drawn "line boil" jitter in pixels. 0 disables it. */
  lineBoil: 0.7,
};

export type Tuning = typeof DEFAULTS;
export const DEFAULT_TUNING: Readonly<Tuning> = Object.freeze({ ...DEFAULTS });
/** Live tuning values. Mutated by the dev tuning panel; read every physics step. */
export const TUNING: Tuning = { ...DEFAULTS };
