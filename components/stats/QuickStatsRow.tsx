import { ScrollView, View } from 'react-native';
import { WidgetRenderer } from '@/components/stats/WidgetRenderer';
import type { WidgetConfig } from '@/types/widgetConfig';
import type { Board } from '@/types/board';

export interface QuickStatsRowProps {
  configs: WidgetConfig[];
  board: Board;
  dates: Set<string>;
}

/** Home's widget row - 2-3 tiles in a horizontal strip. */
export function QuickStatsRow({ configs, board, dates }: QuickStatsRowProps) {
  if (configs.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
      {configs.map((config) => (
        <View key={config.id} style={{ width: 180 }}>
          <WidgetRenderer widgetType={config.widgetType} board={board} dates={dates} />
        </View>
      ))}
    </ScrollView>
  );
}
