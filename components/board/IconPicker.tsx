import { Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BOARD_ICONS, type BoardIconName } from '@/constants/Icons';
import { radius, spacing } from '@/constants/Colors';

export interface IconPickerProps {
  value: string;
  /** The board color used for the selected swatch. */
  color: string;
  onChange: (key: string) => void;
}

/** Grid of board-icon swatches; the selected one renders in the board color. */
export function IconPicker({ value, color, onChange }: IconPickerProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {BOARD_ICONS.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.key)}
            style={({ pressed }) => [
              {
                width: 48,
                height: 48,
                borderRadius: radius.sm,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.bgBase,
                borderWidth: 1,
                borderColor: selected ? color : colors.borderSubtle,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <MaterialCommunityIcons
              name={option.icon as BoardIconName}
              size={24}
              color={selected ? color : colors.textSecondary}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
