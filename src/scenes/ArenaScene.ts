import Phaser from 'phaser';
import type { BotLevel } from '../ai/Bot';
import { Sfx } from '../audio/Sfx';
import { type Fighter, type HitTier, type MoveName, SPECIAL_COOLDOWN } from '../combat/Fighter';
import { PPM, TUNING, VIEW_HEIGHT, VIEW_WIDTH } from '../config';
import { openTuningPanel } from '../debug/tuningPanel';
import { ARENA_BOXES, FLOOR_Y } from '../game/level';
import { Match, type MatchEvent, type MatchMode } from '../game/Match';
import { DoubleTap } from '../input/DoubleTap';
import { type PadButton, TouchPad, touchLayout } from '../input/TouchPad';
import { Grabber } from '../physics/Grabber';
import { FIXED_DT } from '../physics/PhysicsWorld';
import type { RigidBody } from '../physics/rapier';
import { Afterimages } from '../render/Afterimages';
import { ComicFx, hitWord } from '../render/ComicFx';
import { InkFx } from '../render/InkFx';
import { TouchPadView } from '../render/TouchPadView';
import { Trails } from '../render/Trails';
import { drawEraser } from '../render/drawEraser';
import { type Extremity, drawDizzyStars, drawStickman } from '../render/drawStickman';
import { BLUE_PEN, ERASER_PINK, FLASH_PEN, INK, type InkStyle, PAPER, PENCIL, RED_PEN, toCss } from '../render/palette';
import { drawLevel, drawPaper } from '../render/paper';
import { drawShuriken } from '../render/shuriken';
import type { Motion } from '../stickman/Stickman';
import type { Vec } from '../util/math';
import { Hud } from './Hud';

/** Caps catch-up steps after a stall so a slow frame can't snowball. */
const MAX_STEPS_PER_FRAME = 5;
/** Longest frame (seconds) the game will simulate; anything longer is treated as a pause. */
const MAX_FRAME = 0.1;
/** How close (meters) a click must land to a body part to grab it. */
const GRAB_RADIUS = 0.35;
/** The hand-drawn jitter changes this many times per second, like 10 fps animation on paper. */
const BOIL_FPS = 10;
/** A struck fighter is drawn in plain ink for this long, like an impact flash. */
const FLASH_TIME = 0.05;
/** The title-screen demo starts a new match this long after one ends. */
const DEMO_RESTART_DELAY = 3;
const STATUS_INTERVAL_MS = 250;
/** Fingers tracked at once; two players on one phone may use four. */
const EXTRA_POINTERS = 4;
/** Draw order for the on-screen controls: above the game and the HUD. */
const CONTROLS_DEPTH = 50;
/** Comic-book hit words sit above the fighters and their effects. */
const COMIC_DEPTH = 40;
/** How strong each tier of hit feels: scales splash, shake, freeze and zoom. */
const TIER_STRENGTH: Record<HitTier, number> = { light: 0.35, medium: 0.55, heavy: 0.8 };
/** Camera zoom-punch toward heavy hits and knockouts (fraction of normal zoom). */
const ZOOM_HEAVY = 0.06;
const ZOOM_KO = 0.12;
/** Which fist or foot ends each striking limb. */
const LIMB_END: Partial<Record<string, Extremity>> = {
  lowerArmL: 'handL',
  lowerArmR: 'handR',
  shinL: 'footL',
  shinR: 'footR',
};
/** Moves that drive off a planted foot (dust puff), and the foot that pushes. */
const PUSH_OFF: Partial<Record<MoveName, Extremity>> = {
  elbowSmash: 'footR',
  risingDragon: 'footR',
  snapKick: 'footL',
  spinKick: 'footL',
  tornadoKick: 'footL',
  legSweep: 'footL',
  dashStrike: 'footR',
  flyingKnee: 'footL',
};
/** Moves fast enough to leave afterimages during their strike. */
const BLUR_MOVES: ReadonlySet<MoveName> = new Set<MoveName>([
  'risingDragon',
  'spinKick',
  'tornadoKick',
  'dashStrike',
  'flyingKnee',
  'diveKick',
  'meteorStomp',
]);
/**
 * A hit continues a combo if the victim hadn't recovered from the last one (still staggered,
 * tripped or airborne) and it came within this long (simulation seconds).
 */
const COMBO_GAP = 2;
const SHURIKEN_RADIUS = 11;
/** A star stuck in the scenery fades over its last this-many seconds. */
const SHURIKEN_FADE = 0.3;
const PENS: readonly InkStyle[] = [BLUE_PEN, RED_PEN];
const BOT_LEVELS: readonly BotLevel[] = ['easy', 'normal', 'hard'];

const TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  fontSize: '15px',
  color: '#3b3833',
};

/** Phaser key names for one side of the keyboard. */
interface ControlSet {
  left: readonly string[];
  right: readonly string[];
  jump: readonly string[];
  down: readonly string[];
  punch: readonly string[];
  kick: readonly string[];
  special: readonly string[];
}

const CONTROL_SETS: readonly ControlSet[] = [
  { left: ['A'], right: ['D'], jump: ['W'], down: ['S'], punch: ['SPACE', 'F'], kick: ['G'], special: ['H'] },
  {
    left: ['LEFT'],
    right: ['RIGHT'],
    jump: ['UP'],
    down: ['DOWN'],
    punch: ['ENTER', 'FORWARD_SLASH', 'NUMPAD_ZERO'],
    kick: ['PERIOD'],
    special: ['COMMA'],
  },
];

