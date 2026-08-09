/**
 * The five official widget definitions (design doc §7.7).
 *
 * Widgets are the tiles a user can place on a dashboard (Home quick stats or a
 * board's detail page). `components/widgets/*` renders each one and
 * `components/stats/WidgetRenderer.tsx` maps a stored `widget_type` string to
 * the right component.
 */
export const WIDGET_TYPES = [
  {
    key: 'heatmap',
    label: 'Heatmap',
    icon: 'Calendar',
    description: 'Your completion history at a glance',
  },
  {
    key: 'streak_counter',
    label: 'Streak Counter',
    icon: 'Flame',
    description: 'How many days in a row you have kept up',
  },
  {
    key: 'weekly_bar_chart',
    label: 'Weekly Bar Chart',
    icon: 'ChartColumn',
    description: 'Completions per day for the last week',
  },
  {
    key: 'monthly_completion_pct',
    label: 'Monthly Completion %',
    icon: 'Percent',
    description: 'Share of the month completed so far',
  },
  {
    key: 'best_streak_badge',
    label: 'Best Streak',
    icon: 'Trophy',
    description: 'Your longest streak ever',
  },
] as const;

export type WidgetTypeKey = (typeof WIDGET_TYPES)[number]['key'];

export function getWidgetType(key: string): (typeof WIDGET_TYPES)[number] | undefined {
  return WIDGET_TYPES.find((type) => type.key === key);
}
