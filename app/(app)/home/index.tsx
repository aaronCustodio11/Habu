import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useTheme } from '@/hooks/useTheme';
import { useContentWidth } from '@/hooks/useContentWidth';
import { BoardCard } from '@/components/board/BoardCard';
import { OfflineBanner } from '@/components/OfflineBanner';
import { EmptyState } from '@/components/EmptyState';
import { QuickStatsRow } from '@/components/stats/QuickStatsRow';
import { widgetConfigsRepo } from '@/lib/db/repositories/widgetConfigsRepo';
import { completionsRepo } from '@/lib/db/repositories/completionsRepo';
import { syncNow } from '@/lib/sync/syncEngine';
import { todayISO } from '@/lib/dates';
import { spacing, typography } from '@/constants/Colors';
import type { WidgetConfig } from '@/types/widgetConfig';

/** The daily-use main screen (module 4). */
export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentStyle } = useContentWidth();
  const { userId } = useAuth();
  const { boards, loading, reload, toggleToday } = useBoards(userId);
  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!userId) return;
    void widgetConfigsRepo.ensureDefaults(userId, 'home', null).then(setWidgetConfigs);
  }, [userId]);

  const activeBoards = boards.filter((board) => !board.archived);
  const referenceBoard = activeBoards[0];
  const [referenceDates, setReferenceDates] = useState<Set<string>>(new Set());
  const [todayDone, setTodayDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!referenceBoard) {
      setReferenceDates(new Set());
      return;
    }
    void completionsRepo.getDatesForBoard(referenceBoard.id).then((dates) => setReferenceDates(new Set(dates)));
  }, [referenceBoard]);

  useEffect(() => {
    const today = todayISO();
    void Promise.all(
      activeBoards.map((board) => completionsRepo.getByBoardAndDate(board.id, today)),
    ).then((rows) => {
      setTodayDone(new Set(rows.filter((row) => row !== null).map((row) => row!.boardId)));
    });
  }, [activeBoards]);

  const handleToggle = useCallback(
    async (boardId: string) => {
      const done = await toggleToday(boardId);
      setTodayDone((prev) => {
        const next = new Set(prev);
        if (done) next.add(boardId);
        else next.delete(boardId);
        return next;
      });
      if (referenceBoard?.id === boardId) {
        const dates = await completionsRepo.getDatesForBoard(boardId);
        setReferenceDates(new Set(dates));
      }
    },
    [toggleToday, referenceBoard],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (userId) await syncNow(userId);
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [userId, reload]);

  return (
    <View style={{ backgroundColor: colors.bgBase, flex: 1 }}>
      <View style={[contentStyle, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg + insets.top }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={{ color: colors.textPrimary, fontSize: typography.title, fontWeight: '800', flex: 1 }}>
            Home
          </Text>
          {widgetConfigs.length > 0 && activeBoards.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Customize home stats"
              hitSlop={8}
              onPress={() => router.push('/modal/customize-home-stats')}
              style={{ padding: spacing.xs }}
            >
              <MaterialCommunityIcons name="tune-variant" size={24} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        style={{ backgroundColor: colors.bgBase, flex: 1 }}
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: spacing.lg + insets.bottom,
          gap: spacing.md,
        }}
        data={activeBoards}
        keyExtractor={(board) => board.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} />}
        ListHeaderComponent={
          <View style={[contentStyle, { gap: spacing.md, paddingHorizontal: spacing.lg }]}>
            <OfflineBanner />

            {activeBoards.length > 0 && referenceBoard ? (
              <QuickStatsRow configs={widgetConfigs} board={referenceBoard} dates={referenceDates} />
            ) : null}

            <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
              {activeBoards.length > 0 ? 'Tap a board to check in today.' : 'Your boards'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={[contentStyle, { paddingHorizontal: spacing.lg }]}>
              <EmptyState
                icon="fire"
                headline="Nothing here yet"
                body="Create your first habit board and start your heatmap today."
                actionLabel="New Board"
                onAction={() => router.push('/boards/create')}
              />
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={[contentStyle, { paddingHorizontal: spacing.lg }]}>
            <BoardCard
              board={item}
              isCheckedInToday={todayDone.has(item.id)}
              onPress={() => void handleToggle(item.id)}
              onLongPress={() => router.push({ pathname: '/modal/check-in', params: { boardId: item.id } })}
            />
          </View>
        )}
      />
    </View>
  );
}
