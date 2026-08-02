import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AuthScaffold } from '@/components/auth/AuthScaffold';
import { AuthBackHeader } from '@/components/auth/AuthBackHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { updatePassword } from '@/lib/supabase/auth';
import { validatePassword } from '@/lib/security';
import { typography } from '@/constants/Colors';

/** Sets a new password after the reset-link flow (design direction 1 · "Quiet Field"). */
export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold>
      <AuthBackHeader title="Set a new password" />

      {done ? (
        <>
          <Text style={{ color: colors.textPrimary, fontSize: 17 }}>Password updated.</Text>
          <Button label="Continue" onPress={() => router.replace('/login')} />
        </>
      ) : (
        <>
          <Text style={{ color: colors.textPrimary, fontSize: typography.title, fontWeight: '800', textAlign: 'center' }}>
            Choose a strong password
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.subtext, textAlign: 'center' }}>
            At least 8 characters. Try a phrase only you would know.
          </Text>
          <TextField
            label="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="8+ characters"
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
          {error ? <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{error}</Text> : null}
          <Button label="Save password" onPress={submit} disabled={submitting} />
          <AuthFooter
            question="Changed your mind?"
            link="Back to sign in"
            onPress={() => router.replace('/login')}
          />
        </>
      )}
    </AuthScaffold>
  );
}
