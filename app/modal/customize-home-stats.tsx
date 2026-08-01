import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useTheme } from '@/hooks/useTheme';
import { WidgetSlot } from '@/components/stats/WidgetSlot';
import { WidgetPicker } from '@/components/stats/WidgetPicker';
import { Glass } from '@/components/Glass';
import { widgetConfigsRepo } from '@/lib/db/repositories/widgetConfigsRepo';
import { completionsRepo } from '@/lib/db/repositories/completionsRepo';
import { syncNow } from '@/lib/sync/syncEngine';
import { radius, spacing } from '@/constants/Colors';
import type { WidgetConfig } from '@/types/widgetConfig';
import type { WidgetTypeKey } from '@/constants/WidgetTypes';

/** Edit Home's quick-stats widgets (module 8). */
export default function CustomizeHomeStatsModal() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const { boards } = useBoards(userId);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [dates, setDates] = useState<Set<string>>(new Set());

  const board = boards.find((b) => !b.archived);

  const reload = async () => {
    if (!userId) return;
    setWidgets(await widgetConfigsRepo.getAll(userId, 'home', null));
    if (board) {
      const rows = await completionsRepo.getDatesForBoard(board.id);
      setDates(new Set(rows));
    }
  };

  useEffect(() => {
    void reload();
  }, [userId, board?.id]);

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= widgets.length) return;
    const next = [...widgets];
    [next[index], next[target]] = [next[target], next[index]];
    await widgetConfigsRepo.reorder(next);
    if (userId) void syncNow(userId);
    setWidgets(next);
  };

  const remove = async (config: WidgetConfig) => {
    await widgetConfigsRepo.remove(config.id);
    if (userId) void syncNow(userId);
    await reload();
  };

  const add = async (widgetType: WidgetTypeKey) => {
    if (!userId) return;
    if (widgets.some((config) => config.widgetType === widgetType)) return;
    await widgetConfigsRepo.create(userId, { scope: 'home', boardId: null, widgetType, position: widgets.length });
    if (userId) void syncNow(userId);
    await reload();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlayScrim }}>
      <Glass
        fallbackStyle={{ backgroundColor: colors.bgSurfaceRaised }}
        style={{ borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, overflow: 'hidden', maxHeight: '85%' }}
      >
        <ScrollView
          style={{ backgroundColor: colors.bgSurfaceRaised, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} onPress={() => router.back()} accessibilityLabel="Close" accessibilityRole="button" />
            <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>Home stats</Text>
          </View>

          {!board ? (
            <Text style={{ color: colors.textTertiary, fontSize: 15 }}>
              Create a board first — home stats follow your most recent board.
            </Text>
          ) : (
            <View style={{ gap: spacing.md }}>
              {widgets.map((config, index) => (
                <WidgetSlot
                  key={config.id}
                  widgetType={config.widgetType}
                  board={board}
                  dates={dates}
                  onMoveUp={index > 0 ? () => void move(index, -1) : undefined}
                  onMoveDown={index < widgets.length - 1 ? () => void move(index, 1) : undefined}
                  onRemove={() => void remove(config)}
                />
              ))}
              <View style={{ gap: spacing.sm }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Add a widget</Text>
                <WidgetPicker existing={widgets.map((config) => config.widgetType)} onAdd={add} />
              </View>
            </View>
          )}
        </ScrollView>
      </Glass>
    </View>
  );
}
