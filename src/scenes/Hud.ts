import type Phaser from 'phaser';
import { MAX_HP, SPECIAL_COOLDOWN, type SpecialName } from '../combat/Fighter';
import { VIEW_WIDTH } from '../config';
import { type Match, ROUNDS_TO_WIN } from '../game/Match';
import { INK, type InkStyle, PAPER, PENCIL, WARNING_RED, toCss } from '../render/palette';
import { drawShuriken } from '../render/shuriken';

const BAR_WIDTH = 420;
const BAR_HEIGHT = 16;
const BAR_Y = 18;
/** Left edge of P1's bar; P2's mirrors it on the right. */
const BAR_MARGIN = 130;
const PIP_RADIUS = 6;
/** Damage first shows as a pale trail that holds briefly, then drains down to the real health. */
const TRAIL_HOLD = 0.45;
const TRAIL_DRAIN_PER_SECOND = 60;
const FONT = '"Trebuchet MS", "Segoe UI", sans-serif';
const BANNER_Y = 230;
/** Special-move icons under the outer end of each bar, showing their recharge. */
const ICON_RADIUS = 11;
const ICON_Y = BAR_Y + BAR_HEIGHT + 18;
const ICONS: readonly SpecialName[] = ['shuriken', 'smokeVanish'];
/** The hit counter shows from this many hits in a row, and fades this long after the last. */
const COMBO_MIN = 2;
const COMBO_SHOW = 1.3;
const COMBO_Y = ICON_Y + 34;

export interface BannerOptions {
  size?: number;
  /** Seconds before it appears. */
  delay?: number;
  /** Seconds it stays fully visible. */
  hold?: number;
  /** Smaller line underneath. */
  sub?: string;
  /** Stays until clearBanners(). */
  persist?: boolean;
}

