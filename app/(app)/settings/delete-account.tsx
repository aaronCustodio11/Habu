import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { resetDatabase } from '@/lib/db/client';
import { spacing } from '@/constants/Colors';

/**
 * Multi-step deletion flow (module 13). A Supabase user record itself can only
 * be removed server-side (admin API); this flow wipes all local data, cancels
 * reminders, and signs the session out.
 */
export default function DeleteAccountScreen() {
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const [step, setStep] = useState<'intro' | 'confirm'>('intro');
  const [typed, setTyped] = useState('');

  const deleteEverything = async () => {
    await resetDatabase();
    await signOut();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase, padding: spacing.lg, gap: spacing.md }}>
      {step === 'intro' ? (
        <>
          <Text style={{ color: colors.textPrimary, fontSize: 17 }}>
            Deleting your account removes every board, check-in, and streak from this device.
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: 15 }}>
            This cannot be undone. Your Supabase record (and any synced copy) can only be removed
            by support.
          </Text>
          <Button variant="destructive" label="Continue" onPress={() => setStep('confirm')} />
        </>
      ) : (
        <>
          <Text style={{ color: colors.textPrimary, fontSize: 17 }}>
            Type DELETE to confirm.
          </Text>
          <TextField value={typed} onChangeText={setTyped} placeholder="DELETE" autoCapitalize="characters" autoCorrect={false} />
          <Button
            variant="destructive"
            label="Permanently delete everything"
            disabled={typed.trim().toUpperCase() !== 'DELETE'}
            onPress={() => void deleteEverything()}
          />
        </>
      )}
    </View>
  );
}
