import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { BoardForm } from '@/components/board/BoardForm';
import { useBoards } from '@/hooks/useBoards';
import { BackButton } from '@/components/ui/BackButton';
import { spacing, typography } from '@/constants/Colors';

/** "New board" form (module 5). */
export default function CreateBoardScreen() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const { createBoard } = useBoards(userId);

  return (
    <ScrollView
      style={{ backgroundColor: colors.bgBase, flex: 1 }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <BackButton />
        <Text style={{ color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' }}>
          New Board
        </Text>
      </View>

      <BoardForm
        submitLabel="Create Board"
        onSubmit={async (draft) => {
          await createBoard(draft);
          router.back();
        }}
      />
    </ScrollView>
  );
}
