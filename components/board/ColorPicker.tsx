import { Pressable, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BOARD_COLORS } from '@/constants/BoardColors';
import { radius, spacing } from '@/constants/Colors';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const SWATCH_SIZE = 40;
const RING = 3;
/** Selected halos add SWATCH_SIZE + 2*RING of layout each; the ring stays inside the tap cell. */
const HIT_SIZE = SWATCH_SIZE + 2 * RING;
/** 7 columns -> 13 board colors + 1 mono swatch land in two full rows. */
const COLUMNS = 7;

/**
 * Board-color picker (design doc §4.3): a card of 14 curated swatches plus a
 * theme-aware black/white swatch, laid out in two fixed rows (no scroll). The
 * selection ring inverts on the mono swatch so it stays visible on both shells:
 * white swatch -> black ring, black swatch -> white ring.
 */
export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const { colors, isDark } = useTheme();

  // One swatch that tracks the shell: black in light mode, white in dark mode.
  const monoColor = isDark ? '#FFFFFF' : '#000000';
  const isMonoSelected = value.toUpperCase() === monoColor;
  const monoRing = isDark ? '#000000' : '#FFFFFF';
  const ringColor = isMonoSelected ? monoRing : colors.textPrimary;

  const allColors = [...BOARD_COLORS, monoColor];

  return (
    <View
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radius.md,
        padding: spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {allColors.map((color, index) => {
          const isMono = color === monoColor;
          const selected = color === value;
          return (
            <Pressable
              key={`${color}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={isMono ? (isDark ? 'White' : 'Black') : `Color ${color}`}
              accessibilityState={{ selected }}
              onPress={() => onChange(color)}
              style={{
                width: `${100 / COLUMNS}%`,
                alignItems: 'center',
                paddingVertical: spacing.xs,
              }}
            >
              <View
                style={{
                  width: HIT_SIZE,
                  height: HIT_SIZE,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected ? (
                  <View
                    style={{
                      position: 'absolute',
                      width: HIT_SIZE,
                      height: HIT_SIZE,
                      borderRadius: radius.full,
                      borderWidth: RING,
                      borderColor: ringColor,
                    }}
                  />
                ) : null}
                <View
                  style={{
                    width: SWATCH_SIZE,
                    height: SWATCH_SIZE,
                    borderRadius: radius.full,
                    backgroundColor: color,
                  }}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
