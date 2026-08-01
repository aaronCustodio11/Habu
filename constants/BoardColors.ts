/**
 * The curated board-color swatch set (design doc §4.3).
 *
 * Mid-tone, high-saturation hues chosen to stay legible against both the light
 * and dark grayscale shells. Near-white and near-black are deliberately absent.
 */
export const BOARD_COLORS = [
  '#E53935', // red
  '#D81B60', // pink
  '#8E24AA', // purple
  '#5E35B1', // deep purple
  '#3949AB', // indigo
  '#1E88E5', // blue
  '#00ACC1', // cyan
  '#00897B', // teal
  '#43A047', // green
  '#7CB342', // light green
  '#FDD835', // yellow
  '#FB8C00', // orange
  '#F4511E', // deep orange
  '#6D4C41', // brown
] as const;

export type BoardColor = (typeof BOARD_COLORS)[number];
