import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface AuthFooterProps {
  question: string;
  link: string;
  onPress: () => void;
}

/** Bottom prompt row, e.g. "New to Habu? Create account". */
export function AuthFooter({ question, link, onPress }: AuthFooterProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{question}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={link}
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Text style={[styles.text, styles.link, { color: colors.textPrimary }]}>{link}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  text: {
    fontSize: 15,
  },
  link: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