type HeldKeys = Record<'left' | 'right' | 'jump' | 'down', Phaser.Input.Keyboard.Key[]>;

/** The move list on the title screen: section headings (input '') and input / move rows. */
const MOVE_LIST: readonly (readonly [input: string, move: string])[] = [
  ['', 'Ground chain: up to 3 hits, punches and kicks in any mix'],
  ['Punch, Punch, Punch', 'Palm Strike → Elbow Smash → Rising Dragon'],
  ['Kick, Kick, Kick', 'Snap Kick → Spin Kick → Tornado Kick'],
  ['', 'Moves that depend on what you are doing'],
  ['↓ + Punch', 'Rising Dragon: a flipping uppercut that launches'],
  ['↓ + Kick', 'Leg Sweep: trips them flat'],
  ['Dash, then Punch', 'Dash Strike'],
  ['Dash, then Kick', 'Flying Knee'],
  ['', 'In the air'],
  ['Punch', 'Air Chop: homes in and carries them along'],
  ['Kick', 'Dive Kick: plunges at an angle'],
  ['↓ + Kick', 'Meteor Stomp: a shockwave where you land'],
  ['', 'Ninja tools'],
  ['Special', 'Shuriken'],
  ['↓ + Special', 'Smoke Vanish: reappear behind them'],
  ['', 'Movement'],
  ['Jump in the air', 'Flipping double jump'],
  ['Jump beside a wall', 'Wall jump'],
  ['Double-tap ← or →', 'Dash'],
  ['', 'Try it: ↓ + Punch, then Punch, Kick: launch, chase, spike!'],
];

interface Impact {
  victim: Fighter;
  point: Vec;
  direction: 1 | -1;
  tier: HitTier;
  /** 0..1, scales every effect. */
  strength: number;
  freeze: number;
  ko: boolean;
  head: boolean;
  /** The comic-book word to pop. */
  word: string;
}

/**
 * The game's only scene. The title screen is a computer-vs-computer match running behind a
 * menu; picking a mode starts a real match. All simulation lives in Match; this scene maps
 * keys to fighters, turns match events into feedback, and draws.
 */
export class ArenaScene extends Phaser.Scene {
  private match!: Match;
  private mode: MatchMode = 'demo';
  private botLevel: BotLevel = 'normal';
  private grabber!: Grabber;
  private held: HeldKeys[] = [];
  private ink!: Phaser.GameObjects.Graphics;
  private hazardInk!: Phaser.GameObjects.Graphics;
  private debugInk!: Phaser.GameObjects.Graphics;
  private fx!: InkFx;
  private comic!: ComicFx;
  private readonly trails = new Trails(2);
  private readonly afterimages = new Afterimages(2);
  private readonly doubleTap = new DoubleTap();
  /** Renders the HUD and controls, so they stay still while the main camera shakes and zooms. */
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  private zoomReturn: Phaser.Time.TimerEvent | null = null;
  private hud!: Hud;
  private title!: Phaser.GameObjects.Container;
  private moveList!: Phaser.GameObjects.Container;
  private difficultyText!: Phaser.GameObjects.Text;
  private help: Phaser.GameObjects.Text[] = [];
  private status: Phaser.GameObjects.Text | null = null;
  private readonly pad = new TouchPad();
  private padView!: TouchPadView;
  /** Shown on touch screens during a match, standing in for the Esc key. */
  private menuButton!: Phaser.GameObjects.Text;
  /** On-screen controls are on: a touch screen was detected or touched. */
  private touchMode = false;
  /** The pointer dragging a fighter, so lifting some other finger doesn't drop it. */
  private grabPointer: number | null = null;
  private readonly sfx = new Sfx();
  private readonly matchEvents: MatchEvent[] = [];
  private accumulator = 0;
  /** Seconds the simulation stays frozen after a hit. */
  private hitstop = 0;
  /** Seconds of slow motion left after a knockout. */
  private slowMo = 0;
  /** The fighter shaking in place during the current hitstop. */
  private shaken: { fighter: Fighter; strength: number; flash: number } | null = null;
  /** Real seconds since the match ended (drives the demo's restart). */
  private sinceMatchOver = 0;
  /** Simulation seconds since the match started; times combos, unaffected by hitstop. */
  private simTime = 0;
  /** Per fighter: hits landed in the current combo, and when the last one landed. */
  private readonly combos = [
    { hits: 0, at: -Infinity },
    { hits: 0, at: -Infinity },
  ];
  /** Per fighter, as of the last step: still reeling from a hit, so another one is a combo. */
  private readonly reeling = [false, false];
  private showDebug = false;
  private nextStatusAt = 0;

  constructor() {
    super('arena');
  }

