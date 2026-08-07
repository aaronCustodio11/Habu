import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { addDays, fromISODate, todayISO } from '@/lib/dates';

/** Single-letter weekday labels, Sunday-first to match the grid columns. */
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export interface PillGridProps {
  /** The board's color - the only hue allowed in this grid. */
  color: string;
  completedDates?: Iterable<string>;
  /** Number of recent days to render, trailing at today (clamped to the current week). */
  days?: number;
  cellSize?: number;
  gap?: number;
}

/**
 * Current-week weekday strip: one single row of thick rounded "line" cells,
 * one per weekday (Sunday-first) with a single-letter day-of-week label on the
 * x-axis above. Completed days fill with the board color, the rest stay gray;
 * days that haven't happened yet this week stay empty. Today keeps an outline
 * so the "now" position stays visible even once completed.
 */
export function PillGrid({
  color,
  completedDates,
  cellSize = 16,
  gap = 4,
}: PillGridProps) {
  const { colors } = useTheme();
  const today = todayISO();

  const completed = useMemo(() => new Set(completedDates ?? []), [completedDates]);

  // The current week, Sunday-first (relative to today's device-local day).
  const week = useMemo(() => {
    const weekStart = addDays(today, -fromISODate(today).getDay());
    return Array.from({ length: 7 }, (_, col) => addDays(weekStart, col));
  }, [today]);

  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ flexDirection: 'row', gap }} accessibilityRole="none">
        {WEEKDAY_LETTERS.map((label, col) => (
          <View key={col} style={{ width: cellSize, alignItems: 'center' }}>
            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap }}>
        {week.map((date, col) => {
          const isFuture = date > today;
          const done = !isFuture && completed.has(date);
          const isToday = date === today;
          return (
            <View
              key={col}
              style={{
                width: cellSize,
                height: Math.round(cellSize * 1.75),
                borderRadius: cellSize / 3,
                backgroundColor: isFuture ? 'transparent' : done ? color : colors.borderSubtle,
                borderWidth: isToday ? 1.5 : 0,
                borderColor: isToday ? color : 'transparent',
              }}
            />
          );
        })}
      </View>
    </View>
  );
}