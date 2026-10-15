import Phaser from 'phaser';
import type { HitTier, MoveName } from '../combat/Fighter';
import type { Vec } from '../util/math';
import { INK, PAPER, toCss } from './palette';

const WORDS: Record<HitTier, readonly string[]> = {
  light: ['POW!', 'BIF!', 'PAF!', 'SOK!'],
  medium: ['WHAM!', 'SMACK!', 'THWACK!', 'BAM!'],
  heavy: ['KAPOW!', 'KRAK!', 'BOOM!', 'WHAMMO!'],
};
const HEAD_WORDS = ['BONK!', 'CLONK!'];
/** Signature moves shout their own name, so players learn what they just pulled off. */
const MOVE_WORDS: Partial<Record<MoveName, string>> = {
  risingDragon: 'RISING DRAGON!',
  tornadoKick: 'TORNADO!',
  legSweep: 'SWEEP!',
  dashStrike: 'SLASH!',
  flyingKnee: 'KNEE!',
  airChop: 'CHOP!',
  diveKick: 'DIVE KICK!',
  meteorStomp: 'METEOR!',
  shuriken: 'THUNK!',
};
/** Highlighter colors behind the words, hotter for bigger hits. */
const MARKER: Record<HitTier, number> = { light: 0xffe45c, medium: 0xffb347, heavy: 0xff7a6b };
const FONT_SIZE: Record<HitTier, number> = { light: 26, medium: 32, heavy: 40 };
/** Words on screen at once; the oldest goes first. */
const MAX_WORDS = 3;
/** Words longer than this many characters are set smaller. */
const LONG_WORD = 9;

/** Picks the comic-book word for a hit. */
export function hitWord(tier: HitTier, head: boolean, ko: boolean, move?: MoveName): string {
  if (ko) return 'KABOOM!';
  const named = move && MOVE_WORDS[move];
  if (named) return named;
  const pool = head && tier !== 'heavy' ? HEAD_WORDS : WORDS[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Comic-book sound words ("POW!", "BONK!") that pop out of an impact on a jagged
 * highlighter burst, tilt a little, hang for a beat and float away.
 */
export class ComicFx {
  private words: Phaser.GameObjects.Container[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    /** Hands each new object to the world camera. */
    private readonly register: (object: Phaser.GameObjects.GameObject) => void,
    private readonly depth: number,
  ) {}

  /**
   * Pops `word` above `at` (pixels) on the attacker's side: the victim flies the other way,
   * so the word never hides the best part of the hit.
   */
  pop(word: string, at: Vec, tier: HitTier, direction: 1 | -1): void {
    // Long move names shrink, so the burst never hides the fight.
    const size = Math.round(FONT_SIZE[tier] * Math.min(1, LONG_WORD / word.length));
    const text = this.scene.add
      .text(0, 0, word, {
        fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
        fontSize: `${size}px`,
        fontStyle: 'bold italic',
        color: toCss(INK),
        stroke: toCss(PAPER),
        strokeThickness: Math.round(size / 7),
      })
      .setOrigin(0.5);
    const burst = this.scene.add.graphics();
    const outer = text.width * 0.62 + 12;
    const inner = outer * 0.72;
    const spikes = 14;
    const points: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = (i % 2 === 0 ? outer : inner) * (0.9 + Math.random() * 0.2);
      // Squashed vertically so the burst hugs the word.
      points.push(new Phaser.Math.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.62));
    }
    burst.fillStyle(MARKER[tier], 1);
    burst.fillPoints(points, true);
    burst.lineStyle(3, INK, 1);
    burst.strokePoints(points, true);

    const container = this.scene.add
      .container(at.x - direction * (outer * 0.55), at.y - 70 - size * 0.5, [burst, text])
      .setDepth(this.depth)
      .setRotation(-direction * (0.08 + Math.random() * 0.16))
      .setScale(0.2);
    this.register(container);
    this.words.push(container);
    while (this.words.length > MAX_WORDS) this.words.shift()?.destroy();

    const hold = tier === 'heavy' ? 420 : 260;
    this.scene.tweens.add({ targets: container, scale: 1, duration: 140, ease: 'Back.easeOut' });
    this.scene.tweens.add({
      targets: container,
      alpha: 0,
      y: container.y - 26,
      delay: 140 + hold,
      duration: 220,
      onComplete: () => {
        this.words = this.words.filter((w) => w !== container);
        container.destroy();
      },
    });
  }

  clear(): void {
    for (const word of this.words) word.destroy();
    this.words = [];
  }
}
