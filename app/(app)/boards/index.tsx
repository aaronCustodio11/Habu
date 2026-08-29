import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useTheme } from '@/hooks/useTheme';
import { useContentWidth } from '@/hooks/useContentWidth';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/Button';
import { HeatmapGrid } from '@/components/layouts/HeatmapGrid';
import { PillGrid } from '@/components/layouts/PillGrid';
import { RingGrid } from '@/components/layouts/RingGrid';
import { getBoardIcon } from '@/constants/Icons';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { completionsRepo } from '@/lib/db/repositories/completionsRepo';
import { todayISO } from '@/lib/dates';
import { radius, spacing, typography } from '@/constants/Colors';
import type { Board } from '@/types/board';

/** One board on the list: a card shell that shows the name, renders the
 *  board's actual layout (heatmap / pill / ring) through the same layout
 *  components used everywhere, and a board-colored check-in button below the
 *  layout. The button is part of this list card only — the creation/edit flows
 *  never render it. */
function BoardLayoutRow({
  board,
  dates,
  isCheckedInToday,
  toggling,
  onPress,
  onLongPress,
  onToggleToday,
}: {
  board: Board;
  dates: Set<string>;
  isCheckedInToday: boolean;
  toggling: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onToggleToday: () => void;
}) {
  const { colors } = useTheme();
  const icon = getBoardIcon(board.icon);

  // The pill layout is the outlier: in board creation its compact current-week
  // strip (7 days) sits inline in the header row beside the icon + name rather
  // than filling a body block. We mirror that here so the list card looks like
  // the creation preview. Ring + heatmap fill the body block below the header.
  const isPill = board.layout === 'pill';

  const pillStrip = (
    <PillGrid
      color={board.color}
      completedDates={dates}
      cellSize={12}
      gap={3}
      amountPerLog={board.defaultAmount}
      dailyTarget={board.dailyTargetAmount}
      allowExceeding={board.allowExceeding}
    />
  );

  const bodyLayout =
    board.layout === 'ring' ? (
      <RingGrid
        color={board.color}
        completedDates={dates}
        weeks={1}
        amountPerLog={board.defaultAmount}
        dailyTarget={board.dailyTargetAmount}
      />
    ) : (
      <HeatmapGrid
        color={board.color}
        completedDates={dates}
        weeks={15}
        cellSize={16}
        gap={4}
        showDayLabels
        amountPerLog={board.defaultAmount}
        dailyTarget={board.dailyTargetAmount}
        allowExceeding={board.allowExceeding}
      />
    );

  const checkInButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${board.name} check in`}
      onPress={onToggleToday}
      disabled={toggling}
      style={({ pressed }) => ({
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: radius.md,
        backgroundColor: isCheckedInToday ? board.color : colors.bgSurfaceRaised,
        borderWidth: 2,
        borderColor: board.color,
        opacity: toggling ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: '700',
          color: isCheckedInToday ? '#FFFFFF' : board.color,
        }}
      >
        {toggling ? 'Saving…' : isCheckedInToday ? `Checked in ${board.unit || ''}`.trim() : 'Check in'}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={{
        backgroundColor: colors.bgSurfaceRaised,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        opacity: board.archived ? 0.65 : 1,
        padding: spacing.md,
        gap: spacing.sm,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={board.name}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.full,
            backgroundColor: colors.bgBase,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LucideIcon name={icon.icon} size={22} color={board.color} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '700' }}
          >
            {board.name}
          </Text>
        </View>
        {isPill && !board.archived ? (
          <View style={{ alignSelf: 'center' }}>{pillStrip}</View>
        ) : null}
      </Pressable>
      {board.archived ? null : isPill ? (
        checkInButton
      ) : (
        <>
          <View style={{ paddingVertical: spacing.xs, justifyContent: 'center' }}>{bodyLayout}</View>
          {checkInButton}
        </>
      )}
    </View>
  );
}

/** Full board list, one card per board showing its real layout (module 9).
 *  Active and archived boards live together — the archived state is marked on
 *  the card and hidden from the check-in affordance, no tab group. */
export default function BoardsListScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentStyle } = useContentWidth();
  const { userId } = useAuth();
  const { boards, loading, reload, toggleToday } = useBoards(userId);

  // Batch-loaded completion dates per board: a single SQL query backs every
  // card's live layout, so the list scales without an N+1 round-trip.
  const [datesByBoard, setDatesByBoard] = useState<Map<string, Set<string>>>(new Map());
  const today = todayISO();
  const [checkedToday, setCheckedToday] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  // Re-read from SQLite whenever this screen regains focus, so boards created
  // or edited on pushed screens (create/edit) show up without a remount.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // Load all completion dates for every board in one query (and derive today's
  // check-ins from the same data). Re-runs when the board set changes.
  useEffect(() => {
    if (boards.length === 0) return;
    void (async () => {
      const map = await completionsRepo.getDatesGroupedByBoards(boards.map((b) => b.id));
      setDatesByBoard(map);
      const done = new Set<string>();
      map.forEach((dates, id) => {
        if (dates.has(today)) done.add(id);
      });
      setCheckedToday(done);
    })();
  }, [boards, today]);

  const handleToggle = useCallback(
    async (boardId: string) => {
      setToggling((prev) => new Set(prev).add(boardId));
      try {
        const done = await toggleToday(boardId);
        setCheckedToday((prev) => {
          const next = new Set(prev);
          if (done) next.add(boardId);
          else next.delete(boardId);
          return next;
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } finally {
        setToggling((prev) => {
          const next = new Set(prev);
          next.delete(boardId);
          return next;
        });
      }
    },
    [toggleToday],
  );

  const header = useMemo(
    () => (
      <View style={[contentStyle, { gap: spacing.md, paddingHorizontal: spacing.lg }]}>
        <Text style={{ color: colors.textPrimary, fontSize: typography.title, fontWeight: '800' }}>
          Boards
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
          {boards.length > 0
            ? 'Each board shows its live layout. Tap Check in to mark today.'
            : 'Create a board to start tracking a habit.'}
        </Text>
      </View>
    ),
    [contentStyle, colors, boards.length],
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.bgBase, flex: 1 }}
      contentContainerStyle={{
        paddingTop: spacing.lg + insets.top,
        paddingBottom: spacing.lg + insets.bottom,
        gap: spacing.md,
      }}
      data={boards}
      keyExtractor={(board) => board.id}
      ListHeaderComponent={header}
      ListEmptyComponent={
        loading ? null : (
          <View style={[contentStyle, { paddingHorizontal: spacing.lg }]}>
            <EmptyState
              icon="Flame"
              headline="Nothing here yet"
              body="Create your first board to start tracking a habit."
              actionLabel="New Board"
              onAction={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                router.push('/boards/create');
              }}
            />
          </View>
        )
      }
      renderItem={({ item }) => (
        <View style={[contentStyle, { paddingHorizontal: spacing.lg }]}>
          <BoardLayoutRow
            board={item}
            dates={datesByBoard.get(item.id) ?? new Set()}
            isCheckedInToday={checkedToday.has(item.id)}
            toggling={toggling.has(item.id)}
            onPress={() => router.push({ pathname: '/boards/[boardId]', params: { boardId: item.id } })}
            onLongPress={() => router.push({ pathname: '/boards/[boardId]/edit', params: { boardId: item.id } })}
            onToggleToday={() => void handleToggle(item.id)}
          />
        </View>
      )}
      ListFooterComponent={
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
      }
    />
  );
}
