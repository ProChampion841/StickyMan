// Single import point for Rapier so the build variant can be swapped in one place.
// The deterministic build gives bit-identical results on every platform, which keeps
// rollback-style online multiplayer possible later without changing physics engines.
import RAPIER from '@dimforge/rapier2d-deterministic-compat';

export type * from '@dimforge/rapier2d-deterministic-compat';
export { RAPIER };

let ready: Promise<void> | null = null;

/** Loads Rapier's WASM. Safe to call more than once. */
export function initRapier(): Promise<void> {
  ready ??= RAPIER.init();
  return ready;
}
