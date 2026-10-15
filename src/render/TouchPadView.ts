import type Phaser from 'phaser';
import type { PadAction, PadButton, TouchPad } from '../input/TouchPad';
import { INK, type InkStyle, PAPER, toCss } from './palette';
import { drawShuriken } from './shuriken';

const LABELS: Partial<Record<PadAction, string>> = { punch: 'PUNCH', kick: 'KICK' };

/** Draws the on-screen buttons as ink circles on the page, filled with the player's color while held. */
export class TouchPadView {
  private readonly g: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.Text[] = [];
  private shown: readonly PadButton[] | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly depth: number,
    /** Hands each new object to the UI camera, so it doesn't shake or zoom with the fight. */
    private readonly register: (object: Phaser.GameObjects.GameObject) => void,
  ) {
    this.g = scene.add.graphics().setDepth(depth);
    register(this.g);
  }

  /**
   * `recharge` gives how much of a button's cooldown is left (0..1), shown as a pale wedge
   * sweeping back to full.
   */
  draw(pad: TouchPad, pens: readonly InkStyle[], recharge: (b: PadButton) => number = () => 0): void {
    if (pad.layout !== this.shown) this.rebuildLabels(pad.layout);
    const g = this.g;
    g.clear();
    for (const b of pad.layout) {
      const pressed = pad.isPressed(b);
      const pen = pens[b.owner];
      g.fillStyle(pressed ? pen.far : PAPER, pressed ? 0.9 : 0.55);
      g.fillCircle(b.x, b.y, b.r);
      g.lineStyle(3, pressed ? pen.near : INK, 0.85);
      g.strokeCircle(b.x, b.y, b.r);
      const s = b.r * 0.42;
      g.fillStyle(INK, 0.8);
      if (b.action === 'left') g.fillTriangle(b.x - s, b.y, b.x + s * 0.6, b.y - s, b.x + s * 0.6, b.y + s);
      if (b.action === 'right') g.fillTriangle(b.x + s, b.y, b.x - s * 0.6, b.y - s, b.x - s * 0.6, b.y + s);
      if (b.action === 'jump') g.fillTriangle(b.x, b.y - s, b.x - s, b.y + s * 0.6, b.x + s, b.y + s * 0.6);
      if (b.action === 'down') g.fillTriangle(b.x, b.y + s, b.x - s, b.y - s * 0.6, b.x + s, b.y - s * 0.6);
      if (b.action === 'special') drawShuriken(g, b.x, b.y, b.r * 0.55, 0.3, INK, 0.8);
      const left = recharge(b);
      if (left > 0) {
        g.fillStyle(PAPER, 0.75);
        g.slice(b.x, b.y, b.r, -Math.PI / 2, -Math.PI / 2 + left * Math.PI * 2, false);
        g.fillPath();
      }
    }
  }

  private rebuildLabels(layout: readonly PadButton[]): void {
    for (const label of this.labels) label.destroy();
    this.labels = layout.flatMap((b) => {
      const text = LABELS[b.action];
      if (!text) return [];
      const label = this.scene.add
        .text(b.x, b.y, text, {
          fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
          fontSize: `${Math.round(b.r * 0.36)}px`,
          fontStyle: 'bold',
          color: toCss(INK),
        })
        .setOrigin(0.5)
        .setDepth(this.depth + 1);
      this.register(label);
      return [label];
    });
    this.shown = layout;
  }
}
