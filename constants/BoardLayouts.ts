/** Board visualization layouts (design doc §4.3). */
export const BOARD_LAYOUTS = ['heatmap', 'pill', 'ring'] as const;

export type BoardLayout = (typeof BOARD_LAYOUTS)[number];

export const LAYOUT_OPTIONS: { key: BoardLayout; label: string; icon: string }[] = [
  { key: 'heatmap', label: 'Heatmap Grid', icon: 'LayoutGrid' },
  { key: 'pill', label: 'Pill Grid', icon: 'Rows3' },
  { key: 'ring', label: 'Progress Ring', icon: 'Circle' },
];

export function getLayoutLabel(layout: BoardLayout): string {
  return LAYOUT_OPTIONS.find((option) => option.key === layout)?.label ?? 'Heatmap Grid';
}