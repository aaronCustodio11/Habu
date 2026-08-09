import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Info from 'lucide-react-native/icons/info';
import Pointer from 'lucide-react-native/icons/pointer';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';

const HOLD_MS = 1100;

interface HoldButtonProps {
  label: string;
  /** Shown below the button as the "hold to confirm" hint. */
  hint: string;
  /** Fires once the hold completes. Return false to reset the fill. */
  onComplete: () => boolean | void | Promise<boolean | void>;
  /** Disables holding (e.g. while submitting). */
  disabled?: boolean;
}

/**
 * Hold-to-confirm button. Press and keep holding; a progress fill crosses the
 * button and releases `onComplete` (with a success haptic) when full. Releasing
 * early resets the fill.
 */
export function HoldButton({ label, hint, onComplete, disabled = false }: HoldButtonProps) {
  const { colors } = useTheme();
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const reset = () => {
    animRef.current?.stop();
    animRef.current = Animated.timing(progress, {
      toValue: 0,
      duration: 160,
      useNativeDriver: false,
    });
    animRef.current.start();
  };

  const startHold = () => {
    if (disabled) return;
    animRef.current?.stop();
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (!finished) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Promise.resolve(onComplete()).then((ok) => {
        if (ok === false) reset();
      });
    });
  };

  const release = () => reset();

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={hint}
        onPressIn={startHold}
        onPressOut={release}
        disabled={disabled}
        style={[
          styles.track,
          { backgroundColor: colors.textPrimary, opacity: disabled ? 0.4 : 1 },
        ]}
      >
        <Animated.View
          style={[styles.fill, { backgroundColor: colors.bgBase, opacity: 0.14, width: fillWidth }]}
        />
        <View style={styles.labelRow}>
          <Pointer size={18} color={colors.bgBase} />
          <Text style={[styles.label, { color: colors.bgBase }]}>{label}</Text>
        </View>
      </Pressable>
      <View style={styles.hintRow}>
        <Info size={14} color={colors.textTertiary} />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  track: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  hint: {
    fontSize: 13,
  },
});
