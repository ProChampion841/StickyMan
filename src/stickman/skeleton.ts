import type { Vec } from '../util/math';

// L is the far side of the body (drawn behind), R the near side. Which way the
// stickman faces is separate: poses are mirrored by the controller.
export type PartName =
  | 'torso'
  | 'head'
  | 'upperArmL'
  | 'lowerArmL'
  | 'upperArmR'
  | 'lowerArmR'
  | 'thighL'
  | 'shinL'
  | 'thighR'
  | 'shinR';

export type JointName =
  | 'neck'
  | 'shoulderL'
  | 'elbowL'
  | 'shoulderR'
  | 'elbowR'
  | 'hipL'
  | 'kneeL'
  | 'hipR'
  | 'kneeR';

/**
 * A pose gives each joint the child's rotation relative to its parent, in radians.
 * Positive swings the child's free end toward the way the stickman faces, so knees
 * bend with negative values and elbows with positive ones.
 */
export type Pose = Record<JointName, number>;

/**
 * Body dimensions in meters. Every limb is a capsule whose local +y axis runs from
 * the attached end to the free end, so at rotation 0 limbs hang straight down.
 */
export const DIM = {
  torso: 0.6,
  torsoRadius: 0.08,
  headRadius: 0.2,
  /** Distance from the neck point (torso top) up to the head's center. */
  neck: 0.24,
  /** Shoulders sit slightly below the torso top. */
  shoulderDrop: 0.06,
  upperArm: 0.32,
  lowerArm: 0.3,
  thigh: 0.42,
  shin: 0.42,
  limbRadius: 0.06,
} as const;

export interface PartSpec {
  name: PartName;
  /** Segment length for capsules; 0 for the head, which is a ball. */
  length: number;
  radius: number;
  mass: number;
  /** Rest-pose center relative to the pelvis, with every part at rotation 0. */
  rest: Vec;
}

export interface JointSpec {
  name: JointName;
  parent: PartName;
  child: PartName;
  /** Anchor in the parent's local frame. */
  parentAnchor: Vec;
  /** Anchor in the child's local frame. */
  childAnchor: Vec;
  /** Relative-angle limits. Kept symmetric so they hold for either facing. */
  limits?: readonly [number, number];
  /** Multiplier on TUNING.jointStiffness. */
  strength: number;
}

export const topOf = (length: number): Vec => ({ x: 0, y: -length / 2 });
export const bottomOf = (length: number): Vec => ({ x: 0, y: length / 2 });

const T = DIM.torso;
const SHOULDER_Y = -T + DIM.shoulderDrop;

function arm(side: 'L' | 'R'): PartSpec[] {
  return [
    {
      name: `upperArm${side}`,
      length: DIM.upperArm,
      radius: DIM.limbRadius,
      mass: 3,
      rest: { x: 0, y: SHOULDER_Y + DIM.upperArm / 2 },
    },
    {
      name: `lowerArm${side}`,
      length: DIM.lowerArm,
      radius: DIM.limbRadius,
      mass: 2,
      rest: { x: 0, y: SHOULDER_Y + DIM.upperArm + DIM.lowerArm / 2 },
    },
  ];
}

function leg(side: 'L' | 'R'): PartSpec[] {
  return [
    { name: `thigh${side}`, length: DIM.thigh, radius: DIM.limbRadius, mass: 8, rest: { x: 0, y: DIM.thigh / 2 } },
    {
      name: `shin${side}`,
      length: DIM.shin,
      radius: DIM.limbRadius,
      mass: 5,
      rest: { x: 0, y: DIM.thigh + DIM.shin / 2 },
    },
  ];
}

export const PARTS: readonly PartSpec[] = [
  { name: 'torso', length: T, radius: DIM.torsoRadius, mass: 30, rest: { x: 0, y: -T / 2 } },
  { name: 'head', length: 0, radius: DIM.headRadius, mass: 6, rest: { x: 0, y: -T - DIM.neck } },
  ...arm('L'),
  ...arm('R'),
  ...leg('L'),
  ...leg('R'),
];

function armJoints(side: 'L' | 'R'): JointSpec[] {
  return [
    {
      name: `shoulder${side}`,
      parent: 'torso',
      child: `upperArm${side}`,
      parentAnchor: { x: 0, y: -T / 2 + DIM.shoulderDrop },
      childAnchor: topOf(DIM.upperArm),
      strength: 0.5,
    },
    {
      name: `elbow${side}`,
      parent: `upperArm${side}`,
      child: `lowerArm${side}`,
      parentAnchor: bottomOf(DIM.upperArm),
      childAnchor: topOf(DIM.lowerArm),
      limits: [-2.6, 2.6],
      strength: 0.4,
    },
  ];
}

function legJoints(side: 'L' | 'R'): JointSpec[] {
  return [
    {
      name: `hip${side}`,
      parent: 'torso',
      child: `thigh${side}`,
      parentAnchor: bottomOf(T),
      childAnchor: topOf(DIM.thigh),
      strength: 1,
    },
    {
      name: `knee${side}`,
      parent: `thigh${side}`,
      child: `shin${side}`,
      parentAnchor: bottomOf(DIM.thigh),
      childAnchor: topOf(DIM.shin),
      limits: [-2.6, 2.6],
      strength: 1,
    },
  ];
}

export const JOINTS: readonly JointSpec[] = [
  {
    name: 'neck',
    parent: 'torso',
    child: 'head',
    parentAnchor: topOf(T),
    childAnchor: { x: 0, y: DIM.neck },
    limits: [-0.6, 0.6],
    strength: 0.6,
  },
  ...armJoints('L'),
  ...armJoints('R'),
  ...legJoints('L'),
  ...legJoints('R'),
];
