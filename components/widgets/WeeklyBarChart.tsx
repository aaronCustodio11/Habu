import { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';
import { addDays, eachDayBetween, fromISODate, todayISO } from '@/lib/dates';
import type { Board } from '@/types/board';

export interface WeeklyBarChartProps {
  board: Board;
  dates: Set<string>;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const BAR_COUNT = 7;
const BAR_WIDTH = 16;
const BAR_GAP = 6;
const CHART_HEIGHT = 64;

/** Completions per day over the last 7 days. Data-ink uses the board color. */
export function WeeklyBarChart({ board, dates }: WeeklyBarChartProps) {
  const { colors } = useTheme();

  const bars = useMemo(() => {
    const today = todayISO();
    const days = eachDayBetween(addDays(today, -(BAR_COUNT - 1)), today);
    return days.map((day) => ({
      day,
      done: dates.has(day),
      label: WEEKDAY_LABELS[fromISODate(day).getDay()],
    }));
  }, [dates]);

  const width = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP;

  return (
    <View
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.sm,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>This week</Text>
      <Svg width={width} height={CHART_HEIGHT}>
        {bars.map((bar, i) => {
          const x = i * (BAR_WIDTH + BAR_GAP);
          const barHeight = bar.done ? CHART_HEIGHT - 8 : 6;
          return (
            <Rect
              key={bar.day}
              x={x}
              y={CHART_HEIGHT - 8 - barHeight}
              width={BAR_WIDTH}
              height={barHeight}
              rx={3}
              fill={bar.done ? board.color : colors.borderSubtle}
            />
          );
        })}
      </Svg>
      <View style={{ flexDirection: 'row', gap: BAR_GAP }}>
        {bars.map((bar) => (
          <Text key={bar.day} style={{ width: BAR_WIDTH, textAlign: 'center', color: colors.textTertiary, fontSize: 11 }}>
            {bar.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
