import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing, typography } from '@/constants/Colors';
import { calculateStreak } from '@/lib/streaks/calculateStreak';

export interface StreakCounterProps {
  dates: Set<string>;
}

/** Typographic/numeric widget - fully grayscale (design doc §7.7). */
export function StreakCounter({ dates }: StreakCounterProps) {
  const { colors } = useTheme();
  const { current } = calculateStreak(dates);
  return (
    <View
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.xs,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.textPrimary, fontSize: typography.display, fontWeight: '800' }}>
        {current}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>day streak</Text>
    </View>
  );
}
