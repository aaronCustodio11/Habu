import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { LucideIcon, type LucideIconName } from '@/components/ui/LucideIcon';
import { Button } from '@/components/ui/Button';
import { spacing, typography } from '@/constants/Colors';

export interface EmptyStateProps {
  icon?: LucideIconName;
  headline: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** "Nothing here yet" - centered grayscale icon + headline + single primary action. */
export function EmptyState({ icon = 'Inbox', headline, body, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: spacing.md, padding: spacing.xl }}>
      <LucideIcon name={icon} size={56} color={colors.textTertiary} />
      <Text style={{ color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700', textAlign: 'center' }}>
        {headline}
      </Text>
      {body ? (
        <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', maxWidth: 280 }}>
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={{ alignSelf: 'stretch', marginTop: spacing.sm }} />
      ) : null}
    </View>
  );
}
