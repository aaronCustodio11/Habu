import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useTheme } from '@/hooks/useTheme';
import { BoardCard } from '@/components/board/BoardCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/Colors';

/** Full board list with Active/Archived tabs (module 9). */
export default function BoardsListScreen() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const { boards, loading } = useBoards(userId);
  const [tab, setTab] = useState<'active' | 'archived'>('active');

  const filtered = useMemo(
    () => boards.filter((board) => (tab === 'active' ? !board.archived : board.archived)),
    [boards, tab],
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.bgBase, flex: 1 }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      data={filtered}
      keyExtractor={(board) => board.id}
      ListHeaderComponent={
        <View style={{ gap: spacing.md }}>
          <Text style={{ color: colors.textPrimary, fontSize: typography.title, fontWeight: '800' }}>
            Boards
          </Text>

          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.bgSurface,
              borderRadius: radius.md,
              padding: 4,
            }}
          >
            {(['active', 'archived'] as const).map((key) => (
              <Pressable
                key={key}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === key }}
                onPress={() => setTab(key)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.sm,
                  alignItems: 'center',
                  backgroundColor: tab === key ? colors.textPrimary : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: tab === key ? colors.bgBase : colors.textSecondary,
                    fontSize: 15,
                    fontWeight: tab === key ? '600' : '400',
                  }}
                >
                  {key === 'active' ? 'Active' : 'Archived'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={
        loading ? null : tab === 'active' ? (
          <EmptyState
            icon="fire"
            headline={boards.length > 0 ? 'No active boards' : 'Nothing here yet'}
            body={
              boards.length > 0
                ? 'Everything is archived.'
                : 'Create your first board to start tracking a habit.'
            }
            actionLabel="New Board"
            onAction={() => router.push('/boards/create')}
          />
        ) : (
          <EmptyState icon="archive-outline" headline="No archived boards" body="Archived boards will appear here." />
        )
      }
      renderItem={({ item }) => (
        <BoardCard
          board={item}
          style={item.archived ? { opacity: 0.6 } : undefined}
          onPress={() => router.push({ pathname: '/boards/[boardId]', params: { boardId: item.id } })}
          onLongPress={() => router.push({ pathname: '/boards/[boardId]/edit', params: { boardId: item.id } })}
        />
      )}
      ListFooterComponent={
        tab === 'active' ? (
          <Button
            label="New Board"
            variant="secondary"
            onPress={() => router.push('/boards/create')}
            style={{ marginTop: spacing.sm }}
          />
        ) : undefined
      }
    />
  );
}
