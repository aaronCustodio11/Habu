/**
 * Color utilities shared by the board layouts and their amount-based preview,
 * so the live grids and the create/edit preview stay on the same scoring.
 */

/** Parses '#RRGGBB' into [r, g, b] 0..255. */
export function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Returns a more saturated version of `hex` by pushing channels away from gray. */
export function saturate(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  // Push each channel away from the neutral midpoint by `amount` (0..1).
  const push = (c: number) => 127 + (c - 127) * (1 + amount);
  return `#${toHex(push(r))}${toHex(push(g))}${toHex(push(b))}`;
}

/** Returns `hex` as an rgba() string with the given alpha (0..1). */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/**
 * Coverage of the daily target by a single log of `amountPerLog` — the ratio
 * that drives color intensity in the amount-based layouts. Falls back to 1
 * (full intensity) when amounts aren't configured or a target isn't set.
 */
export function coverageRatio(
  amountPerLog: number | null | undefined,
  dailyTarget: number | null | undefined,
): number {
  if (amountPerLog && amountPerLog > 0 && dailyTarget && dailyTarget > 0) {
    return amountPerLog / dailyTarget;
  }
  return 1;
}

/**
 * The color to paint a "covered" cell: the board color, or a boosted saturated
 * variant once a single log exceeds the daily target.
 */
export function intensityColor(color: string, ratio: number): string {
  return ratio > 1 ? saturate(color, 0.55) : color;
}
