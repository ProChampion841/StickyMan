import type { Vec } from '../util/math';
import type { PhysicsWorld } from './PhysicsWorld';
import { type ImpulseJoint, RAPIER, type RigidBody } from './rapier';

/** Spring constants for the pointer grab. Rapier solves the spring implicitly, so stiff values stay stable. */
const STIFFNESS = 900;
const DAMPING = 60;

/**
 * Pointer "hand": a hidden kinematic body follows the pointer and drags whatever
 * was grabbed through a zero-length spring attached exactly where it was clicked.
 */
export class Grabber {
  private readonly cursor: RigidBody;
  private joint: ImpulseJoint | null = null;
  private grabbedBody: RigidBody | null = null;
  private grabbedLocal: Vec = { x: 0, y: 0 };

  constructor(private readonly physics: PhysicsWorld) {
    this.cursor = physics.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased());
  }

  get active(): boolean {
    return this.joint !== null;
  }

  /** World position of the grabbed point on the body, for drawing the drag line. */
  grabPoint(): Vec | null {
    const body = this.grabbedBody;
    if (!body) return null;
    const t = body.translation();
    const c = Math.cos(body.rotation());
    const s = Math.sin(body.rotation());
    const l = this.grabbedLocal;
    return { x: t.x + c * l.x - s * l.y, y: t.y + s * l.x + c * l.y };
  }

  cursorPosition(): Vec {
    const t = this.cursor.translation();
    return { x: t.x, y: t.y };
  }

  grab(body: RigidBody, worldPoint: Vec): void {
    this.release();
    this.cursor.setTranslation(worldPoint, true);
    const t = body.translation();
    const c = Math.cos(body.rotation());
    const s = Math.sin(body.rotation());
    const dx = worldPoint.x - t.x;
    const dy = worldPoint.y - t.y;
    // World offset rotated into the body's local frame.
    this.grabbedLocal = { x: c * dx + s * dy, y: -s * dx + c * dy };
    this.grabbedBody = body;
    this.joint = this.physics.world.createImpulseJoint(
      RAPIER.JointData.spring(0, STIFFNESS, DAMPING, { x: 0, y: 0 }, this.grabbedLocal),
      this.cursor,
      body,
      true,
    );
  }

  moveTo(worldPoint: Vec): void {
    this.cursor.setNextKinematicTranslation(worldPoint);
  }

  release(): void {
    if (this.joint) this.physics.world.removeImpulseJoint(this.joint, true);
    this.joint = null;
    this.grabbedBody = null;
  }
}
