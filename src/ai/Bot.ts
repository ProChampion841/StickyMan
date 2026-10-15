import type { Fighter } from '../combat/Fighter';
import { TUNING } from '../config';
import type { Eraser } from '../game/Eraser';
import type { Rng } from '../util/random';

export interface BotProfile {
  /** Average seconds between decisions; lower reacts faster. */
  reaction: number;
  /** Chance to start a combo string when in range at each decision. */
  aggression: number;
  /** Chance to evade (vanish, jump over, back off) when the opponent swings at close range. */
  caution: number;
  /** Chance to time a jump over each eraser sweep. */
  hazardSkill: number;
  /** Chance per decision to throw a star or dash in from range. */
  rangedChance: number;
  /** Chance to chase a launched opponent into the air. */
  airChase: number;
}

export type BotLevel = 'easy' | 'normal' | 'hard';

export const BOT_PROFILES: Record<BotLevel, BotProfile> = {
  easy: { reaction: 0.32, aggression: 0.45, caution: 0.1, hazardSkill: 0.55, rangedChance: 0.15, airChase: 0.2 },
  normal: { reaction: 0.2, aggression: 0.7, caution: 0.3, hazardSkill: 0.85, rangedChance: 0.3, airChase: 0.5 },
  hard: { reaction: 0.11, aggression: 0.85, caution: 0.5, hazardSkill: 0.97, rangedChance: 0.4, airChase: 0.85 },
};

/** One step of a plan: a button (d = with down held), a jump, or a dash toward the opponent. */
type Action = 'P' | 'K' | 'dP' | 'dK' | 'S' | 'dS' | 'jump' | 'dash';

/** Ground strings it throws at close range; every one is a real combo route. */
const STRINGS: readonly (readonly Action[])[] = [
  ['P', 'P', 'P'],
  ['P', 'P', 'K'],
  ['K', 'K', 'K'],
  ['P', 'K', 'K'],
  ['K', 'P', 'P'],
  ['P', 'P'],
  ['dK'],
  ['dP'],
];

/** Center-of-mass distance (m) at which it starts striking. */
const STRIKE_RANGE = 1.1;
/** Beyond this it fights from range: stars and dash-ins. */
const FAR_RANGE = 4.5;
const MID_RANGE = 2.2;
/** Jumps when the eraser is this many seconds from touching it. */
const JUMP_LEAD = 0.24;
/** How far (m) the body reaches ahead of its center toward the eraser (fists, feet). */
const BODY_REACH = 0.35;
const JUMP_HOLD = 0.35;
/** How long down is held for a down+button move, so it's still held when the attack starts. */
const DOWN_HOLD = 0.12;
/** Pause after a jump in a plan, so the next press comes in the air near the top. */
const AFTER_JUMP = 0.2;
/** Follows an opponent this much higher (m), e.g. up on a platform. */
const CLIMB_HEIGHT = 1.2;
const CLIMB_RANGE = 2.5;
/**
 * Starts no new attacks once a sweep it means to dodge is this close (s): a fighter stunned
 * mid-combo, its own or the opponent's, can't jump.
 */
const SWEEP_CALM = 1.2;
/** Caught in the air with the eraser this close (s): double jump over it. */
const AIR_DODGE_LEAD = 0.3;

/**
 * Computer opponent. It writes the same inputs a player would. A reflex layer runs every
 * step (dodging the eraser, working through its current plan), and a decision layer runs at
 * human-like intervals and picks the next plan: a combo string, a dash-in, a star, an air
 * chase after a launcher, a stomp from above, or an escape.
 */
export class Bot {
  private thinkTimer = 0;
  private move = 0;
  private plan: Action[] = [];
  private waitTimer = 0;
  private retreatTimer = 0;
  private jumpHold = 0;
  private downHold = 0;
  private lastSweep = -1;
  private dodgeThisSweep = true;
  private toward: 1 | -1 = 1;

  constructor(
    readonly me: Fighter,
    private readonly profile: BotProfile,
    private readonly rng: Rng,
  ) {}

  /** Sets this step's inputs. Call before Fighter.preStep. */
  update(dt: number, opponent: Fighter, world: { eraser: Eraser }): void {
    this.retreatTimer -= dt;
    this.jumpHold -= dt;
    this.downHold -= dt;
    this.waitTimer -= dt;
    this.toward = opponent.man.centerOfMass().x >= this.me.man.centerOfMass().x ? 1 : -1;
    const bracing = this.dodge(world.eraser);
    this.runPlan();

    this.thinkTimer -= dt;
    if (this.thinkTimer <= 0) {
      this.thinkTimer = this.profile.reaction * (0.6 + 0.8 * this.rng());
      if (bracing) this.move = 0;
      else if (this.plan.length === 0) this.decide(opponent);
    }

    const input = this.me.man.input;
    input.move = this.holdingHighGround(world.eraser) ? 0 : this.move;
    input.jumpHeld = this.jumpHold > 0;
    input.down = this.downHold > 0;
  }

