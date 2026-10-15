import { describe, expect, it } from 'vitest';
import { PPM } from '../src/config';
import { ARENA_BOXES, FLOOR_Y, SPAWNS } from '../src/game/level';
import { DOUBLE_TAP_WINDOW, DoubleTap } from '../src/input/DoubleTap';
import { type PadButton, TouchPad, touchLayout } from '../src/input/TouchPad';
import { clamp } from '../src/util/math';

const find = (layout: PadButton[], owner: number, action: PadButton['action']) =>
  layout.find((b) => b.owner === owner && b.action === action)!;

describe('TouchPad', () => {
  it('holds the button under a finger until it lifts', () => {
    const pad = new TouchPad();
    const layout = touchLayout('vsBot');
    pad.setLayout(layout);
    const left = find(layout, 0, 'left');
    expect(pad.press(1, left.x + 10, left.y - 10)).toBe(left);
    expect(pad.isHeld(0, 'left')).toBe(true);
    pad.release(1);
    expect(pad.isHeld(0, 'left')).toBe(false);
  });

  it('tracks several fingers at once: run with one thumb, punch with the other', () => {
    const pad = new TouchPad();
    const layout = touchLayout('vsBot');
    pad.setLayout(layout);
    const right = find(layout, 0, 'right');
    const punch = find(layout, 0, 'punch');
    pad.press(1, right.x, right.y);
    pad.press(2, punch.x, punch.y);
    expect(pad.isHeld(0, 'right')).toBe(true);
    expect(pad.isHeld(0, 'punch')).toBe(true);
    pad.release(2);
    expect(pad.isHeld(0, 'right')).toBe(true);
    expect(pad.isHeld(0, 'punch')).toBe(false);
  });

  it('switches direction when a thumb slides between the arrows, and keeps holding off-button', () => {
    const pad = new TouchPad();
    const layout = touchLayout('vsBot');
    pad.setLayout(layout);
    const left = find(layout, 0, 'left');
    const right = find(layout, 0, 'right');
    pad.press(1, left.x, left.y);
    pad.slide(1, right.x, right.y);
    expect(pad.isHeld(0, 'right')).toBe(true);
    expect(pad.isHeld(0, 'left')).toBe(false);
    // Drifting up off the buttons keeps running.
    pad.slide(1, right.x, right.y - 300);
    expect(pad.isHeld(0, 'right')).toBe(true);
  });

  it('slides onto the down arrow to crouch, and back off it to run', () => {
    const pad = new TouchPad();
    const layout = touchLayout('vsBot');
    pad.setLayout(layout);
    const down = find(layout, 0, 'down');
    const right = find(layout, 0, 'right');
    pad.press(1, right.x, right.y);
    pad.slide(1, down.x, down.y);
    expect(pad.isHeld(0, 'down')).toBe(true);
    expect(pad.isHeld(0, 'right')).toBe(false);
    pad.slide(1, right.x, right.y);
    expect(pad.isHeld(0, 'right')).toBe(true);
  });

  it('ignores touches away from every button', () => {
    const pad = new TouchPad();
    pad.setLayout(touchLayout('vsBot'));
    expect(pad.press(1, 640, 300)).toBeNull();
  });

  it('gives each player their own mirrored cluster in two-player mode', () => {
    const layout = touchLayout('versus');
    for (const owner of [0, 1]) {
      expect(layout.filter((b) => b.owner === owner).map((b) => b.action).sort()).toEqual(
        ['down', 'jump', 'kick', 'left', 'punch', 'right', 'special'],
      );
    }
    // P1's buttons all on the left half, P2's on the right, arrows still in order.
    expect(layout.filter((b) => b.owner === 0).every((b) => b.x < 640)).toBe(true);
    expect(layout.filter((b) => b.owner === 1).every((b) => b.x > 640)).toBe(true);
    expect(find(layout, 1, 'left').x).toBeLessThan(find(layout, 1, 'right').x);
  });

  it('keeps buttons off the platforms and off the fighters where each round starts', () => {
    const platforms = ARENA_BOXES.filter((b) => b.oneWay).map((b) => ({
      left: b.x * PPM,
      right: (b.x + b.w) * PPM,
      top: b.y * PPM,
      bottom: (b.y + b.h) * PPM,
    }));
    // A standing stickman spans about 0.3 m either side of its spawn and 1.9 m up from the floor.
    const fighters = SPAWNS.map((s) => ({
      left: (s.x - 0.3) * PPM,
      right: (s.x + 0.3) * PPM,
      top: (FLOOR_Y - 1.9) * PPM,
      bottom: FLOOR_Y * PPM,
    }));
    const touches = (b: PadButton, r: { left: number; right: number; top: number; bottom: number }) =>
      Math.hypot(b.x - clamp(b.x, r.left, r.right), b.y - clamp(b.y, r.top, r.bottom)) < b.r;
    for (const mode of ['vsBot', 'versus'] as const) {
      for (const button of touchLayout(mode)) {
        for (const rect of [...platforms, ...fighters]) expect(touches(button, rect)).toBe(false);
      }
    }
  });

  it('never lets two buttons of a layout overlap', () => {
    for (const mode of ['vsBot', 'versus'] as const) {
      const layout = touchLayout(mode);
      for (const a of layout) {
        for (const b of layout) {
          if (a !== b) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(a.r + b.r);
        }
      }
    }
  });
});

describe('DoubleTap', () => {
  it('dashes on two quick taps of the same direction, per player', () => {
    const taps = new DoubleTap();
    expect(taps.tap(0, 1, 0)).toBe(false);
    expect(taps.tap(1, 1, 0.05)).toBe(false);
    expect(taps.tap(0, 1, 0.1)).toBe(true);
    // A third tap starts over instead of dashing again.
    expect(taps.tap(0, 1, 0.2)).toBe(false);
  });

  it('ignores slow taps and taps that change direction', () => {
    const taps = new DoubleTap();
    taps.tap(0, 1, 0);
    expect(taps.tap(0, 1, DOUBLE_TAP_WINDOW + 0.05)).toBe(false);
    expect(taps.tap(0, -1, DOUBLE_TAP_WINDOW + 0.1)).toBe(false);
  });
});