  create(): void {
    // Two cameras: the main one films the fight and can shake and zoom; this one films the UI.
    this.uiCamera = this.cameras.add(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    this.cameras.main.setBounds(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    const world = (object: Phaser.GameObjects.GameObject) => this.toWorld(object);
    const ui = (object: Phaser.GameObjects.GameObject) => this.toUi(object);

    const paper = this.add.graphics();
    drawPaper(paper, VIEW_WIDTH, VIEW_HEIGHT);
    const stainLayer = this.add.graphics();
    const level = this.add.graphics();
    drawLevel(level, ARENA_BOXES);
    this.hazardInk = this.add.graphics();
    this.ink = this.add.graphics();
    const fxLayer = this.add.graphics();
    this.fx = new InkFx(stainLayer, fxLayer, FLOOR_Y * PPM);
    this.debugInk = this.add.graphics();
    for (const object of [paper, stainLayer, level, this.hazardInk, this.ink, fxLayer, this.debugInk]) world(object);
    this.comic = new ComicFx(this, world, COMIC_DEPTH);

    this.hud = new Hud(this, PENS, ui);
    this.help = [0, 1, 2].map((i) => {
      const text = this.add.text(0, FLOOR_Y * PPM + 12 + (i === 2 ? 26 : 0), '', TEXT_STYLE);
      ui(text);
      return text;
    });
    this.title = this.createTitle();
    ui(this.title);
    this.moveList = this.createMoveList();
    ui(this.moveList);
    this.padView = new TouchPadView(this, CONTROLS_DEPTH, ui);
    this.menuButton = this.add
      .text(22, 64, '✕ menu', {
        ...TEXT_STYLE,
        fontSize: '22px',
        fontStyle: 'bold',
        color: toCss(INK),
        backgroundColor: toCss(PAPER),
        padding: { x: 12, y: 8 },
      })
      .setDepth(CONTROLS_DEPTH)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.startMatch('demo'));
    ui(this.menuButton);

    const keyboard = this.input.keyboard!;
    // Adding a key also stops the browser acting on it (arrows scroll, '/' opens quick find in Firefox).
    const keys = (names: readonly string[]) => names.map((name) => keyboard.addKey(name));
    this.held = CONTROL_SETS.map((set) => {
      keys(set.punch);
      keys(set.kick);
      keys(set.special);
      return { left: keys(set.left), right: keys(set.right), jump: keys(set.jump), down: keys(set.down) };
    });
    this.input.addPointer(EXTRA_POINTERS);
    this.touchMode = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    // A finger held on a button when the page loses focus would otherwise stay "down".
    this.game.events.on(Phaser.Core.Events.BLUR, () => this.pad.releaseAll());
    this.bindPresses();
    this.setupPointer();
    this.startMatch('demo');

    if (import.meta.env.DEV) {
      this.status = this.add.text(VIEW_WIDTH / 2, 46, '', { ...TEXT_STYLE, fontSize: '12px' }).setOrigin(0.5, 0);
      ui(this.status);
      void openTuningPanel();
      // Console and automated-check access to the live scene, e.g. arena.match.fighters[1].hp = 1.
      Object.assign(window, { arena: this });
    }
  }

  update(time: number, deltaMs: number): void {
    const dt = Math.min(deltaMs / 1000, MAX_FRAME);
    if (this.mode !== 'demo') this.readHeldKeys();

    let timeScale = 1;
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      this.accumulator = 0;
    } else {
      this.slowMo = Math.max(0, this.slowMo - dt);
      timeScale = this.slowMo > 0 ? TUNING.slowMoScale : 1;
      this.accumulator = Math.min(this.accumulator + dt * timeScale, FIXED_DT * MAX_STEPS_PER_FRAME);
      // A hit inside this loop starts a hitstop, which freezes the remaining steps immediately.
      while (this.accumulator >= FIXED_DT && this.hitstop <= 0) {
        const events = this.matchEvents;
        events.length = 0;
        this.match.step(FIXED_DT, events);
        this.simTime += FIXED_DT;
        for (const event of events) this.handle(event);
        this.match.fighters.forEach((f, i) => {
          this.reeling[i] = f.man.stunned || f.knockedDown || f.knockedOut || !f.man.grounded;
        });
        this.accumulator -= FIXED_DT;
      }
    }

    if (this.match.phase === 'matchOver') {
      this.sinceMatchOver += dt;
      if (this.mode === 'demo' && this.sinceMatchOver > DEMO_RESTART_DELAY) this.startMatch('demo');
    }

    this.rubOutStains();
    this.fx.update(dt * timeScale);
    this.afterimages.update(this.hitstop > 0 ? 0 : dt * timeScale);
    this.hud.update(dt, this.match);
    this.draw(this.hitstop > 0 ? 1 : this.accumulator / FIXED_DT, dt);
    if (this.status && time >= this.nextStatusAt) {
      this.nextStatusAt = time + STATUS_INTERVAL_MS;
      this.status.setText(`${Math.round(this.game.loop.actualFps)} fps`);
    }
  }

  /** Throws away the current match and starts a fresh one. */
  private startMatch(mode: MatchMode): void {
    this.grabber?.release();
    this.match?.dispose();
    this.mode = mode;
    this.match = new Match({ mode, botLevel: this.botLevel });
    this.grabber = new Grabber(this.match.physics);
    this.accumulator = 0;
    this.hitstop = 0;
    this.slowMo = 0;
    this.shaken = null;
    this.sinceMatchOver = 0;
    this.simTime = 0;
    for (const combo of this.combos) combo.hits = 0;
    this.reeling.fill(false);
    this.sfx.muted = mode === 'demo';
    this.fx.clear();
    this.comic.clear();
    this.trails.clear();
    this.afterimages.clear();
    this.doubleTap.clear();
    this.zoomReturn?.remove();
    this.zoomReturn = null;
    this.cameras.main.resetFX();
    this.cameras.main.setZoom(1).setScroll(0, 0);
    this.hud.reset();
    this.hud.setLabels(mode === 'versus' ? ['P1', 'P2'] : mode === 'vsBot' ? ['P1', 'CPU'] : ['CPU', 'CPU']);
    this.title.setVisible(mode === 'demo');
    this.moveList.setVisible(false);
    this.grabPointer = null;
    this.refreshTouchControls();
  }

