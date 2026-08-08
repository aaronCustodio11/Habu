import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { onboardingStore } from '@/store/onboardingStore';
import { ensureReminderChannel } from '@/lib/notifications/permissions';
import { startAutoSync, stopAutoSync } from '@/lib/sync/syncEngine';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Root layout: gates onboarding -> login -> app based on state via
 * Stack.Protected (design doc / file structure §1). Also owns the notification
 * handler and the automatic sync watcher. The `index` route does the actual
 * redirecting, so "/" always resolves to a real screen.
 */
export default function RootLayout() {
  const { isDark } = useTheme();
  const { phase, userId } = useAuth();
  const hasCompletedOnboarding = onboardingStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    void ensureReminderChannel();
  }, []);

  useEffect(() => {
    if (userId) {
      startAutoSync();
      return stopAutoSync;
    }
  }, [userId]);

  const navTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!hasCompletedOnboarding}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={hasCompletedOnboarding && phase === 'unauthenticated'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={hasCompletedOnboarding && phase === 'authenticated'}>
          <Stack.Screen name="(app)" />
          <Stack.Screen
            name="modal/check-in"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="modal/customize-home-stats"
            options={{ presentation: 'modal', headerShown: false }}
          />
        </Stack.Protected>
        <Stack.Screen name="index" />
      </Stack>
    </ThemeProvider>
  );
}
