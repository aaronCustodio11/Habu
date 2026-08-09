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
  'home/index': 'Home',
  boards: 'LayoutGrid',
  settings: 'Settings',
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

  // Full-screen pushed routes (board creation, editing, icon/unit picking) are
  // not sheets, so the floating nav bar stays hidden while they're open — the
  // back affordance in the screen header is the way out. Read the focused tab's
  // nested stack state so this stays correct even for dynamic routes like
  // `/boards/[boardId]/edit`.
  const focusedRoute = state.routes[state.index];
  const nested = focusedRoute?.state;
  const currentRouteName = nested?.routes?.[nested.index ?? 0]?.name;
  const isFullScreenRoute =
    focusedRoute?.name === 'boards' &&
    (currentRouteName === 'create' ||
      currentRouteName === 'pick-icon' ||
      currentRouteName === 'pick-unit' ||
      currentRouteName?.endsWith('/edit'));

  if (isFullScreenRoute) return null;

  const items: FloatingNavItem[] = state.routes.map((route) => {
    const descriptor = descriptors[route.key];
    return {
      key: route.key,
      label: descriptor?.options.title ?? route.name,
      icon: ICONS[route.name] ?? 'Circle',
    };
  });

  const handleSelect = (key: string) => {
    const route = state.routes.find((r) => r.key === key);
    if (!route) return;
    // Navigate to the tab's root screen (index). Tapping a tab then always
    // lands on its first screen — React Navigation restores a tab's previous
    // stack state (e.g. a board detail or create screen left open), and
    // navigating to an already-present `index` pops the stack back to it.
    navigation.navigate(route.name, { screen: 'index' });
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
