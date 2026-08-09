import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CircleAlert from 'lucide-react-native/icons/circle-alert';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';

/** How long the toast stays before fading out. */
const VISIBLE_MS = 3200;

export interface ToastProps {
  message: string | null;
  onHide: () => void;
}

/**
 * Auto-dismissing bottom toast. Fades/slides in, stays ~3.2s, then fades out
 * and calls `onHide`. Rendered in a transparent Modal so it floats above any
 * scrolling content and never intercepts touches outside itself.
 */
export function Toast({ message, onHide }: ToastProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
    timer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 16, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        setVisible(false);
        onHide();
      });
    }, VISIBLE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [message, onHide, opacity, translateY]);

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onHide}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.toast,
            {
              opacity,
              transform: [{ translateY }],
              backgroundColor: colors.dangerSurface,
              borderColor: colors.danger,
            },
          ]}
        >
          <CircleAlert size={16} color={colors.danger} />
          <Text style={[styles.text, { color: colors.danger }]}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    maxWidth: 460,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    flexShrink: 1,
  },
});
