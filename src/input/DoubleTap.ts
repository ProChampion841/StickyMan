/** Two taps of the same direction this close together (seconds) make a dash. */
export const DOUBLE_TAP_WINDOW = 0.25;

/**
 * Spots a direction tapped twice in quick succession (keys or on-screen arrows), per player.
 * A third tap starts counting afresh, so mashing doesn't dash on every press.
 */
export class DoubleTap {
  private readonly last = new Map<number, { dir: 1 | -1; at: number }>();

  /** Records `owner` tapping `dir` at `now` (seconds); true if that completes a double tap. */
  tap(owner: number, dir: 1 | -1, now: number): boolean {
    const previous = this.last.get(owner);
    if (previous && previous.dir === dir && now - previous.at <= DOUBLE_TAP_WINDOW) {
      this.last.delete(owner);
      return true;
    }
    this.last.set(owner, { dir, at: now });
    return false;
  }

  clear(): void {
    this.last.clear();
  }
}
