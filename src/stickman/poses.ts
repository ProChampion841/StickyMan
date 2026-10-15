import { TUNING } from '../config';
import { clamp, lerp } from '../util/math';
import type { JointName, Pose } from './skeleton';

const JOINT_NAMES: readonly JointName[] = [
  'neck',
  'shoulderL',
  'elbowL',
  'shoulderR',
  'elbowR',
  'hipL',
  'kneeL',
  'hipR',
  'kneeR',
];

export function blendPose(a: Pose, b: Pose, t: number): Pose {
  const out = {} as Pose;
  for (const name of JOINT_NAMES) out[name] = lerp(a[name], b[name], t);
  return out;
}

/**
 * Loose boxer's guard with a slow breathing sway. Both legs stay bent so their
 * height fits under TUNING.hoverHeight; straighter legs would buckle against the floor.
 */
export function standPose(time: number): Pose {
  const breathe = Math.sin(time * 2.2) * 0.05;
  return {
    neck: 0,
    shoulderL: 0.7 + breathe,
    elbowL: 1.9,
    shoulderR: 0.35 - breathe,
    elbowR: 1.7,
    hipL: 0.4,
    kneeL: -0.6,
    hipR: -0.15,
    kneeR: -0.45,
  };
}

/** Low ninja crouch: knees deep, guard tight. Its leg height fits the crouched hover. */
export function crouchPose(): Pose {
  return {
    neck: 0.1,
    shoulderL: 0.9,
    elbowL: 2.0,
    shoulderR: 0.5,
    elbowR: 1.9,
    hipL: 0.95,
    kneeL: -1.45,
    hipR: 0.15,
    kneeR: -1.25,
  };
}

/**
 * Procedural run cycle. `phase` advances by PI per stride; `intensity` (0..1)
 * scales swing amplitude with speed.
 */
export function gaitPose(phase: number, intensity: number): Pose {
  const legSwing = TUNING.legSwing * intensity;
  const armSwing = TUNING.armSwing * intensity;
  const swingL = Math.sin(phase);
  const swingR = Math.sin(phase + Math.PI);
  // A leg is in its swing phase (foot off the ground) while its thigh moves forward.
  const liftL = Math.max(0, Math.cos(phase));
  const liftR = Math.max(0, Math.cos(phase + Math.PI));
  const elbow = 1.2 + 0.4 * intensity;
  return {
    neck: 0,
    // Arms swing against the leg on the same side.
    shoulderL: 0.2 - armSwing * swingL,
    elbowL: elbow,
    shoulderR: 0.2 - armSwing * swingR,
    elbowR: elbow,
    hipL: 0.15 + legSwing * swingL,
    kneeL: -(0.2 + 1.3 * intensity * liftL),
    hipR: 0.15 + legSwing * swingR,
    kneeR: -(0.2 + 1.3 * intensity * liftR),
  };
}

const TUCK: Pose = {
  neck: 0,
  shoulderL: 2.4,
  elbowL: 0.6,
  shoulderR: 1.6,
  elbowR: 0.5,
  hipL: 1.0,
  kneeL: -1.7,
  hipR: 0.35,
  kneeR: -1.1,
};

const FALL: Pose = {
  neck: 0,
  shoulderL: 1.4,
  elbowL: 0.5,
  shoulderR: 1.0,
  elbowR: 0.4,
  hipL: 0.35,
  kneeL: -0.5,
  hipR: -0.15,
  kneeR: -0.3,
};

/**
 * Airborne pose: tucked while rising, legs reaching for the ground while falling.
 * `verticalSpeed` is normalized: -1 at full jump speed upward, +1 falling as fast.
 */
export function airPose(verticalSpeed: number): Pose {
  return blendPose(TUCK, FALL, clamp((verticalSpeed + 1) / 2, 0, 1));
}
