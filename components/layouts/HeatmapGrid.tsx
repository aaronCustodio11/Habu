import { useMemo, useState } from 'react';
import { Text, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { addDays, eachDayBetween, fromISODate, toISODate, todayISO } from '@/lib/dates';
import { coverageRatio, intensityColor } from '@/lib/color';

/** Short weekday names, Sunday-first to match the grid's row order. */
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface HeatmapGridProps {
  /** The board's color - the only hue allowed in this grid. */
  color: string;
  completedDates?: Iterable<string>;
  /**
   * Amount added per log, paired with `dailyTarget`. When both are set, a
   * completed cell's fill uses the same scoring as the preview: opacity ramps
   * with `amountPerLog / dailyTarget` and saturates once it exceeds the target.
   */
  amountPerLog?: number | null;
  dailyTarget?: number | null;
  /**
   * When false (default), the ratio is capped at 1 — an exceeding log never
   * shows the saturated "over target" shade, mirroring the preview hiding
   * exceeded cells. When true, past-100% cells saturate at full opacity.
   */
  allowExceeding?: boolean;
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
 * completed cells fill with the board color (the only hue in the grid), with
 * opacity scored from the amount-per-log vs daily target (same as the preview),
 * saturating once a log exceeds the target. The current day's cell is marked
 * with a border so the "now" position stays visible even once it's completed.
 *
 * Responsive by design: the cell size is derived from the container width so
 * every week column (up to `weeks`) fits on screen side by side — the grid
 * never scrolls and no cell is ever clipped, whatever the width.
 */
export function HeatmapGrid({
  color,
  completedDates,
  amountPerLog,
  dailyTarget,
  allowExceeding = false,
  weeks = 18,
  cellSize = 12,
  gap = 3,
  showDayLabels = false,
  onDayPress,
}: HeatmapGridProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
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

  // Scoring shared with the preview: fill opacity = coverage of the daily
  // target by one log, saturated past 100%. Without amount config it's 1
  // (full board color for every completed cell, the pre-amount behavior).
  const ratio = useMemo(
    () => coverageRatio(amountPerLog, dailyTarget),
    [amountPerLog, dailyTarget],
  );
  // Same gate as the preview: without allowExceeding, an over-target log is
  // capped at full opacity and never gets the saturated "exceeded" shade.
  const effectiveRatio = allowExceeding ? ratio : Math.min(1, ratio);
  const fillOpacity = Math.max(0, Math.min(1, effectiveRatio));
  const doneFill = intensityColor(color, effectiveRatio);

  // Fit-to-width: solve the cell size so all `cols` columns (plus gaps and the
  // optional day-label gutter) fit the measured container width. Falls back to
  // the screen width before layout reports, caps at the requested cell size,
  // and floors so cells never collapse into nothing. No cell is ever clipped.
  const usableWidth = containerWidth > 0 ? containerWidth : screenWidth;
  const maxCell = Math.floor((usableWidth - labelGutter - gap * (cols - 1) - pad * 2) / cols);
  const effectiveCell = Math.max(6, Math.min(cellSize, maxCell));

  const gridWidth = cols * effectiveCell + (cols - 1) * gap + pad * 2;
  const height = 7 * effectiveCell + 6 * gap + pad * 2;

  const handleLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  return (
    <View style={{ flexDirection: 'row', position: 'relative' }} onLayout={handleLayout}>
      {showDayLabels ? (
        <View style={{ width: labelGutter, height }}>
          {WEEKDAY_LABELS.map((label, row) => (
            <Text
              key={label}
              numberOfLines={1}
              style={{
                position: 'absolute',
                top: pad + row * (effectiveCell + gap),
                height: effectiveCell,
                lineHeight: effectiveCell,
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

      <Svg width={gridWidth} height={height}>
        {days.map((day, index) => {
          const col = Math.floor(index / 7);
          const row = index % 7;
          const isDone = completed.has(day);
          const isToday = day === today;
          return (
            <Rect
              key={day}
              x={pad + col * (effectiveCell + gap)}
              y={pad + row * (effectiveCell + gap)}
              width={effectiveCell}
              height={effectiveCell}
              rx={2}
              fill={isDone ? doneFill : colors.borderSubtle}
              fillOpacity={isDone ? fillOpacity : 1}
              stroke={isToday ? color : 'none'}
              strokeWidth={isToday ? 1.5 : 0}
              onPress={onDayPress ? () => onDayPress(day) : undefined}
            />
          );
        })}
      </Svg>
    </View>
  );
}