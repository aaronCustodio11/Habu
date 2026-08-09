import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/constants/Colors';

interface BackButtonProps {
  /** Optional label for accessibility. Defaults to "Go back". */
  label?: string;
  /** Custom handler; defaults to `router.back()`. */
  onPress?: () => void;
}

/** Universal circular back affordance used across auth and app screens.
 *  On iOS 26+ the button is Apple Liquid Glass (native, `isInteractive` for
 *  press feedback); on older iOS / Android / web it falls back to a solid
 *  `bg-surface` disc (design doc §2.1 — never a broken state). */
export function BackButton({ label = 'Go back', onPress }: BackButtonProps) {
  const { colors, isDark } = useTheme();
  const liquidGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  const icon = <ChevronLeft size={28} color={colors.textPrimary} strokeWidth={2.5} />;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {liquidGlass ? (
        <GlassView
          style={styles.disc}
          glassEffectStyle="regular"
          isInteractive
          colorScheme={isDark ? 'dark' : 'light'}
        >
          {icon}
        </GlassView>
      ) : (
        <View style={[styles.disc, { backgroundColor: colors.bgSurface }]}>{icon}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disc: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});