  /** Shows the on-screen controls for the current mode, if touch is in use. */
  private refreshTouchControls(): void {
    const playing = this.mode !== 'demo';
    this.pad.setLayout(this.touchMode && playing ? touchLayout(this.mode === 'versus' ? 'versus' : 'vsBot') : []);
    this.menuButton.setVisible(this.touchMode && playing);
    this.updateHelp();
  }

  /** The fighter a control set drives in the current mode. Against the computer, both sets drive P1. */
  private controlled(set: number): Fighter | null {
    if (this.mode === 'versus') return this.match.fighters[set];
    if (this.mode === 'vsBot') return this.match.fighters[0];
    return null;
  }

  /** Merges every held key and on-screen button into each human fighter's input. */
  private readHeldKeys(): void {
    const down = (keys: Phaser.Input.Keyboard.Key[]) => keys.some((k) => k.isDown);
    this.match.fighters.forEach((fighter, index) => {
      if (this.match.bots[index]) return;
      let left = this.pad.isHeld(index, 'left');
      let right = this.pad.isHeld(index, 'right');
      let jump = this.pad.isHeld(index, 'jump');
      let crouch = this.pad.isHeld(index, 'down');
      this.held.forEach((held, set) => {
        if (this.controlled(set) !== fighter) return;
        left ||= down(held.left);
        right ||= down(held.right);
        jump ||= down(held.jump);
        crouch ||= down(held.down);
      });
      fighter.man.input.move = (right ? 1 : 0) - (left ? 1 : 0);
      fighter.man.input.jumpHeld = jump;
      fighter.man.input.down = crouch;
    });
  }

  /** A finger landed on an on-screen button. */
  private padPress(button: PadButton): void {
    const fighter = this.match.fighters[button.owner];
    if (this.match.bots[button.owner]) return;
    if (button.action === 'jump') fighter.man.queueJump();
    if (button.action === 'punch') fighter.queuePunch();
    if (button.action === 'kick') fighter.queueKick();
    if (button.action === 'special') fighter.queueSpecial();
    if (button.action === 'left') this.tapDirection(fighter, -1);
    if (button.action === 'right') this.tapDirection(fighter, 1);
  }

  /** A fresh press of left or right: twice quickly is a dash. */
  private tapDirection(fighter: Fighter | null, dir: 1 | -1): void {
    if (!fighter) return;
    const index = this.match.fighters.indexOf(fighter);
    if (this.doubleTap.tap(index, dir, this.time.now / 1000)) fighter.queueDash(dir);
  }

  /** Turns on the on-screen controls the first time a finger touches the screen. */
  private enableTouch(): void {
    if (this.touchMode) return;
    this.touchMode = true;
    this.refreshTouchControls();
  }

  /** One-shot actions listen for keydown, since polling JustDown misses taps shorter than a frame. */
  private bindPresses(): void {
    const keyboard = this.input.keyboard!;
    const onPress = (keys: readonly string[], action: () => void) => {
      for (const key of keys) {
        keyboard.on(`keydown-${key}`, (event: KeyboardEvent) => {
          if (!event.repeat) action();
        });
      }
    };
    const rematchOr = (action: () => void) => () => {
      if (this.mode !== 'demo' && this.match.phase === 'matchOver') this.startMatch(this.mode);
      else action();
    };
    CONTROL_SETS.forEach((set, i) => {
      onPress(set.jump, () => this.controlled(i)?.man.queueJump());
      onPress(set.punch, rematchOr(() => this.controlled(i)?.queuePunch()));
      onPress(set.kick, rematchOr(() => this.controlled(i)?.queueKick()));
      onPress(set.special, () => this.controlled(i)?.queueSpecial());
      onPress(set.left, () => this.tapDirection(this.controlled(i), -1));
      onPress(set.right, () => this.tapDirection(this.controlled(i), 1));
    });
    onPress(['ONE', 'NUMPAD_ONE'], () => this.mode === 'demo' && this.startMatch('vsBot'));
    onPress(['TWO', 'NUMPAD_TWO'], () => this.mode === 'demo' && this.startMatch('versus'));
    onPress(['THREE', 'NUMPAD_THREE'], () => this.mode === 'demo' && this.cycleDifficulty());
    onPress(['FOUR', 'NUMPAD_FOUR'], () => this.mode === 'demo' && this.toggleMoveList());
    onPress(['ESC'], () => {
      if (this.moveList.visible) this.toggleMoveList();
      else if (this.mode !== 'demo') this.startMatch('demo');
    });
    onPress(['R'], () => this.mode !== 'demo' && this.startMatch(this.mode));
    onPress(['BACKTICK'], () => {
      this.showDebug = !this.showDebug;
      this.debugInk.clear();
    });
    // Browsers keep audio locked until the first key press or click.
    keyboard.on('keydown', () => this.sfx.unlock());
  }

  private cycleDifficulty(): void {
    this.botLevel = BOT_LEVELS[(BOT_LEVELS.indexOf(this.botLevel) + 1) % BOT_LEVELS.length];
    this.difficultyText.setText(this.difficultyLabel());
  }

  private difficultyLabel(): string {
    return `3   Computer: ${this.botLevel[0].toUpperCase()}${this.botLevel.slice(1)}`;
  }

