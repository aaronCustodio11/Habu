import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Check from 'lucide-react-native/icons/check';
import { useTheme } from '@/hooks/useTheme';
import { getBoardIcon } from '@/constants/Icons';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { radius, spacing } from '@/constants/Colors';
import { HeatmapGrid } from '@/components/layouts/HeatmapGrid';
import type { Board } from '@/types/board';

export interface BoardCardProps {
  board: Board;
  isCheckedInToday?: boolean;
  /** When provided, a mini heatmap strip renders under the board name. */
  completedDates?: Iterable<string>;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Board row used on Home and Boards lists (design doc §7.2). */
export function BoardCard({
  board,
  isCheckedInToday = false,
  completedDates,
  onPress,
  onLongPress,
  style,
}: BoardCardProps) {
  const { colors } = useTheme();
  const icon = getBoardIcon(board.icon);
  const hasDates = completedDates && [...completedDates].length > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${board.name}${isCheckedInToday ? ', completed today' : ''}`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        {
          backgroundColor: colors.bgSurface,
          borderRadius: radius.md,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          borderWidth: 1,
          borderColor: isCheckedInToday ? colors.borderSubtle : 'transparent',
        },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          backgroundColor: board.color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LucideIcon name={icon.icon} size={22} color="#FFFFFF" />
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Text
          numberOfLines={1}
          ellipsizeMode="clip"
          style={{
            color: isCheckedInToday ? colors.textPrimary : colors.textSecondary,
            fontSize: 17,
            fontWeight: isCheckedInToday ? '600' : '400',
          }}
        >
          {board.name}
        </Text>
        {hasDates && completedDates ? (
          <HeatmapGrid
            color={board.color}
            completedDates={completedDates}
            weeks={9}
            cellSize={6}
            gap={2}
            amountPerLog={board.defaultAmount}
            dailyTarget={board.dailyTargetAmount}
            allowExceeding={board.allowExceeding}
          />
        ) : (
          <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
            {board.reminderEnabled && board.reminderTime
              ? `Reminder ${board.reminderTime}`
              : 'Daily habit'}
          </Text>
        )}
      </View>

      <View
        accessibilityLabel={`Mark ${board.name} complete for today`}
        style={{
          width: 28,
          height: 28,
          borderRadius: radius.full,
          borderWidth: 2,
          borderColor: isCheckedInToday ? colors.textPrimary : colors.borderSubtle,
          backgroundColor: isCheckedInToday ? colors.textPrimary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isCheckedInToday ? (
          <Check size={18} color={colors.bgBase} strokeWidth={3} />
        ) : null}
      </View>
    </Pressable>
  );
}
