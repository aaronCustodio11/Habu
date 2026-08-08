import { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BOARD_ICONS, type BoardIconName, type BoardIconOption } from '@/constants/Icons';
import { radius, spacing } from '@/constants/Colors';

/** Caps the column layout width so the grid stays tight on tablets. */
const MAX_GRID_WIDTH = 640;
/** Screen-side padding (spacing.lg × 2) the grid sits inside. */
const SIDE_PADDING = spacing.lg * 2;
/** Size of one swatch (content + gap accounted for in column math). */
const CELL = 56;
const GAP = spacing.sm;

export interface IconPickerProps {
  value: string;
  /** The board color used for the selected swatch. */
  color: string;
  onChange: (key: string) => void;
  /** Optional pre-filtered icon set (e.g. search results). Defaults to all icons. */
  icons?: typeof BOARD_ICONS;
}

function columnsForWidth(width: number): number {
  const cell = CELL + GAP;
  if (width <= 360) return 5;
  if (width <= 480) return 6;
  if (width <= 640) return 7;
  return Math.min(8, Math.floor(MAX_GRID_WIDTH / cell));
}

/** Converts '#RRGGBB' + alpha (0..1) into an rgba() string for tinted fills. */
function tint(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface SwatchProps {
  item: BoardIconOption;
  selected: boolean;
  color: string;
  selectedTint: string;
  swatchWidth: number;
  onChange: (key: string) => void;
}

/** One icon card. Memoized so a selection change re-renders just the two affected swatches. */
const Swatch = memo(function Swatch({
  item,
  selected,
  color,
  selectedTint,
  swatchWidth,
  onChange,
}: SwatchProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected }}
      onPress={() => onChange(item.key)}
style={({ pressed }) => [
          styles.swatch,
          {
            backgroundColor: selected ? selectedTint : colors.bgSurfaceRaised,
            borderColor: selected ? color : colors.borderSubtle,
            borderWidth: selected ? 2 : 1,
            width: swatchWidth,
            height: swatchWidth,
          },
          selected && styles.swatchShadow,
          pressed && styles.pressedScale,
        ]}
    >
      <MaterialCommunityIcons
        name={item.icon as BoardIconName}
        size={Math.max(18, swatchWidth * 0.42)}
        color={selected ? color : colors.iconDefault}
      />
      {selected ? <View style={[styles.selectedDot, { backgroundColor: color }]} /> : null}
    </Pressable>
  );
});

/** Responsive grid of board-icon cards; the selected one is tinted + ringed in the board color. */
export function IconPicker({ value, color, onChange, icons = BOARD_ICONS }: IconPickerProps) {
  const { width } = useWindowDimensions();
  const columns = useMemo(() => columnsForWidth(width), [width]);
  const selectedTint = useMemo(() => tint(color, 0.14), [color]);

  // Usable grid width matches the wrapper (screen width capped + side padding).
  const availableWidth = Math.min(width, MAX_GRID_WIDTH) - SIDE_PADDING;
  const swatchWidth = (availableWidth - (columns - 1) * GAP) / columns;

  const renderItem = useCallback(
    ({ item }: { item: BoardIconOption }) => (
      <Swatch
        item={item}
        selected={item.key === value}
        color={color}
        selectedTint={selectedTint}
        swatchWidth={swatchWidth}
        onChange={onChange}
      />
    ),
    [value, color, selectedTint, swatchWidth, onChange],
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={icons}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        numColumns={columns}
        key={`cols-${columns}`}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={columns * 4}
        maxToRenderPerBatch={columns * 3}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_GRID_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  swatch: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  swatchShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  pressedScale: {
    transform: [{ scale: 0.94 }],
  },
  list: {
    gap: GAP,
    paddingBottom: spacing.xxl,
  },
});