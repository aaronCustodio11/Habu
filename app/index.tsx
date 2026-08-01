import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { onboardingStore } from '@/store/onboardingStore';

/**
 * The root "/" route. Decides where to go (onboarding -> login -> home) based
 * on persisted state, and shows a splash while auth is still loading. Without
 * this, "/" had nothing to render and fell through to +not-found.
 */
export default function IndexScreen() {
  const { colors } = useTheme();
  const { phase } = useAuth();
  const hasCompletedOnboarding = onboardingStore((state) => state.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  if (phase === 'unauthenticated') {
    return <Redirect href="/login" />;
  }
  if (phase === 'authenticated') {
    return <Redirect href="/home" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <ActivityIndicator color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
