import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Glass } from '@/components/Glass';
import { unitPickStore } from '@/store/unitPickStore';
import { BOARD_UNITS } from '@/constants/Units';
import { radius, spacing, typography } from '@/constants/Colors';

/** Bottom-sheet unit picker — hand the picked unit back to the board form. */
export default function PickUnitModal() {
  const { colors } = useTheme();
  const { current = 'count' } = useLocalSearchParams<{ current?: string }>();

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlayScrim }}>
      <Glass
        fallbackStyle={{ backgroundColor: colors.bgSurfaceRaised }}
        style={{
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          overflow: 'hidden',
          maxHeight: '70%',
        }}
      >
        <View
          style={{
            backgroundColor: colors.bgSurfaceRaised,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={colors.textSecondary}
              onPress={() => router.back()}
              accessibilityLabel="Close"
              accessibilityRole="button"
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' }}>
                Unit
              </Text>
            </View>
          </View>

          {BOARD_UNITS.map((option) => {
            const selected = option.key === current;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  unitPickStore.getState().setPicked(option.key);
                  router.back();
                }}
                style={({ pressed }) => [
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    minHeight: 48,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: selected ? colors.bgBase : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 17 }}>{option.label}</Text>
                </View>
                {selected ? (
                  <MaterialCommunityIcons name="check" size={22} color={colors.textPrimary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Glass>
    </View>
  );
}