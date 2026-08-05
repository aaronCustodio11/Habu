import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { IconPicker } from '@/components/board/IconPicker';
import { Glass } from '@/components/Glass';
import { iconPickStore } from '@/store/iconPickStore';
import { radius, spacing, typography } from '@/constants/Colors';

/** Bottom-sheet icon picker — hand the picked icon back to the board form. */
export default function PickIconModal() {
  const { colors } = useTheme();
  const { current = 'fire', color = '#43A047' } = useLocalSearchParams<{
    current?: string;
    color?: string;
  }>();

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlayScrim }}>
      <Glass
        fallbackStyle={{ backgroundColor: colors.bgSurfaceRaised }}
        style={{
          borderTopLeftRadius: radius.lg,
          borderTopRightRadius: radius.lg,
          overflow: 'hidden',
          maxHeight: '75%',
        }}
      >
        <View
          style={{
            backgroundColor: colors.bgSurfaceRaised,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
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
                Pick an icon
              </Text>
            </View>
          </View>

          <IconPicker
            value={current}
            color={color}
            onChange={(key) => {
              iconPickStore.getState().setPicked(key);
              router.back();
            }}
          />
        </View>
      </Glass>
    </View>
  );
}