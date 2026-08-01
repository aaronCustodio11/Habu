import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { updatePassword } from '@/lib/supabase/auth';
import { spacing, typography } from '@/constants/Colors';

/** Sets a new password after the reset-link flow (module 3). */
export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
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
      setDone(true);
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.textPrimary}
            onPress={() => router.back()}
            accessibilityLabel="Back"
            accessibilityRole="button"
          />
          <Text style={{ color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' }}>
            Set a new password
          </Text>
        </View>

        {done ? (
          <>
            <Text style={{ color: colors.textPrimary, fontSize: 17 }}>Password updated.</Text>
            <Button label="Continue" onPress={() => router.replace('/login')} />
          </>
        ) : (
          <>
            <TextField label="New password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
            <TextField label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="••••••••" />
            {error ? (
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{error}</Text>
            ) : null}
            <Button label="Save password" onPress={submit} disabled={submitting} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