  /** Turns match events into sound, banners and hit effects. */
  private handle(event: MatchEvent): void {
    const T = TUNING;
    const demo = this.mode === 'demo';
    const name = (index: number) => (this.mode === 'vsBot' && index === 1 ? 'CPU' : `P${index + 1}`);
    switch (event.type) {
      case 'swing':
        this.sfx.swing(event.move);
        this.swingFx(event.fighter, event.move);
        break;
      case 'hit': {
        const head = event.region === 'head';
        // A ragdoll already on the floor gets only a light tap of feedback.
        const tier: HitTier = event.damage === 0 && !event.ko ? 'light' : event.tier;
        const strength = event.ko ? 1 : Math.min(1, TIER_STRENGTH[tier] + (head ? 0.15 : 0));
        let freeze = Math.min(T.hitstopMax, T.hitstopBase + event.damage * T.hitstopPerDamage);
        if (tier === 'heavy') freeze = Math.max(freeze, T.hitstopMax);
        if (event.ko) freeze = T.koHitstop;
        this.impact({ ...event, tier, strength, freeze, head, word: hitWord(tier, head, event.ko, event.move) });
        if (!demo) this.countCombo(event.attacker, event.victim);
        break;
      }
      case 'motion':
        this.sfx.motion(event.motion);
        this.motionFx(event.fighter, event.motion);
        break;
      case 'special':
        if (event.special === 'shuriken') this.sfx.throwStar();
        break;
      case 'shurikenStuck':
        this.sfx.tink();
        this.fx.burst({ x: event.point.x * PPM, y: event.point.y * PPM }, 0);
        break;
      case 'vanish':
        this.sfx.poof();
        this.fx.smoke({ x: event.from.x * PPM, y: event.from.y * PPM });
        this.fx.smoke({ x: event.to.x * PPM, y: event.to.y * PPM }, 90);
        break;
      case 'stomp': {
        const at = { x: event.point.x * PPM, y: FLOOR_Y * PPM - 4 };
        this.sfx.stomp();
        this.fx.ring(at, 0.9);
        this.fx.dustWave(at);
        if (T.screenShake > 0) this.cameras.main.shake(180, 0.007 * T.screenShake, true);
        break;
      }
      case 'eraserWarning':
        this.sfx.warning();
        break;
      case 'eraserSweep':
        this.sfx.sweep(this.match.eraser.timeToReach(event.dir > 0 ? 25 : -5) ?? 2.5);
        break;
      case 'eraserHit':
        this.impact({
          victim: event.victim,
          point: event.point,
          direction: this.match.eraser.dir,
          tier: 'heavy',
          strength: event.ko ? 1 : 0.6,
          freeze: event.ko ? T.koHitstop : T.hitstopMax,
          ko: event.ko,
          head: false,
          word: event.ko ? 'KABOOM!' : 'SQUEAK!',
        });
        break;
      case 'roundStart':
        if (!demo) this.hud.banner(event.final ? 'Final Round' : `Round ${event.round}`, { size: 72, hold: 0.7 });
        break;
      case 'fight':
        this.sfx.bell();
        if (!demo) this.hud.banner('FIGHT!', { size: 96, hold: 0.35 });
        break;
      case 'roundOver':
        if (demo) break;
        this.hud.banner(event.reason === 'ko' ? 'K.O.!' : 'TIME!', { size: 96, hold: 0.9 });
        this.hud.banner(event.winner === null ? 'Draw' : `${name(event.winner)} wins the round`, {
          size: 52,
          delay: 1.4,
          hold: 0.8,
        });
        break;
      case 'matchOver':
        if (demo) break;
        this.hud.banner(`${name(event.winner)} WINS!`, {
          size: 88,
          persist: true,
          sub: this.touchMode ? 'Tap to play again' : 'Space or Enter: rematch      Esc: menu',
        });
        break;
    }
  }

  /** All the feedback for a hit: freeze, shake, flash, ink, sound, and slow motion on a knockout. */
  private impact(hit: Impact): void {
    const T = TUNING;
    this.hitstop = Math.max(this.hitstop, hit.freeze);
    this.shaken = { fighter: hit.victim, strength: hit.strength, flash: FLASH_TIME };
    if (T.screenShake > 0) {
      const duration = hit.ko ? 350 : 110 + 90 * hit.strength;
      this.cameras.main.shake(duration, (hit.ko ? 0.012 : 0.002 + 0.006 * hit.strength) * T.screenShake, true);
    }
    const at = { x: hit.point.x * PPM, y: hit.point.y * PPM };
    const pen = PENS[this.match.fighters.indexOf(hit.victim)] ?? FLASH_PEN;
    this.fx.splash(at, hit.direction, pen.near, hit.strength);
    this.fx.burst(at, hit.strength);
    if (hit.tier !== 'light') this.fx.ring(at, hit.strength);
    this.comic.pop(hit.word, at, hit.ko ? 'heavy' : hit.tier, hit.direction);
    this.sfx.hit(hit.strength, hit.head, hit.tier === 'heavy');
    if (hit.tier === 'heavy' || hit.ko) {
      this.zoomPunch(at, (hit.ko ? ZOOM_KO : ZOOM_HEAVY) * T.screenShake, (hit.freeze + (hit.ko ? 0.5 : 0.08)) * 1000);
    }
    if (hit.ko) {
      this.slowMo = T.koSlowMo;
      this.sfx.ko();
    }
  }

  /** Snaps the fight camera in toward `at` (pixels), then eases back out after `holdMs`. */
  private zoomPunch(at: Vec, amount: number, holdMs: number): void {
    if (amount <= 0) return;
    const camera = this.cameras.main;
    camera.zoomTo(1 + amount, 70, 'Quad.easeOut', true);
    camera.pan(at.x, at.y, 70, 'Quad.easeOut', true);
    this.zoomReturn?.remove();
    this.zoomReturn = this.time.delayedCall(holdMs, () => {
      camera.zoomTo(1, 300, 'Quad.easeInOut', true);
      camera.pan(VIEW_WIDTH / 2, VIEW_HEIGHT / 2, 300, 'Quad.easeInOut', true);
      this.zoomReturn = null;
    });
  }

