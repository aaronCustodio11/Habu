import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FloatingNavBar,
  type FloatingNavItem,
} from '@/components/navigation/FloatingNavBar';

/** Route name → glyph, kept in sync with the Tabs.Screen names in `(app)/_layout`. */
const ICONS: Record<string, FloatingNavItem['icon']> = {
  'home/index': 'home-variant',
  boards: 'view-grid',
  settings: 'cog-outline',
};

/**
 * Adapter between React Navigation's tab state and the universal
 * `FloatingNavBar` pill. Handles floating placement above the home indicator,
 * safe-area padding, and the separated Add action (→ create board). Passed to
 * `<Tabs tabBar={...}>` so navigation and active-state are still React
 * Navigation's — nothing is reinvented here.
 */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const items: FloatingNavItem[] = state.routes.map((route) => {
    const descriptor = descriptors[route.key];
    return {
      key: route.key,
      label: descriptor?.options.title ?? route.name,
      icon: ICONS[route.name] ?? 'circle-outline',
    };
  });

  const handleSelect = (key: string) => {
    const route = state.routes.find((r) => r.key === key);
    if (route) navigation.navigate(route.name);
  };

  const activeKey = state.routes[state.index]?.key;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: insets.bottom + 10,
        backgroundColor: 'transparent',
      }}
    >
      <FloatingNavBar
        items={items}
        activeKey={activeKey}
        onSelect={handleSelect}
        onAdd={() => router.push('/boards/create')}
      />
    </View>
  );
}
