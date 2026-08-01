import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { updatePassword } from '@/lib/supabase/auth';
import { spacing } from '@/constants/Colors';

/** Email/password management (module 13). */
export default function AccountScreen() {
  const { colors } = useTheme();
  const { email } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
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
      setPassword('');
      setConfirm('');
      setMessage('Password updated.');
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
          {email ? `Signed in as ${email}` : 'Email not available'}
        </Text>

        <TextField label="New password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextField label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry />

        {message ? <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{message}</Text> : null}
        {error ? <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{error}</Text> : null}

        <Button label="Update password" onPress={submit} disabled={submitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
