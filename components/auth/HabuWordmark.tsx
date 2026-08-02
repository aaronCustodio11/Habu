import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface HabuWordmarkProps {
  size?: number;
}

/**
 * Habu brand mark — a 2×2 habit-heatmap grid at stepped intensity plus the
 * wordmark. The heatmap is the product's core motif, so the identity mark is
 * seeded from the content itself (design direction 1 · Quiet Field).
 */
export function HabuWordmark({ size = 28 }: HabuWordmarkProps) {
  const { colors } = useTheme();
  const s = size * 0.62;
  const radius = s * 0.33;
  const cell = {
    width: s,
    height: s,
    borderRadius: radius,
  };

  return (
    <View style={[styles.row, { gap: size * 0.36, alignSelf: 'center' }]}>
      <View style={{ gap: 3 }}>
        <View style={[styles.row, { gap: 3 }]}>
          <View style={[cell, { backgroundColor: colors.textPrimary }]} />
          <View style={[cell, { backgroundColor: colors.textPrimary, opacity: 0.55 }]} />
        </View>
        <View style={[styles.row, { gap: 3 }]}>
          <View style={[cell, { backgroundColor: colors.textPrimary, opacity: 0.28 }]} />
          <View style={[cell, { borderWidth: 2, borderColor: colors.textPrimary, opacity: 0.85 }]} />
        </View>
      </View>
      <Text style={{ fontSize: size, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 }}>
        Habu
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
