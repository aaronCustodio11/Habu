import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { WIDGET_TYPES, type WidgetTypeKey } from '@/constants/WidgetTypes';
import { radius, spacing } from '@/constants/Colors';

export interface WidgetPickerProps {
  /** Widgets already placed - those are shown but disabled. */
  existing: WidgetTypeKey[];
  onAdd: (widgetType: WidgetTypeKey) => void;
}

/** "Add a widget" grid (grayscale tiles + icon per widget type). */
export function WidgetPicker({ existing, onAdd }: WidgetPickerProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {WIDGET_TYPES.map((type) => {
        const isAdded = existing.includes(type.key);
        return (
          <Pressable
            key={type.key}
            disabled={isAdded}
            accessibilityRole="button"
            accessibilityLabel={`Add ${type.label} widget`}
            accessibilityState={{ disabled: isAdded }}
            onPress={() => onAdd(type.key)}
            style={({ pressed }) => [
              {
                width: 96,
                padding: spacing.md,
                borderRadius: radius.md,
                backgroundColor: isAdded ? colors.bgSurface : colors.bgBase,
                borderWidth: 1,
                borderColor: isAdded ? colors.borderSubtle : colors.borderSubtle,
                gap: spacing.sm,
                alignItems: 'center',
                opacity: isAdded ? 0.5 : 1,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <LucideIcon name={type.icon} size={28} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
              {type.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
