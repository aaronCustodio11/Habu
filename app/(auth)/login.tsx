import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAuthThrottle } from '@/hooks/useAuthThrottle';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AuthScaffold } from '@/components/auth/AuthScaffold';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { HabuWordmark } from '@/components/auth/HabuWordmark';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';
import { uiStore } from '@/store/uiStore';
import { radius, spacing, typography } from '@/constants/Colors';
import { validateEmail, PASSWORD_MAX_LENGTH } from '@/lib/security';

/**
 * Sign in (design direction 1 · "Quiet Field" — email-first, centered, calm).
 * Apple / Google buttons are UI-only for now; backend wiring comes later.
 */
export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const throttle = useAuthThrottle();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // One-shot success notice carried over from signup ("check your email…").
  // Read on focus and cleared immediately so it never reappears.
  useFocusEffect(
    useCallback(() => {
      const message = uiStore.getState().notice;
      if (message) {
        uiStore.getState().setNotice(null);
        setNotice(message);
      }
    }, []),
  );

  const dismissNotice = () => setNotice(null);

  const showError = (message: string) => {
    setError(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const submit = async () => {
    if (!email || !password) {
      showError('Enter your email and password.');
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      showError(emailError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      throttle.registerSuccess();
    } catch (err) {
      throttle.handleError(err);
      showError(
        throttle.locked
          ? `Too many attempts. Try again in ${throttle.remainingSeconds}s.`
          : err instanceof Error
            ? err.message
            : 'Something went wrong.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const errorBox = error ? (
    <View style={[styles.errorBox, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
      <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
    </View>
  ) : null;

  const noticeBox = notice ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Dismiss notification"
      onPress={dismissNotice}
      style={[styles.errorBox, { backgroundColor: colors.successSurface, borderColor: colors.success }]}
    >
      <MaterialCommunityIcons name="email-check-outline" size={16} color={colors.success} />
      <Text style={[styles.errorText, { color: colors.success }]}>{notice}</Text>
    </Pressable>
  ) : null;

  return (
    <AuthScaffold>
      <HabuWordmark size={26} />
      <Text style={{ color: colors.textPrimary, fontSize: typography.title, fontWeight: '800', textAlign: 'center' }}>
        Welcome
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: typography.subtext, textAlign: 'center' }}>
        Pick up where your streak left off.
      </Text>

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Enter your email"
        maxLength={254}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Enter your password"
        maxLength={PASSWORD_MAX_LENGTH}
      />

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Forgot password"
        onPress={() => router.push('/forgot-password')}
        style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}
      >
        <Text style={{ color: colors.textSecondary, fontSize: typography.subtext, textDecorationLine: 'underline' }}>
          Forgot password?
        </Text>
      </Pressable>

      {errorBox}
      {noticeBox}

      <Button
        label={
          throttle.locked ? `Try again in ${throttle.remainingSeconds}s` : 'Sign In'
        }
        onPress={submit}
        disabled={submitting || throttle.locked}
      />

      <AuthDivider label="or continue with" />

      <SocialAuthButton provider="apple" />
      <SocialAuthButton provider="google" />

      <AuthFooter
        question="New to Habu?"
        link="Create account"
        onPress={() => router.push('/signup')}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
  },
  pressed: {
    opacity: 0.7,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
});
