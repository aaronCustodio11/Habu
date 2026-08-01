import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing, typography } from '@/constants/Colors';
import { toISODate, todayISO } from '@/lib/dates';

export interface MonthlyCompletionPctProps {
  dates: Set<string>;
}

/** Share of the month completed so far. Typographic/numeric - grayscale. */
export function MonthlyCompletionPct({ dates }: MonthlyCompletionPctProps) {
  const { colors } = useTheme();
  const now = new Date();
  const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  const daysElapsed = now.getDate();

  let completed = 0;
  for (const day of dates) {
    if (day >= monthStart && day <= todayISO()) completed += 1;
  }
  const pct = daysElapsed > 0 ? Math.round((completed / daysElapsed) * 100) : 0;

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
        {pct}%
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>of the month completed</Text>
    </View>
  );
}
