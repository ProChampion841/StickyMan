import { beforeAll, describe, expect, it } from 'vitest';
import { MAX_HP } from '../src/combat/Fighter';
import { FLOOR_Y } from '../src/game/level';
import { INTRO_TIME, Match, type MatchEvent, ROUND_OVER_TIME } from '../src/game/Match';
import { FIXED_DT } from '../src/physics/PhysicsWorld';
import { initRapier } from '../src/physics/rapier';
import { seededRng } from '../src/util/random';

beforeAll(async () => {
  await initRapier();
});

/** Steps the match for `seconds`, or until `until` returns true. */
function play(match: Match, seconds: number, events: MatchEvent[] = [], until?: () => boolean): MatchEvent[] {
  for (let i = 0; i < Math.round(seconds / FIXED_DT) && !until?.(); i++) match.step(FIXED_DT, events);
  return events;
}

const knockOut = (match: Match, index: number) => match.fighters[index].hurt(MAX_HP, { x: 0, y: 0 }, 0);
const ofType = <T extends MatchEvent['type']>(events: MatchEvent[], type: T) =>
  events.filter((e): e is Extract<MatchEvent, { type: T }> => e.type === type);

describe('Match rounds', () => {
  it('announces the round, holds everyone still, then starts the fight', () => {
    const match = new Match({ mode: 'versus', rng: seededRng(1) });
    const p1 = match.fighters[0].man;
    const startX = p1.centerOfMass().x;
    const events = play(match, INTRO_TIME * 0.8, [], () => {
      p1.input.move = 1;
      return false;
    });
    // play() only checks `until` between steps, so set the input before each one.
    for (let i = 0; i < 10; i++) {
      p1.input.move = 1;
      match.step(FIXED_DT, events);
    }
    expect(ofType(events, 'roundStart')).toEqual([{ type: 'roundStart', round: 1, final: false }]);
    expect(match.phase).toBe('intro');
    expect(Math.abs(p1.centerOfMass().x - startX)).toBeLessThan(0.05);
    play(match, INTRO_TIME, events);
    expect(match.phase).toBe('fight');
    expect(ofType(events, 'fight')).toHaveLength(1);
  });

  it('gives a knockout round to the fighter left standing, then resets for the next round', () => {
    const match = new Match({ mode: 'versus', rng: seededRng(2) });
    play(match, INTRO_TIME + 0.1);
    knockOut(match, 1);
    const events = play(match, FIXED_DT);
    expect(ofType(events, 'roundOver')).toEqual([{ type: 'roundOver', winner: 0, reason: 'ko' }]);
    expect(match.wins).toEqual([1, 0]);
    // The loser stays down for the whole pause between rounds.
    play(match, ROUND_OVER_TIME - 0.2);
    expect(match.fighters[1].knockedOut).toBe(true);
    play(match, 0.3);
    expect(match.phase).toBe('intro');
    expect(match.round).toBe(2);
    expect(match.fighters[1].hp).toBe(MAX_HP);
    expect(match.fighters[1].knockedOut).toBe(false);
  });

  it('decides a timed-out round on remaining health', () => {
    const match = new Match({ mode: 'versus', rng: seededRng(3) });
    play(match, INTRO_TIME + 0.1);
    match.fighters[0].hp = 40;
    match.clock = 0.05;
    const events = play(match, 0.1);
    expect(ofType(events, 'roundOver')).toEqual([{ type: 'roundOver', winner: 1, reason: 'time' }]);
  });

  it('ends the match at two round wins and announces the final round at one apiece', () => {
    const match = new Match({ mode: 'versus', rng: seededRng(4) });
    const events: MatchEvent[] = [];
    for (const loser of [1, 0, 1]) {
      play(match, INTRO_TIME + 0.1, events);
      knockOut(match, loser);
      play(match, ROUND_OVER_TIME + 0.1, events);
    }
    expect(ofType(events, 'roundStart').map((e) => e.final)).toEqual([false, false, true]);
    expect(match.phase).toBe('matchOver');
    expect(ofType(events, 'matchOver')).toEqual([{ type: 'matchOver', winner: 0 }]);
  });
});

describe('Eraser', () => {
  /** A versus match in its fight phase with a sweep about to start. */
  function sweepSoon(seed: number) {
    const match = new Match({ mode: 'versus', rng: seededRng(seed) });
    play(match, INTRO_TIME + 0.1);
    match.eraser.timer = 0.05;
    return match;
  }

  it('warns, then sweeps the floor and launches everyone standing in its path', () => {
    const match = sweepSoon(5);
    const events = play(match, 5);
    const types = events.map((e) => e.type).filter((t) => t.startsWith('eraser'));
    expect(types.slice(0, 2)).toEqual(['eraserWarning', 'eraserSweep']);
    const hits = ofType(events, 'eraserHit');
    expect(hits.map((h) => match.fighters.indexOf(h.victim)).sort()).toEqual([0, 1]);
    expect(match.fighters.map((f) => f.hp)).toEqual([MAX_HP - 15, MAX_HP - 15]);
  });

  it('passes under a fighter standing on a platform', () => {
    const match = sweepSoon(6);
    match.fighters[0].man.reset({ x: 3.95, y: FLOOR_Y - 2.3 });
    const hits = ofType(play(match, 5), 'eraserHit');
    expect(hits.map((h) => match.fighters.indexOf(h.victim))).toEqual([1]);
  });
});

describe('Computer opponent', () => {
  it('knocks out an opponent who does nothing', () => {
    const match = new Match({ mode: 'vsBot', rng: seededRng(7) });
    const events = play(match, 45, [], () => match.phase === 'roundOver');
    expect(ofType(events, 'roundOver')).toEqual([{ type: 'roundOver', winner: 1, reason: 'ko' }]);
  });

  it('mostly jumps over the eraser while fighting', () => {
    // Two hard computer players who can't be knocked out, through 5 sweeps in each of 5 fights.
    // Some hits are by design: a fighter staggered by a punch can't jump. Fighters who never
    // dodged would be hit on nearly every sweep.
    let chances = 0;
    let hits = 0;
    for (const seed of [8, 21, 22, 23, 24]) {
      const match = new Match({ mode: 'demo', botLevel: 'hard', rng: seededRng(seed) });
      for (const fighter of match.fighters) fighter.hp = 1e9;
      play(match, INTRO_TIME + 0.1);
      const events: MatchEvent[] = [];
      const sweeps = () => ofType(events, 'eraserSweep').length;
      play(match, 60, events, () => {
        if (match.eraser.phase === 'idle') match.eraser.timer = Math.min(match.eraser.timer, 0.5);
        return sweeps() >= 5 && match.eraser.phase === 'idle';
      });
      chances += sweeps() * 2;
      hits += ofType(events, 'eraserHit').length;
    }
    expect(chances).toBe(50);
    expect(hits / chances).toBeLessThan(0.35);
  });

  it('plays a full computer-vs-computer match to a winner, using much of the move set', () => {
    const match = new Match({ mode: 'demo', rng: seededRng(9) });
    const events = play(match, 3 * 75, [], () => match.phase === 'matchOver');
    expect(match.phase).toBe('matchOver');
    expect(ofType(events, 'matchOver')).toHaveLength(1);
    expect(new Set(ofType(events, 'hit').map((h) => h.kind))).toEqual(new Set(['punch', 'kick', 'special']));
    const moves = new Set(ofType(events, 'swing').map((s) => s.move));
    // A wide spread of the ninja move set, not just one string.
    expect(moves.size).toBeGreaterThanOrEqual(9);
  });
});
