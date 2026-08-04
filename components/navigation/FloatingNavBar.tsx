import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/constants/Colors';

export interface FloatingNavItem {
  key: string;
  label: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
}

export interface FloatingNavBarProps {
  items: FloatingNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** Optional "create" action. When omitted, no Add orb is rendered. */
  onAdd?: () => void;
  addLabel?: string;
  style?: ViewStyle;
}

const PILL_HEIGHT = 70;
const TAB_HEIGHT = 56;
const ADD_SIZE = 56;

/**
 * Universal floating bottom-nav (design doc §2.1). A single capsule holds the
 * tab group (Home · Boards · Settings); the Add orb floats **outside** the
 * capsule as a separate circle on the same baseline.
 *
 * Chrome only — never wrap primary content (heatmaps, lists, forms) in this.
 *
 * iOS 26+: the capsule is native Liquid Glass (`GlassView`, interactive,
 * neutral tint) unless the OS reduces transparency. Everywhere else (Android,
 * iOS <26, Reduce Transparency) it renders a solid grayscale surface with
 * elevation — no fake blur, per design doc §2.2/§2.3. The Add orb is always a
 * solid filled shape (the single loud element, design doc §7.4).
 *
 * Purely presentational; wire it up yourself (see `AppTabBar` for the tab-
 * navigator adapter).
 *
 * Note: drag-to-reorder (hold a tab and move it) is a native iOS 26 system
 * behavior and is NOT provided by `GlassView`; the component does not invent
 * it.
 */
export function FloatingNavBar({
  items,
  activeKey,
  onSelect,
  onAdd,
  addLabel = 'Add board',
  style,
}: FloatingNavBarProps) {
  const { colors, isDark } = useTheme();
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (mounted) setReduceTransparency(value);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const liquidGlass =
    Platform.OS === 'ios' &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable() &&
    !reduceTransparency;

  const floating: ViewStyle = {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  };

  // Active capsule: a raised white lens on iOS glass (system selected-tab look);
  // a tonal grayscale capsule on the flat fallback (Material-consistent).
  const activeCapsule: ViewStyle = liquidGlass
    ? {
        backgroundColor: 'rgba(255,255,255,0.92)',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }
    : {
        backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.06)',
      };
  const activeTint = liquidGlass ? '#0A0A0A' : colors.textPrimary;

  const tabs = (
    <View style={styles.group}>
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            onPress={() => onSelect(item.key)}
            style={({ pressed }) => [
              styles.tab,
              active && activeCapsule,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={23}
              color={active ? activeTint : colors.textTertiary}
            />
            <Text
              style={[styles.label, { color: active ? activeTint : colors.textTertiary }]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const pill = liquidGlass ? (
    <GlassView
      style={[styles.pill, floating, style]}
      glassEffectStyle="regular"
      colorScheme={isDark ? 'dark' : 'light'}
      isInteractive
    >
      {tabs}
    </GlassView>
  ) : (
    <View
      style={[
        styles.pill,
        floating,
        {
          backgroundColor: colors.bgSurfaceRaised,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.borderSubtle,
        },
        style,
      ]}
    >
      {tabs}
    </View>
  );

  const addOrb = onAdd ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={addLabel}
      onPress={onAdd}
      style={({ pressed }) => [
        styles.addButton,
        { backgroundColor: colors.textPrimary },
        floating,
        pressed && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons name="plus" size={26} color={colors.bgBase} />
    </Pressable>
  ) : null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {pill}
      {addOrb}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pill: {
    flex: 1,
    minWidth: 160,
    height: PILL_HEIGHT,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tab: {
    flex: 1,
    minWidth: 52,
    height: TAB_HEIGHT,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  addButton: {
    width: ADD_SIZE,
    height: ADD_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
