import { useMemo } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { addDays, eachDayBetween, todayISO } from '@/lib/dates';

export interface PillGridProps {
  /** The board's color - the only hue allowed in this grid. */
  color: string;
  completedDates?: Iterable<string>;
  /** Number of recent days to render, trailing at today. */
  days?: number;
  pillWidth?: number;
  pillHeight?: number;
  gap?: number;
}

/**
 * Recent-days pill strip: the last `days` days as rounded pills, wrapped into
 * rows. Completed days fill with the board color, the rest stay gray. Today is
 * outlined so the "now" position stays visible even once completed. Responsive
 * by design - pills wrap instead of scrolling.
 */
export function PillGrid({
  color,
  completedDates,
  days = 30,
  pillWidth = 24,
  pillHeight = 14,
  gap = 6,
}: PillGridProps) {
  const { colors } = useTheme();

  const today = todayISO();
  const daysList = useMemo(() => {
    const start = addDays(today, -(days - 1));
    return eachDayBetween(start, today);
  }, [today, days]);

  const completed = useMemo(() => new Set(completedDates ?? []), [completedDates]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, width: '100%' }}>
      {daysList.map((day) => {
        const isDone = completed.has(day);
        const isToday = day === today;
        return (
          <View
            key={day}
            style={{
              width: pillWidth,
              height: pillHeight,
              borderRadius: pillHeight / 2,
              backgroundColor: isDone ? color : colors.borderSubtle,
              borderWidth: isToday ? 1.5 : 0,
              borderColor: isToday ? color : 'transparent',
            }}
          />
        );
      })}
    </View>
  );
}