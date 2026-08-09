import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useContentWidth } from '@/hooks/useContentWidth';
import { BoardForm } from '@/components/board/BoardForm';
import { useBoards } from '@/hooks/useBoards';
import { BackButton } from '@/components/ui/BackButton';
import { spacing, typography } from '@/constants/Colors';

/**
 * "New board" form (module 5) as a regular pushed screen — same native card
 * push on iOS, Android, and iOS 26+. The header stays pinned with just the
 * back affordance; the form's own footer button submits. On large screens the
 * content caps and centers (`useContentWidth`) so it stays readable on tablets
 * and landscape phones. All transitions are OS-native, so there's no JS
 * animation cost and it holds 60fps on every device.
 */
export default function CreateBoardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentStyle } = useContentWidth();
  const { userId } = useAuth();
  const { createBoard } = useBoards(userId);

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
                Create Board
              </Text>
            </View>
            <View style={styles.headerSpacer} />
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
            onSubmit={async (draft) => {
              await createBoard(draft);
              // Always land on the Boards list (the 2nd floating-nav item),
              // regardless of where creation was launched from.
              router.dismissTo('/boards');
            }}
          />
        </ScrollView>
      </View>
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
  headerSpacer: {
    width: 44,
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
