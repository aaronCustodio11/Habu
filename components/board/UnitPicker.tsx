import { memo, useCallback, useMemo } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
  type SectionListData,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import {
  BOARD_UNITS,
  UNIT_CATEGORIES,
  type UnitOption,
} from '@/constants/Units';
import { radius, spacing } from '@/constants/Colors';

interface UnitSection {
  title: string;
  data: UnitOption[];
}

/** Groups a filtered unit set into category sections in display order. */
function groupByCategory(units: UnitOption[]): UnitSection[] {
  return UNIT_CATEGORIES.map((category) => ({
    title: category.label,
    data: units.filter((unit) => unit.category === category.key),
  })).filter((section) => section.data.length > 0);
}

export interface UnitPickerProps {
  value: string;
  onChange: (key: string) => void;
  /** Optional pre-filtered unit set (e.g. search results). Defaults to all units. */
  options?: UnitOption[];
}

interface UnitRowProps {
  item: UnitOption;
  selected: boolean;
  onChange: (key: string) => void;
}

/** One unit card. Memoized so a selection change re-renders just the two affected rows. */
const UnitRow = memo(function UnitRow({ item, selected, onChange }: UnitRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected }}
      onPress={() => onChange(item.key)}
      style={({ pressed }) => [
styles.row,
          {
            backgroundColor: selected ? colors.bgBase : colors.bgSurfaceRaised,
            borderColor: selected ? colors.textPrimary : colors.borderSubtle,
            borderWidth: selected ? 2 : 1,
          },
          selected && styles.rowSelected,
          pressed && styles.pressedScale,
        ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: selected ? colors.textPrimary : colors.iconDefault,
            fontSize: 16,
            fontWeight: selected ? '700' : '400',
          }}
        >
          {item.label}
        </Text>
      </View>
      {item.abbr ? (
        <Text
          style={{
            color: selected ? colors.textPrimary : colors.textSecondary,
            fontSize: 14,
            fontWeight: '500',
          }}
        >
          {item.abbr}
        </Text>
      ) : null}
    </Pressable>
  );
});

/**
 * Categorized unit list, capped and centered on wide screens. The selected
 * option is highlighted with a fill (no check mark); picking commits nothing —
 * the confirm button in the screen header does.
 */
export function UnitPicker({ value, onChange, options = BOARD_UNITS }: UnitPickerProps) {
  const { colors } = useTheme();

  const sections = useMemo(() => groupByCategory(options), [options]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionListData<UnitOption, UnitSection> }) => (
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
    ),
    [colors.textSecondary],
  );

  const renderItem = useCallback(
    ({ item }: { item: UnitOption }) => (
      <UnitRow item={item} selected={item.key === value} onChange={onChange} />
    ),
    [value, onChange],
  );

  return (
    <View style={styles.wrapper}>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  rowSelected: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pressedScale: {
    transform: [{ scale: 0.98 }],
  },
});