export type PadAction = 'left' | 'right' | 'down' | 'jump' | 'punch' | 'kick' | 'special';

/** One on-screen button, in game pixels (1280 x 720). */
export interface PadButton {
  /** Index of the fighter it controls. */
  owner: number;
  action: PadAction;
  x: number;
  y: number;
  r: number;
}

/** Touch area as a multiple of the drawn radius; fingers are imprecise. */
const HIT_SLOP = 1.2;

/** The direction pad: a thumb slides between these without lifting. */
const isMove = (action: PadAction) => action === 'left' || action === 'right' || action === 'down';

/**
 * Multi-touch on-screen buttons, without Phaser so it can be tested. Each finger holds at
 * most one button; a thumb sliding between the arrows (◀ ▼ ▶) switches direction without
 * lifting, and a finger that drifts off its button keeps holding it until lifted.
 */
export class TouchPad {
  private buttons: readonly PadButton[] = [];
  /** Finger (pointer id) to the button it holds. */
  private readonly holds = new Map<number, PadButton>();

  get layout(): readonly PadButton[] {
    return this.buttons;
  }

  setLayout(buttons: readonly PadButton[]): void {
    this.buttons = buttons;
    this.holds.clear();
  }

  /** A finger touched down; returns the button it pressed, if any. */
  press(pointerId: number, x: number, y: number): PadButton | null {
    const button = this.buttonAt(x, y, () => true);
    if (button) this.holds.set(pointerId, button);
    return button;
  }

  slide(pointerId: number, x: number, y: number): void {
    const held = this.holds.get(pointerId);
    if (!held || !isMove(held.action)) return;
    const onto = this.buttonAt(x, y, (b) => b.owner === held.owner && isMove(b.action));
    if (onto) this.holds.set(pointerId, onto);
  }

  release(pointerId: number): void {
    this.holds.delete(pointerId);
  }

  releaseAll(): void {
    this.holds.clear();
  }

  isHeld(owner: number, action: PadAction): boolean {
    for (const b of this.holds.values()) if (b.owner === owner && b.action === action) return true;
    return false;
  }

  isPressed(button: PadButton): boolean {
    for (const b of this.holds.values()) if (b === button) return true;
    return false;
  }

  /** Closest button within its touch area, among those `accept` allows. */
  private buttonAt(x: number, y: number, accept: (b: PadButton) => boolean): PadButton | null {
    let best: PadButton | null = null;
    let bestDistance = Infinity;
    for (const b of this.buttons) {
      const distance = Math.hypot(x - b.x, y - b.y);
      if (distance <= b.r * HIT_SLOP && distance < bestDistance && accept(b)) {
        best = b;
        bestDistance = distance;
      }
    }
    return best;
  }
}

const VIEW_WIDTH = 1280;

/**
 * Button layouts, kept below the side platforms (whose undersides are at y 522) and clear of
 * the spawn points. Against the computer, the arrows (◀ ▼ ▶) sit bottom-left and the actions
 * fan around the right thumb, with the most-used button (punch) in the corner. With two
 * players on one device, each gets a compact cluster in their own bottom corner, mirrored.
 */
export function touchLayout(mode: 'vsBot' | 'versus'): PadButton[] {
  if (mode === 'vsBot') {
    return [
      { owner: 0, action: 'left', x: 80, y: 630, r: 48 },
      { owner: 0, action: 'down', x: 185, y: 668, r: 40 },
      { owner: 0, action: 'right', x: 290, y: 630, r: 48 },
      { owner: 0, action: 'punch', x: 1190, y: 620, r: 56 },
      { owner: 0, action: 'kick', x: 1070, y: 660, r: 46 },
      { owner: 0, action: 'jump', x: 1205, y: 495, r: 46 },
      { owner: 0, action: 'special', x: 1095, y: 562, r: 36 },
    ];
  }
  const cluster: Omit<PadButton, 'owner'>[] = [
    { action: 'left', x: 45, y: 676, r: 36 },
    { action: 'down', x: 125, y: 676, r: 36 },
    { action: 'right', x: 205, y: 676, r: 36 },
    { action: 'jump', x: 45, y: 596, r: 36 },
    { action: 'special', x: 125, y: 596, r: 36 },
    { action: 'punch', x: 205, y: 596, r: 36 },
    { action: 'kick', x: 290, y: 636, r: 36 },
  ];
  const p1 = cluster.map((b) => ({ ...b, owner: 0 }));
  // Mirror positions for P2, but keep ◀ to the left of ▶.
  const p2 = cluster.map((b): PadButton => {
    const action: PadAction = b.action === 'left' ? 'right' : b.action === 'right' ? 'left' : b.action;
    return { ...b, action, owner: 1, x: VIEW_WIDTH - b.x };
  });
  return [...p1, ...p2];
}
