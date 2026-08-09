import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Check from 'lucide-react-native/icons/check';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/Colors';

interface AuthProgressProps {
  steps: readonly string[];
  current: number;
}

const NODE_SIZE = 24;

/**
 * Grayscale step indicator (design doc §7.5 spirit): numbered nodes that fill
 * with a check when done, a thin track that completes ahead of the active step,
 * and a gentle scale pop on the active node.
 */
export function AuthProgress({ steps, current }: AuthProgressProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    scale.setValue(0.6);
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [current, scale]);

  return (
    <View style={styles.wrap}>
      <View style={styles.container}>
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <View key={label} style={styles.column}>
              <View style={styles.rail}>
                {i > 0 ? (
                  <View
                    style={[
                      styles.line,
                      { backgroundColor: i <= current ? colors.textPrimary : colors.borderSubtle },
                    ]}
                  />
                ) : (
                  <View style={styles.lineSpacer} />
                )}
                <Animated.View
                  style={[
                    styles.node,
                    {
                      borderColor: done || active ? colors.textPrimary : colors.borderSubtle,
                      backgroundColor: done ? colors.textPrimary : 'transparent',
                      transform: [{ scale: active ? scale : 1 }],
                    },
                  ]}
                >
                  {done ? (
                    <Check size={14} color={colors.bgBase} strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.nodeNumber,
                        { color: active ? colors.textPrimary : colors.textTertiary },
                      ]}
                    >
                      {i + 1}
                    </Text>
                  )}
                </Animated.View>
                {i < steps.length - 1 ? (
                  <View
                    style={[
                      styles.line,
                      { backgroundColor: i < current ? colors.textPrimary : colors.borderSubtle },
                    ]}
                  />
                ) : (
                  <View style={styles.lineSpacer} />
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: done || active ? colors.textPrimary : colors.textTertiary },
                  active && styles.labelActive,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  container: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  rail: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 2,
  },
  lineSpacer: {
    flex: 1,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    marginTop: spacing.sm,
    fontSize: 12,
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: '600',
  },
});
