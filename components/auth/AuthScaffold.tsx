import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/Colors';

interface AuthScaffoldProps {
  children: ReactNode;
  /** Optional row pinned to the top of the screen (e.g. a back button). */
  header?: ReactNode;
}

/**
 * Keyboard-aware, vertically centered auth screen shell (design doc §10 —
 * solid bg-base, no glass). Respects notch/home-indicator safe areas on both
 * platforms so the layout never collides with system chrome.
 */
export function AuthScaffold({ children, header }: AuthScaffoldProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.bgBase }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: spacing.lg + insets.top, paddingBottom: spacing.lg + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {header ? <View style={styles.header}>{header}</View> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.sm,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
});
