# StickyMan

A 2D physics stickman game for web (Poki / CrazyGames) first, mobile later: a ninja brawler on a
sketchbook page where you **draw to fight**. Lines you draw become solid walls and platforms;
loops become boulders that fall on whoever is underneath.
Stack: TypeScript, Vite, Phaser 4 (rendering/input), Rapier2D deterministic build (physics).

Market research behind these choices: `reports/Stickman games market analysis.md`.

## Run

```sh
npm install
npm run dev        # http://localhost:5173 (includes the live tuning panel)
npm test           # headless physics, combat and match tests
npm run build      # production build in dist/
```

## Playing

The title screen runs a computer-vs-computer fight behind the menu.

| Key | Title screen |
|---|---|
| 1 | Play vs Computer |
| 2 | Two Players (one keyboard) |
| 3 | Cycle computer difficulty (Easy / Normal / Hard) |
| 4 | Ninja move list |

| | P1 (blue) | P2 (red) |
|---|---|---|
| Move | A / D | ← / → |
| Dash | double-tap A or D | double-tap ← or → |
| Jump (tap = hop, hold = full; again in the air = flip) | W | ↑ |
| Crouch, and the down moves | S | ↓ |
| Punch | F or Space | / , Enter or Numpad 0 |
| Kick | G | . |
| Special (shuriken; with down, smoke vanish) | H | , |
| Draw | drag the mouse | drag the mouse on the right half |

