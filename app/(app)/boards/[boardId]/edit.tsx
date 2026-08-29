import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useCompletions } from '@/hooks/useCompletions';
import { useTheme } from '@/hooks/useTheme';
import { useContentWidth } from '@/hooks/useContentWidth';
import { BoardForm } from '@/components/board/BoardForm';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { CheckButton } from '@/components/ui/CheckButton';
import { TextField } from '@/components/ui/TextField';
import { radius, spacing, typography } from '@/constants/Colors';

/** Edit a board's details/reminder (module 5). */
export default function EditBoardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentStyle } = useContentWidth();
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { userId } = useAuth();
  const { boards, updateBoard, removeBoard, setArchived } = useBoards(userId);
  const board = boards.find((b) => b.id === boardId);
  const { dates, loading: completionsLoading } = useCompletions(boardId ?? '', userId);
  const [busy, setBusy] = useState(false);
  // The header check button drives the form's submit via BoardForm.submitRef.
  const submitRef = useRef<(() => void) | null>(null);

  // Delete confirmation: the board's exact name must be typed before the
  // destructive button becomes active.
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [typedName, setTypedName] = useState('');

  if (!board) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bgBase }]}>
        <View style={[styles.column, contentStyle]}>
          <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg }}>
            <BackButton />
          </View>
          <View style={styles.notFound}>
            <Text style={{ color: colors.textSecondary }}>Board not found.</Text>
          </View>
        </View>
      </View>
    );
  }

  const closeDelete = () => {
    setDeleteOpen(false);
    setTypedName('');
  };

  const confirmDelete = async () => {
    if (typedName.trim() !== board.name.trim()) return;
    setBusy(true);
    try {
      await removeBoard(board.id);
      router.back();
    } catch {
      setBusy(false);
      setDeleteOpen(false);
      Alert.alert('Something went wrong', 'Could not delete the board. Please try again.');
    }
  };

  const handleArchive = async () => {
    setBusy(true);
    try {
      await setArchived(board.id, !board.archived);
      router.back();
    } catch {
      Alert.alert('Something went wrong', 'Could not update the board. Please try again.');
      setBusy(false);
    }
  };

  const openDelete = () => {
    setTypedName('');
    setDeleteOpen(true);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bgBase }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.column, contentStyle]}>
        <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg }}>
          <View style={styles.header}>
            <BackButton />
            <View style={styles.headerTitle}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                Edit Board
              </Text>
            </View>
            <CheckButton label="Save changes" disabled={busy} onPress={() => submitRef.current?.()} />
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          <BoardForm
            initial={board}
            submitLabel="Save Changes"
            footerSubmit={false}
            submitRef={submitRef}
            completedDates={dates}
            loading={completionsLoading}
            onSubmit={async (draft) => {
              await updateBoard(board.id, draft);
              router.back();
            }}
          />

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <View style={{ gap: spacing.sm }}>
            <Button
              variant="secondary"
              label={board.archived ? 'Restore board' : 'Archive board'}
              disabled={busy}
              onPress={() => void handleArchive()}
            />
            <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
              {board.archived
                ? 'Move the board back to your active list.'
                : 'Hide the board from your active list without losing history.'}
            </Text>
          </View>

          <Button variant="destructive" label="Delete board" disabled={busy} onPress={openDelete} />
        </ScrollView>
      </View>

      <Modal
        visible={deleteOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDelete}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={closeDelete} />
          <View style={[styles.modalCard, { backgroundColor: colors.bgSurface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Delete “{board.name}”?
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 21 }}>
              This permanently removes the board and ALL of its history — check-ins,
              streaks, and reminders. This cannot be undone.
            </Text>
            <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
              Type “{board.name}” to confirm.
            </Text>
            <TextField
              value={typedName}
              onChangeText={setTypedName}
              placeholder={board.name}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                variant="secondary"
                label="Cancel"
                style={styles.modalButton}
                disabled={busy}
                onPress={closeDelete}
              />
              <Button
                variant="destructive"
                label="Delete"
                style={styles.modalButton}
                disabled={busy || typedName.trim() !== board.name.trim()}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  void confirmDelete();
                }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: '100%',
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  divider: {
    height: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: typography.heading,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modalButton: {
    flex: 1,
  },
});
