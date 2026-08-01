import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { themeStore } from '@/store/themeStore';
import { radius, spacing, typography } from '@/constants/Colors';
import type { ThemePreference } from '@/store/themeStore';

const OPTIONS: { key: ThemePreference; label: string; body: string }[] = [
  { key: 'light', label: 'Light', body: 'White shell, dark ink' },
  { key: 'dark', label: 'Dark', body: 'Black shell, light ink' },
  { key: 'system', label: 'System', body: 'Follow the device setting' },
];

/** Light/Dark/System toggle (module 14). */
export default function ThemeScreen() {
  const { colors } = useTheme();
  const preference = themeStore((state) => state.preference);
  const setPreference = themeStore((state) => state.setPreference);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase, padding: spacing.lg, gap: spacing.sm }}>
      {OPTIONS.map((option) => {
        const selected = preference === option.key;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setPreference(option.key)}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                backgroundColor: colors.bgSurface,
                borderRadius: radius.md,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: selected ? colors.textPrimary : 'transparent',
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: radius.full,
                borderWidth: 2,
                borderColor: selected ? colors.textPrimary : colors.borderSubtle,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selected ? (
                <View style={{ width: 10, height: 10, borderRadius: radius.full, backgroundColor: colors.textPrimary }} />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.body, fontWeight: '600' }}>{option.label}</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 13 }}>{option.body}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
