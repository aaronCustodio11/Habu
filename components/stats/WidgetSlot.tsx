import { Pressable, View, Text } from 'react-native';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronUp from 'lucide-react-native/icons/chevron-up';
import X from 'lucide-react-native/icons/x';
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Move widget up"
              onPress={onMoveUp}
              hitSlop={8}
            >
              <ChevronUp size={24} color={colors.textSecondary} />
            </Pressable>
          ) : null}
          {onMoveDown ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Move widget down"
              onPress={onMoveDown}
              hitSlop={8}
            >
              <ChevronDown size={24} color={colors.textSecondary} />
            </Pressable>
          ) : null}
          {onRemove ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove widget"
              onPress={onRemove}
              hitSlop={8}
            >
              <X size={22} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
