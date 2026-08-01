import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';
import { HeatmapGrid } from '@/components/heatmap/HeatmapGrid';
import type { Board } from '@/types/board';

export interface HeatmapWidgetProps {
  board: Board;
  dates: Set<string>;
}

/** Heatmap tile - the only widget that renders big, in the board's color. */
export function HeatmapWidget({ board, dates }: HeatmapWidgetProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.md,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Heatmap</Text>
      <HeatmapGrid color={board.color} completedDates={dates} weeks={16} />
    </View>
  );
}
