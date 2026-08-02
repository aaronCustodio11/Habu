import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/Colors';

interface AuthDividerProps {
  label: string;
}

/** Hairline divider with centered label, e.g. "or continue with". */
export function AuthDivider({ label }: AuthDividerProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: colors.borderSubtle }]} />
      <Text style={[styles.label, { color: colors.textTertiary }]}>{label}</Text>
      <View style={[styles.line, { backgroundColor: colors.borderSubtle }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
  },
  label: {
    fontSize: 13,
  },
});
