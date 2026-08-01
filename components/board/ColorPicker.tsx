import { Pressable, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BOARD_COLORS } from '@/constants/BoardColors';
import { radius, spacing } from '@/constants/Colors';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

/** Grid of board-color swatches (grayscale chrome, full color in the swatches). */
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {BOARD_COLORS.map((color) => {
        const selected = color === value;
        return (
          <Pressable
            key={color}
            accessibilityRole="button"
            accessibilityLabel={`Color ${color}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(color)}
            style={({ pressed }) => [
              {
                width: 40,
                height: 40,
                borderRadius: radius.full,
                backgroundColor: color,
                borderWidth: selected ? 3 : 1,
                borderColor: selected ? colors.textPrimary : 'transparent',
              },
              pressed && { opacity: 0.7 },
            ]}
          />
        );
      })}
    </View>
  );
}
