import { BOT_PROFILES, Bot, type BotLevel } from '../ai/Bot';
import { type CombatEvent, Fighter } from '../combat/Fighter';
import { TUNING } from '../config';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { type Motion, Stickman } from '../stickman/Stickman';
import { type Vec, clamp } from '../util/math';
import type { Rng } from '../util/random';
import { Eraser, type EraserEvent } from './Eraser';
import { Ink, type InkEvent } from './Ink';
import { ARENA_BOXES, ARENA_HEIGHT, ARENA_WIDTH, FLOOR_Y, SPAWNS } from './level';

/** versus: two humans. vsBot: P1 human, P2 computer. demo: two computers, behind the title screen. */
export type MatchMode = 'versus' | 'vsBot' | 'demo';
export type MatchPhase = 'intro' | 'fight' | 'roundOver' | 'matchOver';

export type MatchEvent =
  | CombatEvent
  | EraserEvent
  | InkEvent
  | { type: 'motion'; fighter: Fighter; motion: Motion }
  | { type: 'shurikenStuck'; point: Vec }
  | { type: 'vanish'; fighter: Fighter; from: Vec; to: Vec }
  | { type: 'roundStart'; round: number; final: boolean }
  | { type: 'fight' }
  | { type: 'roundOver'; winner: number | null; reason: 'ko' | 'time' }
  | { type: 'matchOver'; winner: number };

export interface MatchOptions {
  mode: MatchMode;
  botLevel?: BotLevel;
  rng?: Rng;
}

/** A throwing star in flight (or stuck in the scenery, fading). Meters. */
export interface Shuriken {
  owner: Fighter;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Spin angle, for drawing. */
  angle: number;
  /** Seconds left: flying time, or fade time once stuck. */
  life: number;
  stuck: boolean;
}

export const ROUNDS_TO_WIN = 2;
/** "Round N" shows for this long before the fight starts. */
export const INTRO_TIME = 1.3;
/** Pause after a round ends (simulation seconds, so a knockout's slow motion stretches it). */
export const ROUND_OVER_TIME = 2.6;
const SHURIKEN_SPEED = 16;
const SHURIKEN_LIFE = 1.4;
const SHURIKEN_STUCK_TIME = 0.8;
/** How close (m) a star must pass to a body part's surface to hit it. */
const SHURIKEN_REACH = 0.08;
/** Stars move in hops of at most this (m) when checking what they hit. */
const SHURIKEN_HOP = 0.05;
/** The vanish reappears this far (m) behind the opponent. */
const VANISH_BEHIND = 1;

/**
 * One best-of-three match: the physics world, both fighters, any computer players, the
 * eraser, thrown stars, and the round flow. Has no Phaser dependency, so whole matches run in tests.
 */
export class Match {
  readonly mode: MatchMode;
  readonly physics = new PhysicsWorld();
  readonly fighters: Fighter[];
  /** Per fighter: the computer player driving it, or null for a human. */
  readonly bots: (Bot | null)[];
  readonly eraser: Eraser;
  /** Everyone's drawings and ink meters. */
  readonly ink: Ink;
  readonly shurikens: Shuriken[] = [];
  readonly wins = [0, 0];
  phase: MatchPhase = 'intro';
  round = 1;
  /** Seconds left in the round. */
  clock = TUNING.roundTime;
  matchWinner: number | null = null;
  private phaseTime = 0;
  private announced = false;

  constructor(options: MatchOptions) {
    const rng = options.rng ?? Math.random;
    this.mode = options.mode;
    for (const box of ARENA_BOXES) this.physics.addStaticBox(box);
    this.fighters = SPAWNS.map((spawn, index) => {
      const fighter = new Fighter(
        new Stickman(this.physics, { index, spawn: { x: spawn.x, y: FLOOR_Y }, facing: spawn.facing }),
      );
      fighter.recovers = false;
      return fighter;
    });
    const profile = BOT_PROFILES[options.botLevel ?? 'normal'];
    const isBot = (index: number) => options.mode === 'demo' || (options.mode === 'vsBot' && index === 1);
    this.bots = this.fighters.map((fighter, i) => (isBot(i) ? new Bot(fighter, profile, rng) : null));
    this.eraser = new Eraser(FLOOR_Y, ARENA_WIDTH, rng);
    this.ink = new Ink(this.physics, this.fighters);
  }

