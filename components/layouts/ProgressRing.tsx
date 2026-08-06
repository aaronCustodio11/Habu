import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { addDays, eachDayBetween, todayISO } from '@/lib/dates';
import { typography } from '@/constants/Colors';

export interface ProgressRingProps {
  /** The board's color - the only hue allowed in this ring. */
  color: string;
  completedDates?: Iterable<string>;
  /** Number of recent days forming the denominator. */
  days?: number;
  size?: number;
  strokeWidth?: number;
}

/**
 * Completion ring: share of the last `days` days that were checked in,
 * drawn as an arc in the board color with the percentage in the center.
 */
export function ProgressRing({
  color,
  completedDates,
  days = 30,
  size = 140,
  strokeWidth = 12,
}: ProgressRingProps) {
  const { colors } = useTheme();

  const today = todayISO();
  const { completed, pct } = useMemo(() => {
    const start = addDays(today, -(days - 1));
    const window = new Set(eachDayBetween(start, today));
    const done = new Set(completedDates ?? []);
    let count = 0;
    for (const day of window) {
      if (done.has(day)) count += 1;
    }
    return { completed: count, pct: Math.round((count / days) * 100) };
  }, [today, days, completedDates]);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.borderSubtle}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: typography.title, fontWeight: '800' }}>
          {completed}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>of {days} days</Text>
      </View>
    </View>
  );
}