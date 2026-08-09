import Check from 'lucide-react-native/icons/check';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/constants/Colors';

interface CheckButtonProps {
  /** Accessibility label. Defaults to "Confirm". */
  label?: string;
  /** Disables the button (dims the check and blocks presses). */
  disabled?: boolean;
  onPress: () => void;
}

/** Circular confirm affordance for picker screens, styled to match `BackButton`.
 *  On iOS 26+ the button is Apple Liquid Glass (native, `isInteractive` for
 *  press feedback); on older iOS / Android / web it falls back to a solid
 *  `bg-surface` disc (design doc §2.1 — never a broken state). */
export function CheckButton({ label = 'Confirm', disabled = false, onPress }: CheckButtonProps) {
  const { colors, isDark } = useTheme();
  const liquidGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  // The solid (non-glass) fallback gets the "primary" treatment — a filled
  // black disc in light mode / white disc in dark mode with an inverted check —
  // so it stands out on the screen header. The Liquid Glass variant keeps a
  // regular tinted check, which reads better on the translucent material.
  const icon = (
    <Check
      size={28}
      color={disabled ? colors.textTertiary : liquidGlass ? colors.textPrimary : colors.bgBase}
      strokeWidth={2.5}
    />
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
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
        <View style={[styles.disc, { backgroundColor: disabled ? colors.borderSubtle : colors.textPrimary }]}>
          {icon}
        </View>
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
  disabled: {
    opacity: 0.5,
  },
});
