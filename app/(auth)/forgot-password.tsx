import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthThrottle } from '@/hooks/useAuthThrottle';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AuthScaffold } from '@/components/auth/AuthScaffold';
import { AuthBackHeader } from '@/components/auth/AuthBackHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { sendPasswordResetEmail } from '@/lib/supabase/auth';
import { validateEmail } from '@/lib/security';
import { radius, spacing, typography } from '@/constants/Colors';

/** Requests a password reset email (design direction 1 · "Quiet Field"). */
export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const throttle = useAuthThrottle();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const showError = (message: string) => {
    setError(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const submit = async () => {
    const emailError = validateEmail(email);
    if (emailError) return showError(emailError);
    setError(null);
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(email.trim());
      throttle.registerSuccess();
      setSent(true);
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
    <View style={[styles.box, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
      <Text style={[styles.boxText, { color: colors.danger }]}>{error}</Text>
    </View>
  ) : null;

  const successBox = sent ? (
    <View style={[styles.box, { backgroundColor: colors.successSurface, borderColor: colors.success }]}>
      <MaterialCommunityIcons name="email-check-outline" size={16} color={colors.success} />
      <Text style={[styles.boxText, { color: colors.success }]}>
        We sent a reset link to your {email.trim()}.
      </Text>
    </View>
  ) : null;

  return (
    <AuthScaffold header={<AuthBackHeader title="Forgot password" />}>
      {sent ? (
        <>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>Check your inbox</Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.subtext, textAlign: 'center' }}>
            Use the link to reset your password, then come back and sign in.
          </Text>
          {successBox}
          <Button label="Back to sign in" onPress={() => router.replace('/login')} />
        </>
      ) : (
        <>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>Reset your password</Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.subtext, textAlign: 'center' }}>
            Enter your email and we will send you a link to reset your password.
          </Text>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com"
            maxLength={254}
          />
          {errorBox}
          <Button
            label={
              throttle.locked ? `Try again in ${throttle.remainingSeconds}s` : 'Send reset link'
            }
            onPress={submit}
            disabled={submitting || throttle.locked}
          />
          <AuthFooter
            question="Remembered it?"
            link="Back to sign in"
            onPress={() => router.replace('/login')}
          />
        </>
      )}
    </AuthScaffold>
  );
}const styles = StyleSheet.create({
  heading: {
    fontSize: typography.title,
    fontWeight: '800',
    textAlign: 'center',
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  boxText: {
    fontSize: 14,
    flex: 1,
  },
});