  /** Dust off the pushing foot for moves that drive off the floor; speed lines for lunges, leaps and dives. */
  private swingFx(fighter: Fighter, move: MoveName): void {
    const man = fighter.man;
    const s = man.skeleton();
    const foot = PUSH_OFF[move];
    if (foot && man.grounded) this.fx.puff({ x: s[foot].x * PPM, y: FLOOR_Y * PPM - 4 }, man.facing);
    const pelvis = man.pelvis();
    const at = { x: pelvis.x * PPM, y: pelvis.y * PPM };
    if (move === 'dashStrike' || move === 'flyingKnee' || move === 'tornadoKick') this.fx.speedLines(at, man.facing);
    if (move === 'risingDragon') this.fx.speedLines(at, { x: 0, y: -1 });
    if (move === 'diveKick') this.fx.speedLines(at, { x: man.facing * 0.85, y: 0.55 });
    if (move === 'meteorStomp') this.fx.speedLines(at, { x: 0, y: 1 });
  }

  /** Dust for a jump off the floor, an air puff for a double jump, a kick of dust off a wall, a streak for a dash. */
  private motionFx(fighter: Fighter, motion: Motion): void {
    const man = fighter.man;
    const s = man.skeleton();
    const feet = { x: ((s.footL.x + s.footR.x) / 2) * PPM, y: Math.max(s.footL.y, s.footR.y) * PPM };
    const pelvis = man.pelvis();
    if (motion === 'jump') {
      this.fx.puff(feet, 1, 3);
      this.fx.puff(feet, -1, 3);
    } else if (motion === 'doubleJump') {
      this.fx.airPuff(feet);
    } else if (motion === 'wallJump') {
      // The fighter now faces away from the wall it kicked off.
      this.fx.puff({ x: (pelvis.x - man.facing * 0.3) * PPM, y: pelvis.y * PPM }, man.facing === 1 ? -1 : 1, 6);
    } else {
      const dir = Math.sign(man.centerOfMassVelocity().x) || man.facing;
      this.fx.speedLines({ x: pelvis.x * PPM, y: pelvis.y * PPM }, dir > 0 ? 1 : -1);
      if (man.grounded) this.fx.puff({ x: feet.x, y: FLOOR_Y * PPM - 4 }, dir > 0 ? 1 : -1);
    }
  }

  /** Counts hits the victim can't escape into a combo shown on the HUD. Getting hit ends your own. */
  private countCombo(attacker: Fighter, victim: Fighter): void {
    const a = this.match.fighters.indexOf(attacker);
    const v = this.match.fighters.indexOf(victim);
    if (a < 0 || v < 0) return;
    const combo = this.combos[a];
    combo.hits = this.reeling[v] && this.simTime - combo.at <= COMBO_GAP ? combo.hits + 1 : 1;
    combo.at = this.simTime;
    this.combos[v].hits = 0;
    this.hud.combo(a, combo.hits);
  }

  /** Shows `object` only on the UI camera: it stays still while the fight camera shakes and zooms. */
  private toUi(object: Phaser.GameObjects.GameObject): void {
    this.cameras.main.ignore(object);
    if (object instanceof Phaser.GameObjects.Container) for (const child of object.list) this.toUi(child);
  }

  /** Shows `object` only on the fight camera. */
  private toWorld(object: Phaser.GameObjects.GameObject): void {
    this.uiCamera.ignore(object);
    if (object instanceof Phaser.GameObjects.Container) for (const child of object.list) this.toWorld(child);
  }

  /** The sweeping eraser wipes ink blots off the page and sheds rubber crumbs. */
  private rubOutStains(): void {
    const eraser = this.match.eraser;
    if (eraser.phase !== 'sweeping') return;
    const left = (eraser.x - eraser.halfWidth) * PPM;
    const right = (eraser.x + eraser.halfWidth) * PPM;
    this.fx.erase(left, eraser.top * PPM, right, FLOOR_Y * PPM + 20);
    const trailing = eraser.dir > 0 ? left : right;
    this.fx.crumbs({ x: trailing, y: FLOOR_Y * PPM - 4 }, eraser.dir, ERASER_PINK);
  }

  private createTitle(): Phaser.GameObjects.Container {
    const cx = VIEW_WIDTH / 2;
    const panel = this.add.graphics();
    panel.fillStyle(PAPER, 0.88);
    panel.fillRoundedRect(cx - 300, 92, 600, 390, 18);
    panel.lineStyle(4, INK, 1);
    panel.strokeRoundedRect(cx - 300, 92, 600, 390, 18);
    const heading = this.add
      .text(cx, 160, 'StickyMan', {
        fontFamily: TEXT_STYLE.fontFamily,
        fontSize: '96px',
        fontStyle: 'bold italic',
        color: toCss(INK),
      })
      .setOrigin(0.5);
    const tagline = this.add
      .text(cx, 225, 'a sketchbook ninja brawler', { ...TEXT_STYLE, fontSize: '22px', fontStyle: 'italic' })
      .setOrigin(0.5);
    const option = (y: number, label: string, action: () => void) =>
      this.add
        .text(cx, y, label, { ...TEXT_STYLE, fontSize: '28px', fontStyle: 'bold', color: toCss(INK) })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', action);
    const vsBot = option(285, '1   Play vs Computer', () => this.startMatch('vsBot'));
    const versus = option(331, '2   Two Players (same device)', () => this.startMatch('versus'));
    this.difficultyText = option(377, this.difficultyLabel(), () => this.cycleDifficulty());
    const moves = option(423, '4   Ninja Move List', () => this.toggleMoveList());
    return this.add.container(0, 0, [panel, heading, tagline, vsBot, versus, this.difficultyText, moves]);
  }

