import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronUp from 'lucide-react-native/icons/chevron-up';
import { useTheme } from '@/hooks/useTheme';
import { LAYOUT_OPTIONS, getLayoutLabel, type BoardLayout } from '@/constants/BoardLayouts';
import { radius, spacing } from '@/constants/Colors';

export interface GridTypePickerProps {
  value: BoardLayout;
  /** The board color used for the selected option card. */
  color: string;
  onChange: (layout: BoardLayout) => void;
}

/** Converts '#RRGGBB' + alpha (0..1) into an rgba() string for tinted fills. */
function tint(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Grid type picker (design doc §4.3): a header row that reveals the three
 * visualization options (heatmap grid / pill grid / ring grid) on tap. Each
 * option is a card; the selected one is tinted + ringed in the board color.
 * The dropdown stays open after picking so the user can compare layouts before
 * collapsing it with the header chevron.
 */
export function GridTypePicker({ value, color, onChange }: GridTypePickerProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.md,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose a grid type"
        onPress={() => setExpanded((prev) => !prev)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ flex: 1, color: colors.textPrimary, fontSize: 17 }}>{getLayoutLabel(value)}</Text>
        {expanded ? <ChevronUp size={24} color={colors.textTertiary} /> : <ChevronDown size={24} color={colors.textTertiary} />}
      </Pressable>

      {expanded ? (
        <View style={{ gap: spacing.sm }}>
          {LAYOUT_OPTIONS.map((option) => {
            const selected = option.key === value;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChange(option.key)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: selected ? tint(color, 0.14) : colors.bgSurfaceRaised,
                    borderColor: selected ? color : colors.bgSurfaceRaised,
                    borderWidth: selected ? 2 : 1,
                  },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 15,
                      fontWeight: selected ? '700' : '400',
                    }}
                  >
                    {option.label}
                  </Text>
                </View>
                {selected ? <View style={[styles.selectedDot, { backgroundColor: color }]} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
});
