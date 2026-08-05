import { useCallback, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { BoardForm } from '@/components/board/BoardForm';
import { useBoards } from '@/hooks/useBoards';
import { BackButton } from '@/components/ui/BackButton';
import { CheckButton } from '@/components/ui/CheckButton';
import { navigationStore } from '@/store/navigationStore';
import { spacing, typography } from '@/constants/Colors';

/**
 * "New board" form (module 5) as a native bottom sheet (`formSheet`). The OS
 * renders the sheet: rounded top, dimmed backdrop, grabber, drag between
 * detents, slide animation — so this screen only draws content that fills the
 * sheet. Safe-area insets from the navigator adapt per detent, keeping the
 * header and form responsive on any device.
 */
export default function CreateBoardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { createBoard } = useBoards(userId);
  const submitRef = useRef<(() => void) | null>(null);

  useFocusEffect(
    useCallback(() => {
      navigationStore.getState().setCreateBoardFocused(true);
      return () => navigationStore.getState().setCreateBoardFocused(false);
    }, []),
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.bgSurface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.lg,
        }}
      >
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <BackButton />
          </View>
          <View style={styles.headerTitle}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              Create Board
            </Text>
          </View>
          <View style={[styles.headerSide, styles.headerSideRight]}>
            <CheckButton label="Create board" onPress={() => submitRef.current?.()} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        <BoardForm
          submitLabel="Create Board"
          submitRef={submitRef}
          onSubmit={async (draft) => {
            await createBoard(draft);
            router.back();
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    width: 44,
  },
  headerSideRight: {
    alignItems: 'flex-end',
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
    gap: spacing.md,
  },
});