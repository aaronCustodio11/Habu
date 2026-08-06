import { useEffect, useMemo, useRef } from 'react';
import { ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { addDays, eachDayBetween, fromISODate, toISODate, todayISO } from '@/lib/dates';

/** Short weekday names, Sunday-first to match the grid's row order. */
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface HeatmapGridProps {
  /** The board's color - the only hue allowed in this grid. */
  color: string;
  completedDates?: Iterable<string>;
  /** Number of weeks to render, trailing at today. */
  weeks?: number;
  cellSize?: number;
  gap?: number;
  /** Draw a short day-of-week label down the left y-axis (Sunday-first). */
  showDayLabels?: boolean;
  onDayPress?: (date: string) => void;
}

/**
 * The raw SVG heatmap (design doc §7.6), used everywhere a heatmap shows up.
 *
 * Columns are weeks (Sunday-first), rows are weekdays. Empty cells use a
 * neutral gray fill so the grid reads against both light and dark surfaces;
 * completed cells fill with the board color (the only hue in the grid). The
 * current day's cell is marked with a border so the "now" position stays
 * visible even once it's completed.
 *
 * Responsive by design: the cell size is fixed, and the week columns scroll
 * horizontally inside the component. When there are few weeks the grid hugs
 * its content; as weeks accumulate it overflows and scrolls, so the heatmap
 * never squishes and never clips. The optional weekday labels stay pinned on
 * the left (they never scroll away with the data).
 */
export function HeatmapGrid({
  color,
  completedDates,
  weeks = 18,
  cellSize = 12,
  gap = 3,
  showDayLabels = false,
  onDayPress,
}: HeatmapGridProps) {
  const { colors } = useTheme();
  // Width reserved for the pinned weekday-label column.
  const labelGutter = showDayLabels ? 40 : 0;

  // Padding around the grid inside the SVG so the today-cell stroke (and any
  // other edge stroke) is never clipped at the SVG boundary.
  const pad = 2;

  const today = todayISO();
  const { days, cols } = useMemo(() => {
    const startDate = fromISODate(addDays(today, -(weeks * 7 - 1)));
    const leading = startDate.getDay();
    const rangeStart = addDays(toISODate(startDate), -leading);
    const all = eachDayBetween(rangeStart, today);
    return { days: all, cols: Math.ceil(all.length / 7) };
  }, [weeks, today]);

  const completed = useMemo(() => new Set(completedDates ?? []), [completedDates]);

  // Grid (cells only) vs full (cells + label column) widths.
  const gridWidth = cols * cellSize + (cols - 1) * gap + pad * 2;
  const height = 7 * cellSize + 6 * gap + pad * 2;

  const scrollRef = useRef<ScrollView>(null);
  const viewportWidthRef = useRef(0);
  const contentWidthRef = useRef(0);

  // Default view = the latest day (right edge); the user scrolls left to reach
  // the past. `onLayout` and `onContentSizeChange` fire at slightly different
  // times, so we apply the offset whenever both widths are known. It's
  // idempotent on purpose: the native scroll offset can be silently dropped if
  // it's set before the ScrollView commits its content size (a real race on
  // Android and during mount), so we re-apply it until it lands.
  const scrollToLatest = () => {
    const viewportWidth = viewportWidthRef.current;
    const contentWidth = contentWidthRef.current;
    if (viewportWidth <= 0 || contentWidth <= 0) return;
    const maxOffset = Math.max(contentWidth - viewportWidth, 0);
    if (maxOffset <= 0) return;
    scrollRef.current?.scrollTo({ x: maxOffset, animated: false });
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    viewportWidthRef.current = e.nativeEvent.layout.width;
    scrollToLatest();
  };

  const handleContentSizeChange = (width: number, _height: number) => {
    contentWidthRef.current = width;
    scrollToLatest();
  };

  // Post-mount fallback: once the tree has fully measured, re-apply the
  // latest-day offset a few more times in case the layout/content callbacks
  // fired before native committed. Content size is fixed per mount, so each
  // call scrolls to the same spot and is a cheap no-op after the first.
  useEffect(() => {
    const timers = [0, 50, 150, 400].map((delay) => setTimeout(scrollToLatest, delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <View style={{ flexDirection: 'row' }}>
      {showDayLabels ? (
        <View style={{ width: labelGutter, height: height }}>
          {WEEKDAY_LABELS.map((label, row) => (
            <Text
              key={label}
              numberOfLines={1}
              style={{
                position: 'absolute',
                top: pad + row * (cellSize + gap),
                height: cellSize,
                lineHeight: cellSize,
                right: 0,
                paddingRight: 8,
                fontSize: 10,
                textAlign: 'right',
                color: colors.textTertiary,
              }}
            >
              {label}
            </Text>
          ))}
        </View>
      ) : null}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height, flex: 1 }}
        contentContainerStyle={{ paddingRight: pad }}
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        snapToInterval={cellSize + gap}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        <Svg width={gridWidth} height={height}>
          {days.map((day, index) => {
            const col = Math.floor(index / 7);
            const row = index % 7;
            const isDone = completed.has(day);
            const isToday = day === today;
            return (
              <Rect
                key={day}
                x={pad + col * (cellSize + gap)}
                y={pad + row * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={isDone ? color : colors.borderSubtle}
                stroke={isToday ? color : 'none'}
                strokeWidth={isToday ? 1.5 : 0}
                onPress={onDayPress ? () => onDayPress(day) : undefined}
              />
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
}