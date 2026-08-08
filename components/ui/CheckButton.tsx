import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  const icon = (
    <MaterialCommunityIcons
      name="check"
      size={28}
      color={disabled ? colors.textTertiary : colors.textPrimary}
    />
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={onPress}
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
        <View style={[styles.disc, { backgroundColor: colors.bgSurface }]}>
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
