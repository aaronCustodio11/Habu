import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useTheme } from '@/hooks/useTheme';
import { BoardForm } from '@/components/board/BoardForm';
import { Button } from '@/components/ui/Button';
import { spacing, typography } from '@/constants/Colors';

/** Edit a board's details/reminder (module 5). */
export default function EditBoardScreen() {
  const { colors } = useTheme();
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { userId } = useAuth();
  const { boards, updateBoard, removeBoard, setArchived } = useBoards(userId);
  const board = boards.find((b) => b.id === boardId);
  const [busy, setBusy] = useState(false);

  if (!board) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textSecondary }}>Board not found.</Text>
      </View>
    );
  }

  const handleArchive = async () => {
    setBusy(true);
    await setArchived(board.id, true);
    setBusy(false);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete board?', `"${board.name}" and its history will be removed from your device.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeBoard(board.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bgBase, flex: 1 }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
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
          Edit Board
        </Text>
      </View>

      <BoardForm
        initial={board}
        submitLabel="Save Changes"
        onSubmit={async (draft) => {
          await updateBoard(board.id, draft);
          router.back();
        }}
      />

      <Button
        variant="secondary"
        label={board.archived ? 'Restore board' : 'Archive board'}
        disabled={busy}
        onPress={handleArchive}
      />
      <Button variant="destructive" label="Delete board" disabled={busy} onPress={handleDelete} />
    </ScrollView>
  );
}
