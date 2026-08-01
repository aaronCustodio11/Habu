import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { getWidgetType, type WidgetTypeKey } from '@/constants/WidgetTypes';
import { WidgetRenderer } from '@/components/stats/WidgetRenderer';
import { spacing } from '@/constants/Colors';
import type { Board } from '@/types/board';

export interface WidgetSlotProps {
  widgetType: WidgetTypeKey;
  board: Board;
  dates: Set<string>;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
}

/** One widget tile plus its reorder/remove controls (design doc §7.7). */
export function WidgetSlot({ widgetType, board, dates, onMoveUp, onMoveDown, onRemove }: WidgetSlotProps) {
  const { colors } = useTheme();
  const meta = getWidgetType(widgetType);
  const editable = Boolean(onMoveUp || onMoveDown || onRemove);

  return (
    <View style={{ gap: spacing.sm }}>
      <WidgetRenderer widgetType={widgetType} board={board} dates={dates} />
      {editable ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          {meta ? (
            <Text style={{ color: colors.textTertiary, fontSize: 13, flex: 1 }}>{meta.label}</Text>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {onMoveUp ? (
            <MaterialCommunityIcons
              name="chevron-up"
              size={24}
              color={colors.textSecondary}
              onPress={onMoveUp}
              accessibilityLabel="Move widget up"
              accessibilityRole="button"
            />
          ) : null}
          {onMoveDown ? (
            <MaterialCommunityIcons
              name="chevron-down"
              size={24}
              color={colors.textSecondary}
              onPress={onMoveDown}
              accessibilityLabel="Move widget down"
              accessibilityRole="button"
            />
          ) : null}
          {onRemove ? (
            <MaterialCommunityIcons
              name="close"
              size={22}
              color={colors.textSecondary}
              onPress={onRemove}
              accessibilityLabel="Remove widget"
              accessibilityRole="button"
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