  get isFinalRound(): boolean {
    return this.wins.every((w) => w === ROUNDS_TO_WIN - 1);
  }

  /** Advances the whole match by one fixed step. Human inputs must already be set on the fighters. */
  step(dt: number, events: MatchEvent[]): void {
    if (!this.announced) {
      this.announced = true;
      events.push({ type: 'roundStart', round: this.round, final: this.isFinalRound });
    }
    this.phaseTime += dt;
    if (this.phase === 'intro' && this.phaseTime >= INTRO_TIME) this.setPhase('fight', events);

    const fighting = this.phase === 'fight';
    this.fighters.forEach((fighter, i) => {
      const bot = this.bots[i];
      if (!fighting) fighter.idle();
      else if (bot) bot.update(dt, this.fighters[1 - i], this, events);
    });

    const firstNew = events.length;
    for (const fighter of this.fighters) {
      fighter.man.snapshot();
      fighter.preStep(dt, events, this.fighters);
    }
    // Specials thrown this step: stars take flight, vanishes blink across.
    for (let i = firstNew; i < events.length; i++) {
      const event = events[i];
      if (event.type !== 'special') continue;
      if (event.special === 'shuriken') this.throwShuriken(event.fighter, event.point, event.direction);
      else this.vanish(event.fighter, events);
    }
    for (const fighter of this.fighters) {
      fighter.man.preStep(dt);
      for (const motion of fighter.man.motions) events.push({ type: 'motion', fighter, motion });
      fighter.man.motions.length = 0;
    }
    this.physics.step();
    for (const fighter of this.fighters) fighter.postStep(this.fighters, events);
    this.stepShurikens(dt, events);
    // Landing hits keeps the pen wet.
    for (let i = firstNew; i < events.length; i++) {
      const event = events[i];
      if (event.type === 'hit') this.ink.rewardHit(event.attacker);
    }
    if (!fighting) for (const fighter of this.fighters) this.ink.cancel(fighter);
    this.ink.step(dt, events, this.eraser);
    this.eraser.step(dt, this.fighters, events, fighting);
    this.rescueStrays();

    if (fighting) {
      this.clock = Math.max(0, this.clock - dt);
      this.checkRoundEnd(events);
    } else if (this.phase === 'roundOver' && this.phaseTime >= ROUND_OVER_TIME) {
      const champion = this.wins.findIndex((w) => w >= ROUNDS_TO_WIN);
      if (champion >= 0) {
        this.matchWinner = champion;
        this.setPhase('matchOver', events);
        events.push({ type: 'matchOver', winner: champion });
      } else {
        this.nextRound(events);
      }
    }
  }

  /** The other fighter. */
  opponentOf(fighter: Fighter): Fighter {
    return this.fighters[0] === fighter ? this.fighters[1] : this.fighters[0];
  }

  /** Frees the physics world's WASM memory. The match can't be used afterwards. */
  dispose(): void {
    this.physics.free();
  }

  private throwShuriken(owner: Fighter, from: Vec, direction: 1 | -1): void {
    // Thrown from the air, it angles down toward the floor where opponents stand.
    const vy = owner.man.grounded ? 0 : 5;
    this.shurikens.push({ owner, x: from.x, y: from.y, vx: direction * SHURIKEN_SPEED, vy, angle: 0, life: SHURIKEN_LIFE, stuck: false });
  }

  private stepShurikens(dt: number, events: MatchEvent[]): void {
    for (const star of this.shurikens) {
      star.life -= dt;
      if (star.stuck) continue;
      star.angle += Math.sign(star.vx || 1) * 25 * dt;
      // Travel in short hops, so a fast star can't skip over a thin drawn line or a limb.
      const hops = Math.max(1, Math.ceil((Math.hypot(star.vx, star.vy) * dt) / SHURIKEN_HOP));
      for (let i = 0; i < hops && star.life > 0 && !star.stuck; i++) {
        star.x += (star.vx * dt) / hops;
        star.y += (star.vy * dt) / hops;
        this.shurikenContact(star, events);
      }
    }
    for (let i = this.shurikens.length - 1; i >= 0; i--) if (this.shurikens[i].life <= 0) this.shurikens.splice(i, 1);
  }

