import { StyleSheet, Text, View } from 'react-native';
import Circle from 'lucide-react-native/icons/circle';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import { useTheme } from '@/hooks/useTheme';
import { evaluatePasswordStrength } from '@/lib/security';
import { spacing } from '@/constants/Colors';

const LEVELS = [1, 2, 3, 4];

interface PasswordStrengthProps {
  password: string;
}

/**
 * Realtime password strength meter.
 * Four segments fill with the score, colored red (weak) → orange (fair) → green (good/strong);
 * the checklist ticks as requirements land.
 */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { colors } = useTheme();
  const strength = evaluatePasswordStrength(password);
  const hasInput = password.length > 0;

  const barColor =
    strength.score <= 1 ? colors.danger : strength.score === 2 ? colors.warning : colors.success;

  const checks = [
    { label: 'Upper & lower case', met: strength.checks.lowercase && strength.checks.uppercase },
    { label: '8+ characters', met: strength.checks.minLength },
    { label: 'Special characters', met: strength.checks.symbol },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.segments}>
        {LEVELS.map((level) => {
          const filled = hasInput && level <= strength.score;
          return (
            <View
              key={level}
              style={[
                styles.segment,
                { backgroundColor: filled ? barColor : colors.borderSubtle },
              ]}
            />
          );
        })}
      </View>
      <Text style={[styles.label, { color: hasInput ? barColor : colors.textTertiary }]}>
        {hasInput ? strength.label : 'Password strength'}
      </Text>

      {hasInput ? (
        <View style={styles.checks}>
          {checks.map((check) => (
            <View key={check.label} style={styles.checkRow}>
              {check.met ? (
                <CircleCheck size={16} color={colors.textPrimary} />
              ) : (
                <Circle size={16} color={colors.textTertiary} />
              )}
              <Text style={[styles.checkLabel, { color: colors.textSecondary }]}>{check.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  checks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  checkLabel: {
    fontSize: 13,
  },
});
