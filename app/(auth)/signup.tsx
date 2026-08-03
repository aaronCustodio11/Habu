import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, BackHandler, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAuthThrottle } from '@/hooks/useAuthThrottle';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { HoldButton } from '@/components/ui/HoldButton';
import { TextField } from '@/components/ui/TextField';
import { AuthScaffold } from '@/components/auth/AuthScaffold';
import { AuthProgress } from '@/components/auth/AuthProgress';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { validateEmail, validatePassword, validateUsername, EMAIL_MAX_LENGTH } from '@/lib/security';
import { isEmailRegistered } from '@/lib/supabase/auth';
import { uiStore } from '@/store/uiStore';
import { radius, spacing, typography } from '@/constants/Colors';

const STEPS = ['Email', 'Password', 'Username'] as const;

/** Fades its children in when mounted; key by step to cross-fade the wizard. */
function FadeIn({ children }: { children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [opacity]);
  return (
    <Animated.View style={{ opacity, gap: spacing.md }}>{children}</Animated.View>
  );
}

/**
 * Create account — 3-step wizard (design direction 1 · "Quiet Field"):
 * email (+ social) → password + confirm → "How should we call you?".
 * Apple / Google buttons remain UI-only until backend wiring.
 */
export default function SignupScreen() {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const throttle = useAuthThrottle();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const goTo = (next: number) => {
    setError(null);
    setStep(next);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirm('');
    setUsername('');
    setError(null);
    setStep(0);
  };

  const goBack = () => {
    if (step === 1) {
      // Leaving the password stage: don't carry a half-typed password back.
      setPassword('');
      setConfirm('');
    }
    if (step === 0) {
      router.back();
      return;
    }
    goTo(step - 1);
  };

  // Android hardware back must mirror the on-screen back affordance: stepping
  // back through the wizard instead of popping the whole signup screen.
  useEffect(() => {
    if (step === 0) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [step]);

  const showError = (message: string) => {
    setError(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const submitEmail = async () => {
    const emailError = validateEmail(email);
    if (emailError) return showError(emailError);
    setError(null);
    setCheckingEmail(true);
    try {
      const registered = await isEmailRegistered(email);
      if (registered) {
        showError('An account already exists for this email. Sign in instead.');
        return;
      }
      goTo(1);
    } finally {
      setCheckingEmail(false);
    }
  };

  const submitPassword = () => {
    const passwordError = validatePassword(password);
    if (passwordError) return showError(passwordError);
    if (password !== confirm) return showError('Passwords do not match.');
    goTo(2);
  };

  const submit = async (): Promise<boolean> => {
    const usernameError = validateUsername(username);
    if (usernameError) {
      throttle.registerFailure();
      showError(
        throttle.locked
          ? `Too many attempts. Try again in ${throttle.remainingSeconds}s.`
          : usernameError,
      );
      return false;
    }
    setError(null);
    setSubmitting(true);
    try {
      const hasSession = await signUp(email.trim(), password, username.trim());
      throttle.registerSuccess();
      if (!hasSession) {
        // Email confirmation is on: no session yet. Wipe the wizard, carry a
        // success notice to the login screen, and land the user back there so
        // they sign in right after confirming their email.
        resetForm();
        uiStore.getState().setNotice('Account created — check your email to confirm, then sign in.');
        router.back();
        return false;
      }
      return true;
    } catch (err) {
      throttle.handleError(err);
      showError(
        throttle.locked
          ? `Too many attempts. Try again in ${throttle.remainingSeconds}s.`
          : err instanceof Error
            ? err.message
            : 'Something went wrong.',
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const heading =
    step === 0
      ? { title: 'Create your account', subtext: 'Start with your email, or continue with Apple or Google.' }
      : step === 1
        ? { title: 'Create a password', subtext: 'Create a secure password' }
        : { title: 'How should we call you?', subtext: 'This is the name the app will call you.' };

  const header = (
    <View style={styles.headerRow}>
      <BackButton label={step === 0 ? 'Back to sign in' : 'Go back'} onPress={goBack} />
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{STEPS[step]}</Text>
    </View>
  );

  const errorBox = error ? (
    <View style={[styles.errorBox, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
      <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
    </View>
  ) : null;

  return (
    <AuthScaffold header={header}>
      <Stack.Screen options={{ gestureEnabled: false }} />

      <AuthProgress steps={STEPS} current={step} />

      <FadeIn key={step}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{heading.title}</Text>
        <Text style={[styles.subtext, { color: colors.textSecondary }]}>{heading.subtext}</Text>

        {step === 0 ? (
          <>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Enter your email"
              maxLength={EMAIL_MAX_LENGTH}
            />
            {errorBox}
            <Button label="Continue" onPress={submitEmail} disabled={checkingEmail} />
            <AuthDivider label="or continue with" />
            <SocialAuthButton provider="apple" />
            <SocialAuthButton provider="google" />
          </>
        ) : step === 1 ? (
          <>
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter password"
              maxLength={72}
            />
            <PasswordStrength password={password} />
            <TextField
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="Repeat password"
              maxLength={72}
            />
            {errorBox}
            <Button label="Continue" onPress={submitPassword} />
          </>
        ) : (
          <>
            <TextField
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter username"
              maxLength={24}
            />
            {errorBox}
            <HoldButton
              label={throttle.locked ? `Try again in ${throttle.remainingSeconds}s` : 'Create Account'}
              hint={
                throttle.locked
                  ? 'Too many attempts — please wait'
                  : 'Press and hold to create your account'
              }
              onComplete={submit}
              disabled={submitting || throttle.locked}
            />
          </>
        )}
      </FadeIn>

      {step === 0 ? (
        <AuthFooter
          question="Already have an account?"
          link="Sign in"
          onPress={() => router.push('/login')}
        />
      ) : null}
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtext: {
    fontSize: typography.subtext,
    textAlign: 'center',
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
