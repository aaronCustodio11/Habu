import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { LAYOUT_OPTIONS, getLayoutLabel, type BoardLayout } from '@/constants/BoardLayouts';
import { radius, spacing } from '@/constants/Colors';

export interface LayoutPickerProps {
  value: BoardLayout;
  onChange: (layout: BoardLayout) => void;
}

/**
 * Expandable layout card (design doc §4.3): a header row that reveals the three
 * visualization options (heatmap grid / pill grid / progress ring) on tap. The
 * selected option shows a filled check; the header subtitle mirrors the current
 * choice so the collapsed card stays self-describing.
 */
export function LayoutPicker({ value, onChange }: LayoutPickerProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.xs,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Layout"
        onPress={() => setExpanded((prev) => !prev)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 17 }}>{getLayoutLabel(value)}</Text>
        </View>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.textTertiary}
        />
      </Pressable>

      {expanded ? (
        <View style={{ gap: spacing.xs }}>
          {LAYOUT_OPTIONS.map((option) => {
            const selected = option.key === value;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChange(option.key)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  minHeight: 44,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.sm,
                  backgroundColor: selected ? colors.bgBase : 'transparent',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <MaterialCommunityIcons
                  name={option.icon as never}
                  size={22}
                  color={selected ? colors.textPrimary : colors.textSecondary}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: 16,
                      fontWeight: selected ? '600' : '400',
                    }}
                  >
                    {option.label}
                  </Text>
                </View>
                {selected ? (
                  <MaterialCommunityIcons name="check" size={22} color={colors.textPrimary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}