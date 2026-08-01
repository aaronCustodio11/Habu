import type { WidgetTypeKey } from '@/constants/WidgetTypes';
import { HeatmapWidget } from '@/components/widgets/HeatmapWidget';
import { StreakCounter } from '@/components/widgets/StreakCounter';
import { WeeklyBarChart } from '@/components/widgets/WeeklyBarChart';
import { MonthlyCompletionPct } from '@/components/widgets/MonthlyCompletionPct';
import { BestStreakBadge } from '@/components/widgets/BestStreakBadge';
import type { Board } from '@/types/board';

export interface WidgetRendererProps {
  widgetType: WidgetTypeKey;
  board: Board;
  dates: Set<string>;
}

/** The one file that maps a stored widget_type string to a widget component. */
export function WidgetRenderer({ widgetType, board, dates }: WidgetRendererProps) {
  switch (widgetType) {
    case 'heatmap':
      return <HeatmapWidget board={board} dates={dates} />;
    case 'streak_counter':
      return <StreakCounter dates={dates} />;
    case 'weekly_bar_chart':
      return <WeeklyBarChart board={board} dates={dates} />;
    case 'monthly_completion_pct':
      return <MonthlyCompletionPct dates={dates} />;
    case 'best_streak_badge':
      return <BestStreakBadge dates={dates} />;
    default:
      return null;
  }
}
