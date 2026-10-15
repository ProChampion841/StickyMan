// Rapier interaction groups pack two 16-bit masks into one number:
// the upper half is what a collider IS, the lower half is what it COLLIDES WITH.
// Two colliders touch only if each one's membership is in the other's filter.

export const WORLD_BIT = 0x0001;
/** Shared by every stickman's arms, so arms pass through each other instead of tangling. */
export const ARM_BIT = 0x8000;
export const ALL_BITS = 0xffff;
export const MAX_PLAYERS = 14;

export function interactionGroups(membership: number, filter: number): number {
  return (((membership & 0xffff) << 16) | (filter & 0xffff)) >>> 0;
}

/** Each stickman gets its own bit so its limbs ignore each other but hit everything else. */
export function playerBit(index: number): number {
  if (index < 0 || index >= MAX_PLAYERS) throw new RangeError(`player index ${index} out of range 0..${MAX_PLAYERS - 1}`);
  return 1 << (index + 1);
}
