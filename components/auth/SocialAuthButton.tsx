import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/constants/Colors';

export type SocialProvider = 'apple' | 'google';

interface SocialAuthButtonProps {
  provider: SocialProvider;
}

/**
 * Outlined social sign-in button (design doc §7.4 secondary shape, grayscale
 * only). UI-only for now — backend wiring (Sign in with Apple / Google via
 * Supabase) is deferred; pressing surfaces an honest placeholder notice.
 */
export function SocialAuthButton({ provider }: SocialAuthButtonProps) {
  const { colors } = useTheme();
  const label = provider === 'apple' ? 'Continue with Apple' : 'Continue with Google';

  const onPress = () => {
    const name = provider === 'apple' ? 'Apple' : 'Google';
    Alert.alert(`${name} sign-in coming soon`, `Continue with ${name} will be wired to the backend in a later step.`);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.borderSubtle, backgroundColor: colors.bgBase },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={provider === 'apple' ? 'logo-apple' : 'logo-google'} size={20} color={colors.textPrimary} />
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