  /** A star hits a fighter, bites into a wall or drawn line, or glances off a boulder. */
  private shurikenContact(star: Shuriken, events: MatchEvent[]): void {
    for (const fighter of this.fighters) {
      if (fighter === star.owner) continue;
      const hit = fighter.man.nearestPart(star, false);
      if (hit.distance > SHURIKEN_REACH) continue;
      star.life = 0;
      events.push({
        type: 'hit',
        ...fighter.receive(star.owner, {
          move: 'shuriken',
          kind: 'special',
          part: hit.part,
          point: { x: star.x, y: star.y },
          direction: star.vx >= 0 ? 1 : -1,
          damage: TUNING.shurikenDamage,
          knockback: { x: 1.2, y: -0.4 },
          launches: false,
          stun: 0.2,
          tier: 'light',
        }),
      });
      return;
    }
    const ink = this.ink.blocks(star);
    if (ink === 'rock') {
      star.life = 0;
      events.push({ type: 'shurikenStuck', point: { x: star.x, y: star.y } });
    } else if (ink === 'line' || this.inScenery(star)) {
      star.stuck = true;
      star.life = SHURIKEN_STUCK_TIME;
      events.push({ type: 'shurikenStuck', point: { x: star.x, y: star.y } });
    }
  }

  private inScenery(p: Vec): boolean {
    return ARENA_BOXES.some((b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
  }

  /** Smoke vanish: reappear behind the opponent, facing their back. */
  private vanish(fighter: Fighter, events: MatchEvent[]): void {
    const man = fighter.man;
    const opponent = this.opponentOf(fighter).man;
    const from = man.centerOfMass();
    const target = opponent.centerOfMass();
    let x = target.x - opponent.facing * VANISH_BEHIND;
    // Cornered against a wall: come out the other side instead.
    if (x < 0.8 || x > ARENA_WIDTH - 0.8) x = target.x + opponent.facing * VANISH_BEHIND;
    x = clamp(x, 0.8, ARENA_WIDTH - 0.8);
    const dx = x - from.x;
    const dy = opponent.pelvis().y - man.pelvis().y;
    for (const body of Object.values(man.parts)) {
      const t = body.translation();
      body.setTranslation({ x: t.x + dx, y: t.y + dy }, true);
      body.setLinvel({ x: 0, y: 0 }, true);
      body.setAngvel(0, true);
    }
    man.facing = x < target.x ? 1 : -1;
    // No interpolated streak across the arena.
    man.snapshot();
    events.push({ type: 'vanish', fighter, from, to: { x, y: from.y + dy } });
  }

  private checkRoundEnd(events: MatchEvent[]): void {
    const down = this.fighters.map((f) => f.knockedOut);
    let winner: number | null;
    let reason: 'ko' | 'time';
    if (down.some(Boolean)) {
      reason = 'ko';
      winner = down.every(Boolean) ? null : down.indexOf(false);
    } else if (this.clock <= 0) {
      reason = 'time';
      const [a, b] = this.fighters.map((f) => f.hp);
      winner = a === b ? null : a > b ? 0 : 1;
    } else {
      return;
    }
    if (winner !== null) this.wins[winner]++;
    this.setPhase('roundOver', events);
    events.push({ type: 'roundOver', winner, reason });
  }

  private nextRound(events: MatchEvent[]): void {
    this.round++;
    this.clock = TUNING.roundTime;
    for (const fighter of this.fighters) {
      fighter.reset();
      fighter.man.reset();
    }
    this.eraser.reset();
    this.ink.reset();
    this.shurikens.length = 0;
    this.setPhase('intro', events);
    events.push({ type: 'roundStart', round: this.round, final: this.isFinalRound });
  }

  private setPhase(phase: MatchPhase, events: MatchEvent[]): void {
    this.phase = phase;
    this.phaseTime = 0;
    if (phase === 'fight') events.push({ type: 'fight' });
  }

  /** Puts back anyone flung out of the arena (only possible through a physics glitch or a mouse fling). */
  private rescueStrays(): void {
    for (const { man } of this.fighters) {
      const p = man.pelvis();
      if (p.y > ARENA_HEIGHT + 5 || p.x < -5 || p.x > ARENA_WIDTH + 5) man.reset();
    }
  }
}
