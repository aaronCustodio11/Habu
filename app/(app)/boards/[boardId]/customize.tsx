import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useCompletions } from '@/hooks/useCompletions';
import { useTheme } from '@/hooks/useTheme';
import { WidgetSlot } from '@/components/stats/WidgetSlot';
import { WidgetPicker } from '@/components/stats/WidgetPicker';
import { BackButton } from '@/components/ui/BackButton';
import { widgetConfigsRepo } from '@/lib/db/repositories/widgetConfigsRepo';
import { syncNow } from '@/lib/sync/syncEngine';
import { spacing, typography } from '@/constants/Colors';
import type { WidgetConfig } from '@/types/widgetConfig';
import type { WidgetTypeKey } from '@/constants/WidgetTypes';

/** Pick/arrange a board's widgets (module 8). */
export default function CustomizeWidgetsScreen() {
  const { colors } = useTheme();
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { userId } = useAuth();
  const { boards } = useBoards(userId);
  const { dates } = useCompletions(boardId ?? '', userId);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);

  const board = boards.find((b) => b.id === boardId);

  const reload = async () => {
    if (!userId || !boardId) return;
    setWidgets(await widgetConfigsRepo.getAll(userId, 'board', boardId));
  };

  useEffect(() => {
    void reload();
  }, [userId, boardId]);

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
    if (!userId || !boardId) return;
    const existing = await widgetConfigsRepo.getAll(userId, 'board', boardId);
    if (existing.some((config) => config.widgetType === widgetType)) return;
    await widgetConfigsRepo.create(userId, { scope: 'board', boardId, widgetType, position: existing.length });
    if (userId) void syncNow(userId);
    await reload();
  };

  if (!board) return null;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bgBase, flex: 1 }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <BackButton />
        <Text style={{ color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' }}>
          Customize
        </Text>
      </View>

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
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Add a widget</Text>
        <WidgetPicker existing={widgets.map((config) => config.widgetType)} onAdd={add} />
      </View>
    </ScrollView>
  );
}
