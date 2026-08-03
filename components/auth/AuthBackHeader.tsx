import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BackButton } from '@/components/ui/BackButton';
import { spacing } from '@/constants/Colors';

interface AuthBackHeaderProps {
  title: string;
}

/** Back affordance + title, used by the forgot/reset flows. */
export function AuthBackHeader({ title }: AuthBackHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <BackButton />
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
});
