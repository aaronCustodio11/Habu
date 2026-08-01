import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { spacing, typography } from '@/constants/Colors';

/** Simple login / sign-up (design doc §10 - solid bg-base, standard inputs). */
export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        const hasSession = await signUp(email.trim(), password);
        if (!hasSession) {
          setError('Account created — check your email to confirm, then sign in.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bgBase }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.lg,
          gap: spacing.md,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: colors.textPrimary, fontSize: typography.display, fontWeight: '800' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 17 }}>
          {mode === 'login'
            ? 'Sign in to keep your habits in sync.'
            : 'One account keeps your data safe across devices.'}
        </Text>

        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="you@example.com" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

        {error ? (
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{error}</Text>
        ) : null}

        <Button label={mode === 'login' ? 'Sign In' : 'Create Account'} onPress={submit} disabled={submitting} />

        <View style={{ flexDirection: 'row', gap: spacing.xs, justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
            {mode === 'login' ? "New to Habu?" : 'Already have an account?'}
          </Text>
          <Text
            style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600' }}
            onPress={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </Text>
        </View>

        {mode === 'login' ? (
          <Link href="/forgot-password" style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', textDecorationLine: 'underline' }}>
            Forgot password?
          </Link>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
