import { Tabs } from 'expo-router';
import { AppTabBar } from '@/components/navigation/AppTabBar';

/** Bottom tab bar (Home / Boards / Settings) via the universal floating pill. */
export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <Tabs.Screen name="home/index" options={{ title: 'Home' }} />
      <Tabs.Screen name="boards" options={{ title: 'Boards' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
