import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AuthScaffold } from '@/components/auth/AuthScaffold';
import { AuthBackHeader } from '@/components/auth/AuthBackHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { sendPasswordResetEmail } from '@/lib/supabase/auth';
import { validateEmail } from '@/lib/security';
import { typography } from '@/constants/Colors';

/** Requests a password reset email (design direction 1 · "Quiet Field"). */
export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold>
      <AuthBackHeader title="Forgot password" />

      {sent ? (
        <>
          <Text style={{ color: colors.textPrimary, fontSize: 17 }}>
            Check your inbox for a reset link.
          </Text>
          <Button label="Back to sign in" onPress={() => router.replace('/login')} />
        </>
      ) : (
        <>
          <Text style={{ color: colors.textPrimary, fontSize: typography.title, fontWeight: '800', textAlign: 'center' }}>
            Reset your password
          </Text>
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
          {error ? <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{error}</Text> : null}
          <Button label="Send reset link" onPress={submit} disabled={submitting} />
          <AuthFooter
            question="Remembered it?"
            link="Back to sign in"
            onPress={() => router.replace('/login')}
          />
        </>
      )}
    </AuthScaffold>
  );
}
