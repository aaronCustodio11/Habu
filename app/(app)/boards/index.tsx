import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useTheme } from '@/hooks/useTheme';
import { useContentWidth } from '@/hooks/useContentWidth';
import { BoardCard } from '@/components/board/BoardCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/Button';
import { radius, spacing, typography } from '@/constants/Colors';

/** Full board list with Active/Archived tabs (module 9). */
export default function BoardsListScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentStyle } = useContentWidth();
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
      contentContainerStyle={{
        paddingTop: spacing.lg + insets.top,
        paddingBottom: spacing.lg + insets.bottom,
        gap: spacing.md,
      }}
      data={filtered}
      keyExtractor={(board) => board.id}
      ListHeaderComponent={
        <View style={[contentStyle, { gap: spacing.md, paddingHorizontal: spacing.lg }]}>
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
                  minHeight: 44,
                  justifyContent: 'center',
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
          <View style={[contentStyle, { paddingHorizontal: spacing.lg }]}>
            <EmptyState
              icon="fire"
              headline={boards.length > 0 ? 'No active boards' : 'Nothing here yet'}
              body={
                boards.length > 0
                  ? 'Everything is archived.'
                  : 'Create your first board to start tracking a habit.'
              }
              actionLabel="New Board"
              onAction={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                router.push('/boards/create');
              }}
            />
          </View>
        ) : (
          <View style={[contentStyle, { paddingHorizontal: spacing.lg }]}>
            <EmptyState icon="archive-outline" headline="No archived boards" body="Archived boards will appear here." />
          </View>
        )
      }
      renderItem={({ item }) => (
        <View style={[contentStyle, { paddingHorizontal: spacing.lg }]}>
          <BoardCard
            board={item}
            style={item.archived ? { opacity: 0.6 } : undefined}
            onPress={() => router.push({ pathname: '/boards/[boardId]', params: { boardId: item.id } })}
            onLongPress={() => router.push({ pathname: '/boards/[boardId]/edit', params: { boardId: item.id } })}
          />
        </View>
      )}
      ListFooterComponent={
        tab === 'active' ? (
          <View style={[contentStyle, { paddingHorizontal: spacing.lg }]}>
            <Button
              label="New Board"
              variant="secondary"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                router.push('/boards/create');
              }}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        ) : undefined
      }
    />
  );
}
