import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';

interface AuthBackHeaderProps {
  title: string;
}

/** Circular back affordance + title, used by the forgot/reset flows. */
export function AuthBackHeader({ title }: AuthBackHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.bgSurface },
          pressed && styles.pressed,
        ]}
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textPrimary} />
      </Pressable>
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
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
