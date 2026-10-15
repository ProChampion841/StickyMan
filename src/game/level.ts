import { PPM, VIEW_HEIGHT, VIEW_WIDTH } from '../config';
import type { Box } from '../physics/PhysicsWorld';

/** The arena fills the view: 20 x 11.25 m at 64 px per meter. */
export const ARENA_WIDTH = VIEW_WIDTH / PPM;
export const ARENA_HEIGHT = VIEW_HEIGHT / PPM;
export const FLOOR_Y = ARENA_HEIGHT - 1.05;

export const ARENA_BOXES: readonly Box[] = [
  { x: -1, y: FLOOR_Y, w: ARENA_WIDTH + 2, h: ARENA_HEIGHT - FLOOR_Y + 1 },
  { x: -1, y: -20, w: 1.2, h: FLOOR_Y + 20 },
  { x: ARENA_WIDTH - 0.2, y: -20, w: 1.2, h: FLOOR_Y + 20 },
  // Tops 2.3 m apart: reachable with a held jump, while leaving 2.05 m of headroom
  // underneath so a 1.86 m stickman can walk below without wedging its head.
  { x: 2.2, y: FLOOR_Y - 2.3, w: 3.5, h: 0.25, oneWay: true },
  { x: ARENA_WIDTH - 5.7, y: FLOOR_Y - 2.3, w: 3.5, h: 0.25, oneWay: true },
  { x: ARENA_WIDTH / 2 - 1.75, y: FLOOR_Y - 4.6, w: 3.5, h: 0.25, oneWay: true },
];

/**
 * Where each player starts a round, standing on the floor: far enough in that the on-screen
 * buttons in the bottom corners don't cover them.
 */
export const SPAWNS: readonly { x: number; facing: 1 | -1 }[] = [
  { x: 6, facing: 1 },
  { x: ARENA_WIDTH - 6, facing: -1 },
];
