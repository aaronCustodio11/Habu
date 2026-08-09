import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import X from 'lucide-react-native/icons/x';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useCompletions } from '@/hooks/useCompletions';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Glass } from '@/components/Glass';
import { radius, spacing } from '@/constants/Colors';

/** "Mark done + add a note" (module 6). Glass backing, solid content card. */
export default function CheckInModal() {
  const { colors } = useTheme();
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { userId } = useAuth();
  const { boards } = useBoards(userId);
  const { isCheckedInToday, checkIn, undoToday } = useCompletions(boardId ?? '', userId);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const board = boards.find((b) => b.id === boardId);
  if (!board) return null;

  const submit = async () => {
    setBusy(true);
    await checkIn(note.trim() || undefined);
    setBusy(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlayScrim }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Glass
        fallbackStyle={{ backgroundColor: colors.bgSurfaceRaised }}
        style={{ borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, overflow: 'hidden' }}
      >
        <View style={{ backgroundColor: colors.bgSurfaceRaised, padding: spacing.lg, gap: spacing.md, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Close" accessibilityRole="button">
              <X size={24} color={colors.textSecondary} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>{board.name}</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 13 }}>{isCheckedInToday ? 'Already checked in today' : 'Check in for today'}</Text>
            </View>
          </View>

          <TextField label="Note (optional)" value={note} onChangeText={setNote} placeholder="How did it go?" multiline />

          <Button
            label={isCheckedInToday ? 'Update check-in' : 'Check in'}
            onPress={() => void submit()}
            disabled={busy}
          />

          {isCheckedInToday ? (
            <Button
              variant="ghost"
              label="Undo today's check-in"
              onPress={() => {
                void undoToday();
                router.back();
              }}
            />
          ) : null}
        </View>
      </Glass>
    </KeyboardAvoidingView>
  );
}
