import { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { addDays, eachDayBetween, fromISODate, toISODate, todayISO } from '@/lib/dates';

export interface HeatmapGridProps {
  /** The board's color - the only hue allowed in this grid. */
  color: string;
  completedDates?: Iterable<string>;
  /** Number of weeks to render, trailing at today. */
  weeks?: number;
  cellSize?: number;
  gap?: number;
  onDayPress?: (date: string) => void;
}

/**
 * The raw SVG heatmap (design doc §7.6), used everywhere a heatmap shows up.
 *
 * Columns are weeks (Sunday-first), rows are weekdays. Completed cells fill
 * with the board color; empty cells get a faint outline only - never a fill -
 * so the grid reads against both light and dark surfaces.
 */
export function HeatmapGrid({
  color,
  completedDates,
  weeks = 18,
  cellSize = 12,
  gap = 3,
  onDayPress,
}: HeatmapGridProps) {
  const { colors } = useTheme();

  const { days, cols } = useMemo(() => {
    const today = todayISO();
    const startDate = fromISODate(addDays(today, -(weeks * 7 - 1)));
    const leading = startDate.getDay();
    const rangeStart = addDays(toISODate(startDate), -leading);
    const all = eachDayBetween(rangeStart, today);
    return { days: all, cols: Math.ceil(all.length / 7) };
  }, [weeks]);

  const completed = useMemo(() => new Set(completedDates ?? []), [completedDates]);

  const width = cols * cellSize + (cols - 1) * gap;
  const height = 7 * cellSize + 6 * gap;

  return (
    <Svg width={width} height={height}>
      {days.map((day, index) => {
        const col = Math.floor(index / 7);
        const row = index % 7;
        const isDone = completed.has(day);
        return (
          <Rect
            key={day}
            x={col * (cellSize + gap)}
            y={row * (cellSize + gap)}
            width={cellSize}
            height={cellSize}
            rx={2}
            fill={isDone ? color : 'transparent'}
            stroke={isDone ? 'none' : colors.borderSubtle}
            strokeWidth={isDone ? 0 : 1}
            onPress={onDayPress ? () => onDayPress(day) : undefined}
          />
        );
      })}
    </Svg>
  );
}
