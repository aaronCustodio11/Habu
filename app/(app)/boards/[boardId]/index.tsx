import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Circle from 'lucide-react-native/icons/circle';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import Pencil from 'lucide-react-native/icons/pencil';
import SlidersHorizontal from 'lucide-react-native/icons/sliders-horizontal';

import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useCompletions } from '@/hooks/useCompletions';
import { useTheme } from '@/hooks/useTheme';
import { useContentWidth } from '@/hooks/useContentWidth';
import { HeatmapGrid } from '@/components/layouts/HeatmapGrid';
import { PillGrid } from '@/components/layouts/PillGrid';
import { RingGrid } from '@/components/layouts/RingGrid';
import { WidgetRenderer } from '@/components/stats/WidgetRenderer';
import { BackButton } from '@/components/ui/BackButton';
import { widgetConfigsRepo } from '@/lib/db/repositories/widgetConfigsRepo';
import { spacing, typography } from '@/constants/Colors';
import type { WidgetConfig } from '@/types/widgetConfig';

/** Selected board stats: full heatmap + widget tiles (module 7). */
export default function BoardDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentStyle } = useContentWidth();
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { userId } = useAuth();
  const { boards } = useBoards(userId);
  const { dates, loading, isCheckedInToday, checkIn, undoToday } = useCompletions(boardId ?? '', userId);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);

  const board = boards.find((b) => b.id === boardId);

  useEffect(() => {
    if (!userId || !boardId) return;
    void widgetConfigsRepo.ensureDefaults(userId, 'board', boardId).then(setWidgets);
  }, [userId, boardId]);

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

  return (
    <View style={[styles.root, { backgroundColor: colors.bgBase }]}>
      <View style={[styles.column, contentStyle]}>
        <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg }}>
          <View style={styles.header}>
            <BackButton />
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1} ellipsizeMode="clip">
              {board.name}
            </Text>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit board"
                onPress={() => router.push({ pathname: '/boards/[boardId]/edit', params: { boardId } })}
                style={styles.actionButton}
              >
                <Pencil size={22} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Customize widgets"
                onPress={() => router.push({ pathname: '/boards/[boardId]/customize', params: { boardId } })}
                style={styles.actionButton}
              >
                <SlidersHorizontal size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isCheckedInToday ? 'Undo check-in for today' : `Check in ${board.name} for today`}
            onPress={() => void (isCheckedInToday ? undoToday() : checkIn())}
            style={({ pressed }) => [
              {
                minHeight: 56,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: spacing.sm,
                backgroundColor: isCheckedInToday ? colors.textPrimary : colors.bgSurface,
                borderWidth: 1,
                borderColor: isCheckedInToday ? 'transparent' : colors.borderSubtle,
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            {isCheckedInToday ? (
              <CircleCheck size={22} color={colors.bgBase} />
            ) : (
              <Circle size={22} color={colors.textSecondary} />
            )}
            <Text style={{ color: isCheckedInToday ? colors.bgBase : colors.textPrimary, fontSize: 17, fontWeight: '600' }}>
              {isCheckedInToday ? 'Checked in today' : 'Check in today'}
            </Text>
          </Pressable>

          {!loading ? (
            <View style={{ backgroundColor: colors.bgSurface, borderRadius: 16, padding: spacing.md, alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                {board.layout === 'pill' ? 'Last 30 days' : board.layout === 'ring' ? 'Last 30 days' : 'Last 26 weeks'}
              </Text>
              {board.layout === 'pill' ? (
                <PillGrid
                  color={board.color}
                  completedDates={dates}
                  days={30}
                  amountPerLog={board.defaultAmount}
                  dailyTarget={board.dailyTargetAmount}
                  allowExceeding={board.allowExceeding}
                />
              ) : board.layout === 'ring' ? (
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
                  weeks={26}
                  showDayLabels
                  amountPerLog={board.defaultAmount}
                  dailyTarget={board.dailyTargetAmount}
                  allowExceeding={board.allowExceeding}
                />
              )}
            </View>
          ) : null}

          {widgets.map((widget) => (
            <WidgetRenderer key={widget.id} widgetType={widget.widgetType} board={board} dates={dates} />
          ))}
        </ScrollView>
      </View>
    </View>
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
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