  /** Works through the current plan, one action at a time once the fighter is free. */
  private runPlan(): void {
    const action = this.plan[0];
    if (!action || this.waitTimer > 0) return;
    const me = this.me;
    if (action === 'jump') {
      this.jump();
      this.waitTimer = AFTER_JUMP;
    } else if (action === 'dash') {
      me.queueDash(this.toward);
      this.waitTimer = 0.05;
    } else {
      if (me.attacking) return;
      if (action.startsWith('d')) this.downHold = DOWN_HOLD;
      if (action.endsWith('P')) me.queuePunch();
      else if (action.endsWith('K')) me.queueKick();
      else me.queueSpecial();
      this.waitTimer = 0.03;
    }
    this.plan.shift();
  }

  private decide(opponent: Fighter): void {
    const man = this.me.man;
    const me = man.centerOfMass();
    const them = opponent.man.centerOfMass();
    const distance = Math.abs(them.x - me.x);
    const toward = this.toward;
    const facing = man.facing === toward;
    const rng = this.rng;
    const p = this.profile;

    if (opponent.knockedOut) {
      this.move = 0;
      return;
    }
    if (this.retreatTimer > 0) {
      this.move = -toward;
      return;
    }
    // Escape an incoming swing: vanish behind them, jump over, or back off.
    if (opponent.attacking && distance < 1.3 && rng() < p.caution) {
      if (this.me.cooldowns.smokeVanish === 0 && rng() < 0.4) this.plan = ['dS'];
      else if (man.grounded && rng() < 0.5) this.plan = ['jump'];
      else {
        this.retreatTimer = 0.2 + 0.25 * rng();
        this.move = -toward;
      }
      return;
    }
    // Chase a launched opponent into the air for an air combo.
    if (!opponent.man.grounded && them.y < me.y - 0.6 && distance < 1.8 && man.grounded && rng() < p.airChase) {
      this.move = toward;
      this.plan = rng() < 0.5 ? ['jump', 'P', 'P', 'K'] : ['jump', 'P', 'K'];
      return;
    }
    // Directly above them in the air: stomp.
    if (!man.grounded && me.y < them.y - 1 && distance < 0.8) {
      this.plan = ['dK'];
      return;
    }
    // Follow an opponent standing up on a platform: jump, then double jump.
    if (opponent.man.grounded && them.y < me.y - CLIMB_HEIGHT && distance < CLIMB_RANGE && man.grounded) {
      this.move = toward;
      this.plan = ['jump', 'jump'];
      return;
    }

    if (distance > FAR_RANGE) {
      if (facing && this.me.cooldowns.shuriken === 0 && rng() < p.rangedChance) {
        this.move = 0;
        this.plan = ['S'];
      } else {
        this.move = toward;
        if (rng() < p.rangedChance * 0.5) this.plan = ['dash'];
      }
      return;
    }
    if (distance > MID_RANGE) {
      this.move = toward;
      const roll = rng();
      if (facing && roll < p.rangedChance * 0.5 && this.me.cooldowns.shuriken === 0) this.plan = ['S'];
      else if (roll < p.rangedChance) this.plan = ['dash', 'P'];
      else if (roll < p.rangedChance * 1.5) this.plan = ['jump', 'K'];
      return;
    }
    if (distance > STRIKE_RANGE) {
      this.move = toward;
      if (rng() < p.rangedChance * 0.5) this.plan = ['dash', rng() < 0.5 ? 'P' : 'K'];
      return;
    }
    // In range: a light tap toward them turns it around if needed, then a combo string.
    this.move = facing ? 0 : toward * 0.2;
    if (!facing || this.me.attacking) return;
    if (rng() < p.aggression) this.plan = [...STRINGS[Math.floor(rng() * STRINGS.length)]];
  }

  /** Stays up on a platform while the eraser is on its way, instead of walking down into it. */
  private holdingHighGround(eraser: Eraser): boolean {
    const man = this.me.man;
    if (!man.grounded || man.pelvis().y > eraser.top - 0.3) return false;
    if (eraser.phase === 'warning') return true;
    return eraser.phase === 'sweeping' && (man.centerOfMass().x - eraser.x) * eraser.dir > -eraser.halfWidth;
  }

  /**
   * Jumps the eraser, if it decided to take this sweep seriously. Arrival is predicted from
   * the warning onward, like a player watching the arrow, so standing right where it enters
   * still leaves time to react. Returns whether it's bracing for a sweep: plans dropped, no
   * new attacks, waiting to jump.
   */
  private dodge(eraser: Eraser): boolean {
    if (eraser.phase === 'idle') return false;
    const sweep = eraser.phase === 'warning' ? eraser.sweepId + 1 : eraser.sweepId;
    if (sweep !== this.lastSweep) {
      this.lastSweep = sweep;
      this.dodgeThisSweep = this.rng() < this.profile.hazardSkill;
    }
    const man = this.me.man;
    const highGround = man.grounded && man.pelvis().y < eraser.top - 0.3;
    if (!this.dodgeThisSweep || highGround) return false;
    const eta = eraser.timeToReach(man.centerOfMass().x - eraser.dir * BODY_REACH);
    if (eta === null || eta > SWEEP_CALM) return false;
    this.plan = [];
    if (man.grounded) {
      if (eta < JUMP_LEAD) this.jump();
    } else if (eta < AIR_DODGE_LEAD && man.canAirJump && man.pelvis().y + TUNING.hoverHeight > eraser.top - 0.5) {
      // Coming down onto it: the double jump keeps the feet above it.
      this.jump();
    }
    return true;
  }

  private jump(): void {
    this.me.man.queueJump();
    this.jumpHold = JUMP_HOLD;
  }
}
