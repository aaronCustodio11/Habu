import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { sendPasswordResetEmail } from '@/lib/supabase/auth';
import { spacing, typography } from '@/constants/Colors';

/** Requests a password reset email (module 3). */
export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email) {
      setError('Enter your email address.');
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
            Forgot password
          </Text>
        </View>

        {sent ? (
          <>
            <Text style={{ color: colors.textPrimary, fontSize: 17 }}>
              Check your inbox for a reset link.
            </Text>
            <Button label="Back to sign in" onPress={() => router.replace('/login')} />
          </>
        ) : (
          <>
            <Text style={{ color: colors.textSecondary, fontSize: 17 }}>
              Enter your email and we will send you a link to reset your password.
            </Text>
            <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="you@example.com" />
            {error ? (
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{error}</Text>
            ) : null}
            <Button label="Send reset link" onPress={submit} disabled={submitting} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
