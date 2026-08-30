import { useMemo, useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { addDays, fromISODate, todayISO } from '@/lib/dates';
import { coverageRatio, intensityColor, withAlpha } from '@/lib/color';

/** Single-letter weekday labels, Sunday-first to match the grid columns. */
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export interface PillGridProps {
  /** The board's color - the only hue allowed in this grid. */
  color: string;
  completedDates?: Iterable<string>;
  /**
   * Amount added per log, paired with `dailyTarget`. When both are set, a
   * completed pill's fill uses the same scoring as the preview: opacity ramps
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
  /** Number of recent days to render, trailing at today (clamped to the current week). */
  days?: number;
  cellSize?: number;
  gap?: number;
}

/**
 * Current-week weekday strip: one single row of thick rounded "line" cells,
 * one per weekday (Sunday-first) with a single-letter day-of-week label on the
 * x-axis above. Completed days fill with the board color (opacity scored from
 * the amount-per-log vs daily target, same as the preview), the rest stay
 * gray; days that haven't happened yet this week stay empty. Today keeps an
 * outline so the "now" position stays visible even once completed.
 */
export function PillGrid({
  color,
  completedDates,
  amountPerLog,
  dailyTarget,
  allowExceeding = false,
  cellSize = 12,
  gap = 1,
}: PillGridProps) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const today = todayISO();

  const completed = useMemo(() => new Set(completedDates ?? []), [completedDates]);

  // Scoring shared with the preview: fill opacity = coverage of the daily
  // target by one log, saturated past 100%. Without amount config it's 1
  // (full board color for every completed pill, the pre-amount behavior).
  const ratio = useMemo(
    () => coverageRatio(amountPerLog, dailyTarget),
    [amountPerLog, dailyTarget],
  );
  // Same gate as the preview: without allowExceeding, an over-target log is
  // capped at full opacity and never gets the saturated "exceeded" shade.
  const effectiveRatio = allowExceeding ? ratio : Math.min(1, ratio);

  // Responsive by design: exactly seven day-columns (the current week) plus
  // their gaps always fit the container width on any device — the columns keep
  // a tight width so the strip stays compact on phone, tablet, or narrow card.
  const usableWidth = containerWidth > 0 ? containerWidth : 360;
  const effectiveCell = Math.max(12, Math.min(cellSize, Math.floor((usableWidth - gap * 6) / 7)));
  // A narrow rounded bar: thinner than its column so pills stay slim, but tall
  // enough to read as a full-height "line". Only the explicit `gap` separates
  // neighbours; the slim width is the whole point of the pill look.
  const pillWidth = Math.max(6, Math.min(9, Math.round(effectiveCell * 0.6)));
  const pillHeight = Math.max(16, Math.round(effectiveCell * 3.0));
  // Completed pills always read as filled: partial completions keep the color
  // ramping toward the target but never drop below a visible opacity, so a done
  // cell is never mistaken for an empty one.
  const doneFill = withAlpha(
    intensityColor(color, effectiveRatio),
    Math.max(0.45, Math.min(1, effectiveRatio)),
  );

  const handleLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  // The current week, Sunday-first (relative to today's device-local day).
  const week = useMemo(() => {
    const weekStart = addDays(today, -fromISODate(today).getDay());
    return Array.from({ length: 7 }, (_, col) => addDays(weekStart, col));
  }, [today]);

  return (
    <View style={{ alignItems: 'center', gap: 4 }} onLayout={handleLayout}>
      <View style={{ flexDirection: 'row', gap }} accessibilityRole="none">
        {WEEKDAY_LETTERS.map((label, col) => (
          <View key={col} style={{ width: effectiveCell, alignItems: 'center' }}>
            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap }}>
        {week.map((date, col) => {
          const done = completed.has(date);
          const isToday = date === today;
          return (
            <View key={col} style={{ width: effectiveCell, alignItems: 'center' }}>
              <View
                style={{
                  width: pillWidth,
                  height: pillHeight,
                  borderRadius: pillWidth / 2,
                  backgroundColor: done ? doneFill : colors.borderSubtle,
                  borderWidth: isToday ? 2 : 0,
                  borderColor: isToday ? color : 'transparent',
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}