import { TUNING } from '../config';
import { ALL_BITS, WORLD_BIT, interactionGroups } from './groups';
import { type Collider, type PhysicsHooks, RAPIER, type World } from './rapier';

export const FIXED_DT = 1 / 60;

/** How far (m) a body may sink into a one-way platform's top and still stand on it. */
const ONE_WAY_TOLERANCE = 0.06;

/** Axis-aligned static box in meters; x/y is the top-left corner. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  /** A platform you can jump up through from below and land on from above. */
  oneWay?: boolean;
}

export class PhysicsWorld {
  readonly world: World;
  readonly boxes: Box[] = [];
  /** Collider handle of each one-way platform, mapped to its top edge. */
  private readonly oneWayTops = new Map<number, number>();
  /**
   * Lowest point of every moving collider, recorded just before each step. The contact
   * filter reads this instead of querying Rapier, because it runs inside Rapier's step and
   * calling back into Rapier from there can leave the world in a broken, borrowed state.
   */
  private readonly lowestPoints = new Map<number, number>();
  private readonly hooks: PhysicsHooks;
  /**
   * Unused for events, but Rapier's JS bindings only run physics hooks when a step is given
   * an event queue. Auto-drained, so it never grows.
   */
  private readonly eventQueue = new RAPIER.EventQueue(true);

  constructor() {
    this.world = new RAPIER.World({ x: 0, y: TUNING.gravity });
    this.world.timestep = FIXED_DT;
    // Extra iterations keep the 9-joint ragdoll chains stiff under fast motion.
    this.world.integrationParameters.numSolverIterations = 8;
    this.hooks = {
      // A collider touches a one-way platform only once it is entirely at or above the
      // platform's top, so anything rising through from below passes straight through.
      filterContactPair: (handle1, handle2) => {
        const top1 = this.oneWayTops.get(handle1);
        const top = top1 ?? this.oneWayTops.get(handle2);
        if (top === undefined) return RAPIER.SolverFlags.COMPUTE_IMPULSE;
        const lowest = this.lowestPoints.get(top1 !== undefined ? handle2 : handle1);
        return lowest === undefined || lowest <= top + ONE_WAY_TOLERANCE ? RAPIER.SolverFlags.COMPUTE_IMPULSE : null;
      },
      filterIntersectionPair: () => true,
    };
  }

  addStaticBox(box: Box): void {
    this.boxes.push(box);
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(box.x + box.w / 2, box.y + box.h / 2),
    );
    const desc = RAPIER.ColliderDesc.cuboid(box.w / 2, box.h / 2)
      .setFriction(0.8)
      .setCollisionGroups(interactionGroups(WORLD_BIT, ALL_BITS));
    if (box.oneWay) desc.setActiveHooks(RAPIER.ActiveHooks.FILTER_CONTACT_PAIRS);
    const collider = this.world.createCollider(desc, body);
    if (box.oneWay) this.oneWayTops.set(collider.handle, box.y);
  }

  step(): void {
    this.world.gravity = { x: 0, y: TUNING.gravity };
    if (this.oneWayTops.size > 0) {
      this.lowestPoints.clear();
      this.world.forEachCollider((collider) => {
        if (!collider.parent()?.isFixed()) this.lowestPoints.set(collider.handle, lowestPoint(collider));
      });
    }
    this.world.step(this.eventQueue, this.hooks);
  }

  /** Frees the WASM memory behind the world. Unusable afterwards. */
  free(): void {
    this.eventQueue.free();
    this.world.free();
  }
}

/** Lowest point (largest y) of a ball or capsule collider. */
function lowestPoint(collider: Collider): number {
  // halfHeight() is only meaningful for capsules; balls report nothing useful, hence the fallback.
  const halfHeight = collider.halfHeight() || 0;
  return collider.translation().y + Math.abs(Math.cos(collider.rotation())) * halfHeight + collider.radius();
}
