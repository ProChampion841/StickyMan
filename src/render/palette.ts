export const PAPER = 0xf4efe1;
export const PAPER_RULE = 0xb3cbe9;
export const PAPER_MARGIN = 0xe5a3a0;
export const INK = 0x24221e;
export const GRAPHITE = 0xd9d3c4;
export const PENCIL = 0x8a857a;

export interface InkStyle {
  /** Near-side limbs, torso and head. */
  near: number;
  /** Far-side limbs, drawn lighter behind the body for depth. */
  far: number;
}

export const BLUE_PEN: InkStyle = { near: 0x24459c, far: 0x8ea1d4 };
export const RED_PEN: InkStyle = { near: 0xb23a2e, far: 0xdba39b };
export const ERASER_PINK = 0xf0a3b5;
export const ERASER_SLEEVE = 0x7fa6d9;
export const WARNING_RED = 0xc7362b;

/** A fighter drawn in plain ink for a moment reads as an impact flash. */
export const FLASH_PEN: InkStyle = { near: INK, far: 0x77736b };

/** 0xRRGGBB to a CSS color string, for text styles. */
export function toCss(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
