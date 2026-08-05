import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/constants/Colors';

interface CheckButtonProps {
  /** Optional accessibility label. Defaults to "Confirm". */
  label?: string;
  /** Fires on press. Also fires a success haptic for confirmation feedback. */
  onPress?: () => void;
  /** Disables the button (renders at reduced opacity). */
  disabled?: boolean;
}

/** Universal circular confirm affordance, the counterpart to `BackButton`.
 *  On iOS 26+ the button is Apple Liquid Glass (native, `isInteractive` for
 *  press feedback); on older iOS / Android / web it falls back to a solid
 *  `bg-surface` disc (design doc §2.1 — never a broken state). Facts a
 *  success haptic on confirm, so it belongs on affirmative actions (submit /
 *  save / done) — not on neutral or dismissive ones. */
export function CheckButton({ label = 'Confirm', onPress, disabled = false }: CheckButtonProps) {
  const { colors, isDark } = useTheme();
  const liquidGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  const icon = <MaterialCommunityIcons name="check" size={26} color={colors.textPrimary} />;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => {
        if (!onPress) return;
        onPress();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
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
  disabled: {
    opacity: 0.4,
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