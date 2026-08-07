import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useCompletions } from '@/hooks/useCompletions';
import { useTheme } from '@/hooks/useTheme';
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
      <View style={{ flex: 1, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textSecondary }}>Board not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bgBase, flex: 1 }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <BackButton />
        <Text style={{ color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700', flex: 1 }} numberOfLines={1}>
          {board.name}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit board"
          onPress={() => router.push({ pathname: '/boards/[boardId]/edit', params: { boardId } })}
        >
          <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Customize widgets"
          onPress={() => router.push({ pathname: '/boards/[boardId]/customize', params: { boardId } })}
        >
          <MaterialCommunityIcons name="tune-variant" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

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
        <MaterialCommunityIcons
          name={isCheckedInToday ? 'check-circle' : 'circle-outline'}
          size={22}
          color={isCheckedInToday ? colors.bgBase : colors.textSecondary}
        />
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
            <PillGrid color={board.color} completedDates={dates} days={30} />
          ) : board.layout === 'ring' ? (
            <RingGrid color={board.color} completedDates={dates} weeks={5} />
          ) : (
            <HeatmapGrid color={board.color} completedDates={dates} weeks={26} showDayLabels />
          )}
        </View>
      ) : null}

      {widgets.map((widget) => (
        <WidgetRenderer key={widget.id} widgetType={widget.widgetType} board={board} dates={dates} />
      ))}
    </ScrollView>
  );
}
