import { View, Text } from 'react-native';
import Trophy from 'lucide-react-native/icons/trophy';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';
import { calculateStreak } from '@/lib/streaks/calculateStreak';

export interface BestStreakBadgeProps {
  dates: Set<string>;
}

/** Longest run ever. Grayscale trophy + number (design doc §7.7). */
export function BestStreakBadge({ dates }: BestStreakBadgeProps) {
  const { colors } = useTheme();
  const { best } = calculateStreak(dates);
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
      <Trophy size={28} color={colors.textSecondary} />
      <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: '800' }}>{best}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>best streak</Text>
    </View>
  );
}