/** Health bars with damage trails, round-win pips, the round clock, and center banners. */
export class Hud {
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly labels: Phaser.GameObjects.Text[];
  private readonly clock: Phaser.GameObjects.Text;
  private banners: Phaser.GameObjects.Text[] = [];
  private readonly trail = [MAX_HP, MAX_HP];
  private readonly hold = [0, 0];
  private readonly lastHp = [MAX_HP, MAX_HP];
  private clockUrgent = false;
  private readonly comboTexts: Phaser.GameObjects.Text[];
  private readonly comboTimers = [0, 0];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly pens: readonly InkStyle[],
    /** Hands each new object to the UI camera, so it doesn't shake or zoom with the fight. */
    private readonly register: (object: Phaser.GameObjects.GameObject) => void,
  ) {
    this.g = scene.add.graphics();
    register(this.g);
    this.labels = pens.map((pen, i) => {
      const x = i === 0 ? BAR_MARGIN - 14 : VIEW_WIDTH - BAR_MARGIN + 14;
      const label = scene.add
        .text(x, BAR_Y + BAR_HEIGHT / 2, '', { fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', color: toCss(pen.near) })
        .setOrigin(i === 0 ? 1 : 0, 0.5);
      register(label);
      return label;
    });
    this.clock = scene.add
      .text(VIEW_WIDTH / 2, BAR_Y + BAR_HEIGHT / 2, '', { fontFamily: FONT, fontSize: '30px', fontStyle: 'bold', color: toCss(INK) })
      .setOrigin(0.5);
    register(this.clock);
    this.comboTexts = pens.map((pen, i) => {
      const text = scene.add
        .text(i === 0 ? BAR_MARGIN : VIEW_WIDTH - BAR_MARGIN, COMBO_Y, '', {
          fontFamily: FONT,
          fontSize: '30px',
          fontStyle: 'bold italic',
          color: toCss(pen.near),
          stroke: toCss(PAPER),
          strokeThickness: 5,
        })
        .setOrigin(i === 0 ? 0 : 1, 0.5)
        .setAlpha(0);
      register(text);
      return text;
    });
  }

  /** Shows fighter `index`'s hit streak, popping on each new hit. */
  combo(index: number, hits: number): void {
    if (hits < COMBO_MIN) return;
    const text = this.comboTexts[index];
    text.setText(`${hits} HITS`).setAlpha(1).setScale(1.35);
    this.scene.tweens.killTweensOf(text);
    this.scene.tweens.add({ targets: text, scale: 1, duration: 160, ease: 'Back.easeOut' });
    this.comboTimers[index] = COMBO_SHOW;
  }

  setLabels(labels: readonly string[]): void {
    labels.forEach((label, i) => this.labels[i].setText(label));
  }

  update(dt: number, match: Match): void {
    const g = this.g;
    g.clear();
    match.fighters.forEach((fighter, i) => {
      const pen = this.pens[i];
      const hp = Math.min(fighter.hp, MAX_HP);
      if (hp < this.lastHp[i]) this.hold[i] = TRAIL_HOLD;
      if (hp > this.lastHp[i]) this.trail[i] = hp;
      this.lastHp[i] = hp;
      this.hold[i] -= dt;
      if (this.hold[i] <= 0) this.trail[i] = Math.max(hp, this.trail[i] - TRAIL_DRAIN_PER_SECOND * dt);

      const x = i === 0 ? BAR_MARGIN : VIEW_WIDTH - BAR_MARGIN - BAR_WIDTH;
      // P1 drains toward the left edge and P2 toward the right, like a fighting game.
      const fill = (value: number, color: number) => {
        const w = (BAR_WIDTH * value) / MAX_HP;
        g.fillStyle(color, 1);
        g.fillRect(i === 0 ? x : x + BAR_WIDTH - w, BAR_Y, w, BAR_HEIGHT);
      };
      g.fillStyle(PAPER, 1);
      g.fillRect(x, BAR_Y, BAR_WIDTH, BAR_HEIGHT);
      fill(this.trail[i], pen.far);
      fill(hp, pen.near);
      g.lineStyle(3, INK, 1);
      g.strokeRect(x, BAR_Y, BAR_WIDTH, BAR_HEIGHT);

      // Round wins, at the inner end of each bar.
      for (let r = 0; r < ROUNDS_TO_WIN; r++) {
        const px = i === 0 ? x + BAR_WIDTH - PIP_RADIUS - r * 18 : x + PIP_RADIUS + r * 18;
        const py = BAR_Y + BAR_HEIGHT + 14;
        if (r < match.wins[i]) {
          g.fillStyle(pen.near, 1);
          g.fillCircle(px, py, PIP_RADIUS);
        }
        g.lineStyle(2, INK, 1);
        g.strokeCircle(px, py, PIP_RADIUS);
      }
    });

    match.fighters.forEach((fighter, i) => {
      ICONS.forEach((special, k) => {
        const offset = ICON_RADIUS + k * (ICON_RADIUS * 2 + 8);
        const x = i === 0 ? BAR_MARGIN + offset : VIEW_WIDTH - BAR_MARGIN - offset;
        this.drawSpecialIcon(x, special, fighter.cooldowns[special] / SPECIAL_COOLDOWN[special], this.pens[i]);
      });
      this.comboTimers[i] -= dt;
      const text = this.comboTexts[i];
      if (this.comboTimers[i] <= 0 && text.alpha > 0) text.setAlpha(Math.max(0, text.alpha - dt * 4));
    });

    const seconds = Math.ceil(match.clock);
    this.clock.setText(String(seconds));
    const urgent = seconds <= 10 && match.phase === 'fight';
    // Only restyle on change: Phaser re-renders a text's texture on every style call.
    if (urgent !== this.clockUrgent) {
      this.clockUrgent = urgent;
      this.clock.setColor(toCss(urgent ? WARNING_RED : INK));
    }
  }

  banner(text: string, options: BannerOptions = {}): void {
    const size = options.size ?? 88;
    const delay = (options.delay ?? 0) * 1000;
    const hold = (options.hold ?? 1) * 1000;
    const style = (fontSize: number): Phaser.Types.GameObjects.Text.TextStyle => ({
      fontFamily: FONT,
      fontSize: `${fontSize}px`,
      fontStyle: 'bold italic',
      color: toCss(INK),
      stroke: toCss(PAPER),
      strokeThickness: Math.max(4, fontSize / 9),
    });
    const parts = [this.scene.add.text(VIEW_WIDTH / 2, BANNER_Y, text, style(size)).setOrigin(0.5)];
    if (options.sub) {
      parts.push(this.scene.add.text(VIEW_WIDTH / 2, BANNER_Y + size * 0.8, options.sub, style(22)).setOrigin(0.5));
    }
    for (const part of parts) {
      this.register(part);
      part.setAlpha(0).setScale(0.3);
      this.banners.push(part);
      this.scene.tweens.add({ targets: part, alpha: 1, scale: 1, delay, duration: 260, ease: 'Back.easeOut' });
      if (!options.persist) {
        this.scene.tweens.add({
          targets: part,
          alpha: 0,
          delay: delay + 260 + hold,
          duration: 300,
          onComplete: () => this.remove(part),
        });
      }
    }
  }

  clearBanners(): void {
    for (const banner of this.banners) {
      this.scene.tweens.killTweensOf(banner);
      banner.destroy();
    }
    this.banners = [];
  }

  reset(): void {
    this.comboTimers.fill(0);
    for (const text of this.comboTexts) text.setAlpha(0);
    this.trail.fill(MAX_HP);
    this.hold.fill(0);
    this.lastHp.fill(MAX_HP);
    this.clearBanners();
  }

  /** A special's icon; a pale wedge covers the part still recharging (`left` 1 = just used). */
  private drawSpecialIcon(x: number, special: SpecialName, left: number, pen: InkStyle): void {
    const g = this.g;
    const ready = left <= 0;
    g.fillStyle(PAPER, 1);
    g.fillCircle(x, ICON_Y, ICON_RADIUS);
    if (special === 'shuriken') {
      drawShuriken(g, x, ICON_Y, ICON_RADIUS * 0.8, 0.3, ready ? pen.near : PENCIL);
    } else {
      // A little smoke cloud.
      g.fillStyle(ready ? pen.near : PENCIL, 1);
      g.fillCircle(x - 4, ICON_Y + 2, 4.5);
      g.fillCircle(x + 4, ICON_Y + 2, 4.5);
      g.fillCircle(x, ICON_Y - 3, 5.5);
    }
    if (!ready) {
      g.fillStyle(PAPER, 0.7);
      g.slice(x, ICON_Y, ICON_RADIUS, -Math.PI / 2, -Math.PI / 2 + left * Math.PI * 2, false);
      g.fillPath();
    }
    g.lineStyle(2, ready ? INK : PENCIL, 1);
    g.strokeCircle(x, ICON_Y, ICON_RADIUS);
  }

  private remove(banner: Phaser.GameObjects.Text): void {
    this.banners = this.banners.filter((b) => b !== banner);
    banner.destroy();
  }
}