Against the computer, P1 can use either set of keys and every stroke is P1's; with two players,
a stroke belongs to whoever's half of the screen it starts on. R restarts the match, Esc returns
to the title, and ` (backtick) toggles the physics debug view. On the title screen the mouse
grabs and flings the fighters instead of drawing.

### Touch screens

On phones and tablets on-screen buttons appear automatically (`src/input/TouchPad.ts`), with full
multi-touch: hold ◀ / ▼ / ▶ with one thumb while punching, kicking, jumping or throwing (★) with
the other, and slide between the arrows without lifting. Tap an arrow twice quickly to dash; hold ▼
while pressing a button for the down moves. Against the computer the arrows are bottom-left and the
actions bottom-right; in two-player mode each player gets a seven-button cluster in their own
corner, so two people can share one phone. The ★ button shows its recharge. Any touch away from
the buttons draws, so one thumb can keep running while a finger draws. "✕ menu" replaces Esc, a
tap replays after a match, and holding the phone upright shows a "turn your phone sideways" hint.

Matches are best of three rounds of 60 seconds; when time runs out, the fighter with more health
wins the round. Platforms are one-way: jump up through them, land on top.

In dev builds the scene is exposed as `window.arena` for console experiments,
e.g. `arena.match.fighters[1].hp = 1` to set up a knockout.

## Draw to fight

`src/game/Ink.ts` (no Phaser, so tests and the computer draw through the same calls as a finger):

- **A line** becomes a solid wall or platform (a chain of capsule colliders): stand on it, wall
  jump off it, hide behind it. Shuriken stick in it.
- **A loop** (a stroke that ends near where it started) becomes a dynamic convex boulder with the
  drawn outline. Falling, it hurts whoever it lands on, its owner included: 5 to 22 damage by
  its mass and speed. Bigger loops are heavier and cost more ink.
- **Ink**: 100 per player, 12 per meter drawn, refills 8 per second and 6 per hit landed. A pen
  that runs dry stops the stroke short; a stroke too short to count gives its ink back.
- **Fair play**: ink never appears inside a fighter (lines leave a gap, boulders refuse to
  form), each player keeps at most four drawings, lines fade after 8 s and boulders after 6 s,
  and the eraser rubs out whatever it sweeps through.
- **Ink time**: while a player draws, the fight slows to 30% under a faint blue tint and the
  camera holds still. A stroke finishes by itself after 1.6 s.
- **The computer** draws too: boulders over a distant opponent (drawn over a quarter second, so
  there's time to dash out from under them), walls against incoming stars, and it steps out from
  under boulders dropped on it.

## Look and camera

- The fight camera keeps the floor at the bottom of the screen, follows the fighters and zooms
  in up to 1.45x when they're close, pulling back when someone climbs high or the eraser comes.
  Heavy hits zoom-punch on top of it.
- Fighters wear a ninja headband whose two ribbon tails are little verlet ropes
  (`render/Headbands.ts`), cast soft shadows, and are drawn with bolder limbs.

## Ninja movement

Besides running and jumping, `Stickman.ts` can double jump once per airtime (a front flip), wall
jump off any wall it's beside (which gives the double jump back), dash (once per airtime in the
air) and crouch. Flips spin the whole ragdoll and always land upright.

## Combat

`src/combat/Fighter.ts` adds health, a 14-move ninja set and knockouts on top of a stickman.
What a press does depends on what the fighter is doing (`chooseMove`):

| Press | Move | Feel |
|---|---|---|
| Punch, Punch, Punch | Palm Strike → Elbow Smash → Rising Dragon | Ground chain; the third hit is a flipping uppercut that launches |
| Kick, Kick, Kick | Snap Kick → Spin Kick → Tornado Kick | Ground chain; the spin kick turns its back first, the tornado flips and launches |
| ↓ + Punch | Rising Dragon | Straight to the launcher |
| ↓ + Kick | Leg Sweep | Low and long; trips the victim flat for a moment |
| Dash, then Punch / Kick | Dash Strike / Flying Knee | Lunges carried by the dash |
| Punch in the air | Air Chop | Homes in on a nearby opponent and falls with them, so it juggles |
| Kick in the air | Dive Kick | Homing, diagonal plunge |
| ↓ + Kick in the air | Meteor Stomp | Straight down; a shockwave along the floor on landing |
| Special | Shuriken | A throwing star across the arena (0.9 s recharge); sticks in walls |
| ↓ + Special | Smoke Vanish | Smoke bomb; reappear behind the opponent (3 s recharge) |

- Punches and kicks mix freely in the three-step ground chain (each press within 0.4 s of the last
  move). A hit cancels the move's recovery into the next attack, a jump or a dash, which is how
  launchers are chased into the air: ↓ + Punch, then Punch, Kick lands launch, air chop, dive kick.
- Inputs are forgiving: presses are buffered for 0.25 s, a dash attack comes out up to 0.25 s after
  the dash, and down pressed a moment after the button still gives the down move.
- Each move is a whole-body animation: a pose per phase (wind-up, strike) for all limbs, plus lean, a step-in, and for some a crouch, hop or dive. Recovery eases back to the guard.
- Hit detection covers the whole striking limb, so point-blank elbows and knees count. Arms pass through each other, so blows land on the head (1.75× damage), torso or legs.
- Hits stagger the victim (floppy, no control, light braking, can't jump). Body shots fold it forward, head shots whip it back, launchers send it flying, sweeps trip it. At 0 HP it goes limp; in a match that ends the round.
- Feel, in `ArenaScene.impact` and `swingFx`, scaled by the hit's tier (light, medium, heavy):
  - hitstop, victim shake and ink flash, screen shake, and a camera zoom-punch on heavy hits and boulder crushes;
  - ink smears behind the striking fist or foot (`render/Trails.ts`), dust off the pushing foot, speed lines on lunges, launchers and dives;
  - afterimages behind dashes, flips and fast moves (`render/Afterimages.ts`); smoke clouds for the vanish, air puffs for double jumps, a dust wave for the stomp;
  - ink splashes that dry on the page, an impact star, a shockwave ring, and a comic-book word ("POW!", "BONK!", or the move's own name, like "RISING DRAGON!") on a highlighter burst (`render/ComicFx.ts`);
  - a hit counter ("3 HITS") for hits the victim couldn't recover from, and special recharge icons under each health bar;
  - faces: a squint when hurt, X-eyes and circling stars when knocked out or badly dazed;
  - a whoosh per move and layered impact sounds (`src/audio/Sfx.ts`), and slow motion on a knockout.
- The HUD and touch controls are on a second camera, so they stay still while the fight camera shakes and zooms.

## The eraser

`src/game/Eraser.ts`: every ~12 s a giant eraser sweeps the floor from one side. A blinking arrow
and two beeps warn 1.4 s ahead. It hurts (15) and launches anyone it touches, and rubs the ink
blots off the page. Jump it, double jump over it, or wait on a platform. A fighter staggered by
a hit can't jump, so knocking your opponent into its path is a real tactic.

## The computer opponent

`src/ai/Bot.ts` presses the same inputs a player would. A reflex layer runs every step: it predicts
when the eraser will reach it (from the warning onward), stops starting attacks as it comes, and
jumps it (double jumping if caught in the air); it also works through its current plan of presses.
A decision layer runs at human-like intervals and picks the next plan: mixed combo strings, sweeps
and launchers, dash-ins and shuriken from range, chasing a launched opponent into the air,
stomping from above, vanishing or jumping away from swings, and following onto platforms.
Difficulty profiles change reaction time, aggression, caution, eraser skill, ranged play and air
chasing.

## How the stickman works

`src/stickman/Stickman.ts` is an active ragdoll: 10 rigid bodies, 9 motorized hinges.
Every physics step (60 Hz) it:

1. Casts three rays down from the pelvis to find the ground.
2. Hovers the pelvis at `hoverHeight` with a spring, so the legs only have to *look* like they carry the weight.
3. Keeps the torso upright with a PD torque, leaning slightly into runs.
4. Steers the center of mass toward the target speed by pushing the torso, so limbs trail behind naturally.
5. Cancels gravity on each limb chain, then drives every joint motor toward a procedural pose (`poses.ts`: stand, run cycle, airborne).

Going limp turns all of that off and leaves a plain ragdoll. Every constant lives in
`src/config.ts` (`TUNING`) and can be changed live from the dev tuning panel. Use
"Copy values as JSON" to bring tuned values back into the code.

## Rapier gotchas (learned the hard way)

- Physics hooks (used for one-way platforms) only run if `world.step` also gets an `EventQueue`.
- Never call back into Rapier from inside a hook: it runs mid-step, and doing so can leave the
  world in a borrowed state that crashes later when it's freed. `PhysicsWorld` records what the
  hook needs before each step instead.
- Acceleration-based joint motors scale by a limb's own inertia, not its inertia about the joint,
  so limbs sag under gravity unless it's compensated (see `Stickman.compensateGravity`).

## Layout

```
src/
  config.ts             tuning values and units (64 px per meter, y points down)
  main.ts               boots Rapier, then Phaser
  game/Match.ts         one best-of-three match: fighters, bots, eraser, shuriken, vanish, rounds (no Phaser)
  game/Eraser.ts        the sweeping eraser hazard
  game/Ink.ts           draw to fight: ink meters, strokes into walls and boulders, boulder hits
  game/level.ts         arena geometry and spawn points
  ai/Bot.ts             computer opponent and difficulty profiles
  combat/Fighter.ts     health, the ninja move set, hit detection, knockdowns, knockouts
  input/TouchPad.ts     on-screen multi-touch buttons and their layouts (no Phaser)
  input/DoubleTap.ts    double-tap detection for dashes
  stickman/             skeleton definition, poses, active-ragdoll controller
  physics/              Rapier wrapper (one-way platforms), collision groups, mouse grabber
  scenes/ArenaScene.ts  title screen, input, fixed-step loop, hitstop and slow motion, effects, drawing
  scenes/Hud.ts         health bars with damage trail, round pips, clock, banners
  render/               notebook paper, ink stick figures, drawings, headbands, ink effects, the eraser
  audio/Sfx.ts          procedural sound effects
  debug/tuningPanel.ts  lil-gui sliders (dev only)
tests/                  headless tests (Vitest, Node), including full computer-vs-computer matches
```
