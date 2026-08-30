import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import Check from 'lucide-react-native/icons/check';
import Plus from 'lucide-react-native/icons/plus';
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

/** How long to hold the check-in button before the custom check-in trigger. */
const HOLD_DURATION = 650;

/** Ring geometry for the hold-progress circle (matches the 48px wrapper). */
const RING_RADIUS = 21;
const RING_RADIUS_PX = 24;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * The circular check-in button on the boards list. A quick tap checks in with
 * the board's defaults; pressing and holding fills a progress ring around the
 * button and, once full, opens the custom check-in (where the note is written).
 *
 * The ring is driven by a requestAnimationFrame loop updating a plain number,
 * rendered on a regular (non-Animated) SVG circle — avoiding react-native-svg's
 * fragile Animated integration so it can't crash the screen.
 */
function HoldCheckInButton({
  label,
  color,
  checkedIn,
  disabled,
  onTap,
  onHoldComplete,
}: {
  label: string;
  color: string;
  checkedIn: boolean;
  disabled: boolean;
  onTap: () => void;
  onHoldComplete: () => void;
}) {
  const { colors } = useTheme();
  const [progress, setProgress] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const heldRef = useRef(false);

  const stopLoop = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handlePressIn = () => {
    heldRef.current = false;
    startRef.current = performance.now();
    const step = () => {
      const elapsed = performance.now() - startRef.current;
      const next = Math.min(1, elapsed / HOLD_DURATION);
      setProgress(next);
      if (next >= 1) {
        heldRef.current = true;
        onHoldComplete();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const handlePressOut = () => {
    stopLoop();
    if (!heldRef.current) {
      onTap();
    }
    setProgress(0);
  };

  const strokeOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={48} height={48} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Circle
          cx={RING_RADIUS_PX}
          cy={RING_RADIUS_PX}
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={`${RING_CIRCUMFERENCE}`}
          strokeDashoffset={strokeOffset}
          transform={`rotate(-90 ${RING_RADIUS_PX} ${RING_RADIUS_PX})`}
        />
      </Svg>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${checkedIn ? 'Undo' : 'Check in'} ${label}`}
        accessibilityHint="Tap to check in with defaults, press and hold to customize"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={8}
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: checkedIn ? color : colors.borderSubtle,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {checkedIn ? (
          <Check size={20} color="#FFFFFF" strokeWidth={3} />
        ) : (
          <Plus size={20} color={colors.textSecondary} strokeWidth={2.5} />
        )}
      </Pressable>
    </View>
  );
}

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
        weeks={5}
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={board.name}
          onPress={onPress}
          onLongPress={onLongPress}
          style={({ pressed }) => ({
            flex: 1,
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
              ellipsizeMode="clip"
              style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '700' }}
            >
              {board.name}
            </Text>
          </View>
          {isPill && !board.archived ? (
            <View style={{ alignSelf: 'center' }}>{pillStrip}</View>
          ) : null}
        </Pressable>
        {!board.archived ? (
          <View style={{ alignSelf: 'center' }}>
            <HoldCheckInButton
              label={board.name}
              color={board.color}
              checkedIn={isCheckedInToday}
              disabled={toggling}
              onTap={onToggleToday}
              onHoldComplete={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                router.push({ pathname: '/modal/check-in', params: { boardId: board.id } });
              }}
            />
          </View>
        ) : null}
      </View>
      {board.archived ? null : !isPill ? (
        <View style={{ paddingVertical: spacing.xs, justifyContent: 'center' }}>{bodyLayout}</View>
      ) : null}
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