  /** Every move and how to do it, over the title screen; a tap or Esc closes it. */
  private createMoveList(): Phaser.GameObjects.Container {
    const cx = VIEW_WIDTH / 2;
    const top = 40;
    const width = 860;
    const height = 616;
    const panel = this.add.graphics();
    panel.fillStyle(PAPER, 0.96);
    panel.fillRoundedRect(cx - width / 2, top, width, height, 18);
    panel.lineStyle(4, INK, 1);
    panel.strokeRoundedRect(cx - width / 2, top, width, height, 18);
    // Catches taps anywhere on the panel, to close it.
    const closer = this.add
      .zone(cx, top + height / 2, width, height)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleMoveList());
    const parts: Phaser.GameObjects.GameObject[] = [panel, closer];
    parts.push(
      this.add
        .text(cx, top + 34, 'Ninja Moves', { ...TEXT_STYLE, fontSize: '38px', fontStyle: 'bold italic', color: toCss(INK) })
        .setOrigin(0.5),
    );
    let y = top + 70;
    for (const [input, move] of MOVE_LIST) {
      if (!input) {
        y += 8;
        parts.push(
          this.add
            .text(cx, y, move, { ...TEXT_STYLE, fontSize: '18px', fontStyle: 'bold', color: toCss(RED_PEN.near) })
            .setOrigin(0.5, 0),
        );
        y += 26;
        continue;
      }
      parts.push(
        this.add
          .text(cx - 16, y, input, { ...TEXT_STYLE, fontSize: '17px', fontStyle: 'bold', color: toCss(BLUE_PEN.near) })
          .setOrigin(1, 0),
        this.add.text(cx + 4, y, move, { ...TEXT_STYLE, fontSize: '17px' }),
      );
      y += 22;
    }
    parts.push(
      this.add
        .text(cx, top + height - 14, 'Tap or press Esc to close', { ...TEXT_STYLE, fontSize: '14px', color: toCss(PENCIL) })
        .setOrigin(0.5),
    );
    return this.add.container(0, 0, parts).setVisible(false).setDepth(COMIC_DEPTH + 1);
  }

  private toggleMoveList(): void {
    const show = !this.moveList.visible;
    this.moveList.setVisible(show);
    this.title.setVisible(!show && this.mode === 'demo');
  }

  private updateHelp(): void {
    const [left, right, center] = this.help;
    const keyboardLines: Record<MatchMode, [string, string, string]> = {
      demo: ['', '', 'Watch the computers fight, or drag them around'],
      vsBot: [
        'Move A/D or ←/→    Jump W or ↑    Crouch S or ↓    Punch F or /    Kick G or .    Special H or ,',
        '',
        'Double-tap a direction to dash    Jump again in the air    Jump the eraser!    R restart    Esc menu',
      ],
      versus: [
        'P1   A/D move   W jump   S crouch   F punch   G kick   H special',
        'P2   ←/→ move   ↑ jump   ↓ crouch   / punch   . kick   , special',
        'Double-tap a direction to dash    Jump the eraser!    R restart    Esc menu',
      ],
    };
    // With on-screen buttons, the floor between the two clusters only has room for a reminder.
    const touchLines: [string, string, string] = ['', '', this.mode === 'demo' ? keyboardLines.demo[2] : 'Jump the eraser!'];
    const [l, r, c] = this.touchMode ? touchLines : keyboardLines[this.mode];
    const single = this.mode === 'vsBot';
    left.setText(l).setColor(toCss(BLUE_PEN.near)).setOrigin(single ? 0.5 : 0, 0).setX(single ? VIEW_WIDTH / 2 : 110);
    right.setText(r).setColor(toCss(RED_PEN.near)).setOrigin(1, 0).setX(VIEW_WIDTH - 110);
    center.setText(c).setOrigin(0.5, 0).setX(VIEW_WIDTH / 2);
  }

  /**
   * One handler for mouse and fingers: on-screen buttons first, then tap-to-rematch, then
   * grabbing a fighter (mouse anytime; fingers only on the title screen, so a stray thumb
   * mid-match doesn't drag anyone).
   */
  private setupPointer(): void {
    // Through the fight camera, which may be zoomed in on a hit.
    const toMeters = (p: Phaser.Input.Pointer): Vec => {
      const world = this.cameras.main.getWorldPoint(p.x, p.y);
      return { x: world.x / PPM, y: world.y / PPM };
    };
    this.input.on('pointerdown', (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      // Browsers keep audio locked until the first key press or touch.
      this.sfx.unlock();
      if (p.wasTouch) this.enableTouch();
      // Menu options and the menu button handle their own taps.
      if (over.length > 0) return;
      const playing = this.mode !== 'demo';
      if (playing && this.touchMode) {
        const button = this.pad.press(p.id, p.x, p.y);
        if (button) return this.padPress(button);
        if (this.match.phase === 'matchOver') return this.startMatch(this.mode);
      }
      if (playing && p.wasTouch) return;
      const point = toMeters(p);
      let best: { body: RigidBody; distance: number } | null = null;
      for (const { man } of this.match.fighters) {
        const hit = man.nearestPart(point);
        if (hit.distance < GRAB_RADIUS && (!best || hit.distance < best.distance)) best = hit;
      }
      if (best) {
        this.grabber.grab(best.body, point);
        this.grabPointer = p.id;
      }
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.pad.slide(p.id, p.x, p.y);
      if (p.id === this.grabPointer) this.grabber.moveTo(toMeters(p));
    });
    const lift = (p: Phaser.Input.Pointer) => {
      this.pad.release(p.id);
      if (p.id === this.grabPointer) {
        this.grabber.release();
        this.grabPointer = null;
      }
    };
    this.input.on('pointerup', lift);
    this.input.on('pointerupoutside', lift);
  }

  private draw(alpha: number, dt: number): void {
    drawEraser(this.hazardInk, this.match.eraser, this.time.now);
    const g = this.ink;
    g.clear();
    const boilSeed = Math.floor(this.time.now / (1000 / BOIL_FPS));
    const shaken = this.shaken;
    if (shaken) shaken.flash -= dt;
    if (shaken && this.hitstop <= 0) this.shaken = null;

    // Smears first, so the limbs that made them draw on top. Frozen during hitstop, like the fight.
    const strikers = this.match.fighters.map((fighter) => {
      const move = fighter.currentMove;
      return move?.phase === 'strike' && move.limb ? (LIMB_END[move.limb] ?? null) : null;
    });
    const skeletons = this.match.fighters.map((fighter) => fighter.man.skeleton(alpha));
    const frameDt = this.hitstop > 0 ? 0 : dt;
    skeletons.forEach((s, i) => {
      const end = strikers[i];
      this.trails.track(i, end ? { x: s[end].x * PPM, y: s[end].y * PPM } : null, frameDt);
      const fighter = this.match.fighters[i];
      const move = fighter.currentMove;
      const fast =
        fighter.man.dashing || fighter.man.flipping || (move?.phase === 'strike' && BLUR_MOVES.has(move.move));
      this.afterimages.track(i, s, fighter.man.facing, fast && !fighter.knockedOut, frameDt);
    });
    this.afterimages.draw(g, PENS);
    this.trails.draw(g, PENS.map((pen) => pen.near));

    const seconds = this.time.now / 1000;
    this.match.fighters.forEach((fighter, i) => {
      let offset: Vec = { x: 0, y: 0 };
      let ink = PENS[i];
      if (shaken?.fighter === fighter && this.hitstop > 0) {
        const amplitude = 2 + 4 * shaken.strength;
        offset = { x: (Math.random() * 2 - 1) * amplitude, y: (Math.random() * 2 - 1) * amplitude * 0.5 };
        if (shaken.flash > 0) ink = FLASH_PEN;
      }
      const man = fighter.man;
      const face = fighter.knockedOut ? 'ko' : man.stunned ? 'hurt' : 'normal';
      const head = drawStickman(g, skeletons[i], man.facing, ink, boilSeed + i * 1000, TUNING.lineBoil, {
        offset,
        face,
        striker: strikers[i],
      });
      // Seeing stars after a big hit, and while knocked out.
      if (fighter.knockedOut || (man.stunned && man.stunInfo.total >= 0.5)) drawDizzyStars(g, head, seconds);
    });

    // Throwing stars, drawn where they'll be between steps like the fighters.
    for (const star of this.match.shurikens) {
      const owner = this.match.fighters.indexOf(star.owner);
      const lag = star.stuck ? 0 : (1 - alpha) * FIXED_DT;
      drawShuriken(
        g,
        (star.x - star.vx * lag) * PPM,
        (star.y - star.vy * lag) * PPM,
        SHURIKEN_RADIUS,
        star.angle,
        PENS[owner]?.near ?? INK,
        star.stuck ? Math.min(1, star.life / SHURIKEN_FADE) : 1,
      );
    }

    const grip = this.grabber.grabPoint();
    if (grip) {
      const cursor = this.grabber.cursorPosition();
      g.lineStyle(2, PENCIL, 0.9);
      g.lineBetween(grip.x * PPM, grip.y * PPM, cursor.x * PPM, cursor.y * PPM);
      g.fillStyle(PENCIL, 1);
      g.fillCircle(cursor.x * PPM, cursor.y * PPM, 4);
    }

    this.fx.draw();
    this.padView.draw(this.pad, PENS, (button) => {
      if (button.action !== 'special') return 0;
      const fighter = this.match.fighters[button.owner];
      return Math.max(fighter.cooldowns.shuriken / SPECIAL_COOLDOWN.shuriken, 0);
    });
    if (this.showDebug) this.drawPhysicsDebug();
  }

  /** Collider outlines plus each stickman's ground probe (green when grounded). */
  private drawPhysicsDebug(): void {
    const g = this.debugInk;
    g.clear();
    const { vertices } = this.match.physics.world.debugRender();
    g.lineStyle(1, 0x009e60, 0.9);
    for (let i = 0; i < vertices.length; i += 4) {
      g.lineBetween(vertices[i] * PPM, vertices[i + 1] * PPM, vertices[i + 2] * PPM, vertices[i + 3] * PPM);
    }
    for (const { man } of this.match.fighters) {
      const p = man.pelvis();
      const length = man.groundDistance ?? TUNING.hoverHeight + TUNING.groundSnap;
      g.lineStyle(2, man.grounded ? 0x009e60 : 0xd04040, 1);
      g.lineBetween(p.x * PPM, p.y * PPM, p.x * PPM, (p.y + length) * PPM);
    }
  }
}
