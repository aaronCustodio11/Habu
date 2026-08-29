import { useMemo, useState } from 'react';
import { Text, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { addDays, fromISODate, toISODate, todayISO } from '@/lib/dates';
import { coverageRatio } from '@/lib/color';

/** Single-letter weekday labels, Sunday-first (pinned header, never scrolls). */
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export interface RingGridProps {
  /** The board's color - the only hue allowed in this grid. */
  color: string;
  completedDates?: Iterable<string>;
  /**
   * Amount added per log, paired with `dailyTarget`. When both are set, a
   * completed ring's progress arc shows `min(amountPerLog / dailyTarget, 1)` at
   * the full board color (no opacity — the arc length is the progress).
   */
  amountPerLog?: number | null;
  dailyTarget?: number | null;
  /** Number of weeks to render (current week + past). */
  weeks?: number;
  size?: number;
  strokeWidth?: number;
  gap?: number;
}

/**
 * Recent-weeks weekday ring strip. A starter header of weekday letters
 * (S M T W T F S) sits above the ring blocks; beneath it, each week block is a
 * row of seven ring placeholders aligned under those letters. The blocks are
 * laid out side by side (newest/current week first) and the whole strip sizes
 * to fit its container width — it never scrolls and never clips, so a board
 * card shows exactly the weeks it asks for, aligned correctly.
 *
 * Completed days draw a progress arc at the full board color — its length is
 * `min(amountPerLog / dailyTarget, 1)` (a full circle when no amounts are
 * configured); there's no opacity fade, the arc is the progress. The rest stay
 * gray. The current week's ring for today's weekday carries a colored double
 * border so the "now" position stays visible.
 */
export function RingGrid({
  color,
  completedDates,
  amountPerLog,
  dailyTarget,
  weeks = 5,
  size = 44,
  strokeWidth,
  gap = 3,
}: RingGridProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const today = todayISO();
  const todayWeekday = fromISODate(today).getDay();

  const completed = useMemo(() => new Set(completedDates ?? []), [completedDates]);

  // Progress is shown via the arc length, always in the full board color (no
  // opacity fade). Without amount config the ratio is 1, so a completed ring
  // fills the whole circle (the pre-amount behavior).
  const ratio = useMemo(
    () => coverageRatio(amountPerLog, dailyTarget),
    [amountPerLog, dailyTarget],
  );
  const progressPct = Math.max(0, Math.min(1, ratio));

  // The strip fits its container: all `weeks` blocks (each 7 rings) sit in one
  // row without scrolling. We solve the ring size that makes the whole strip
  // fit the measured width (falling back to the screen width before layout
  // reports), capped at the requested size and floored so rings stay usable.
  const usableWidth = containerWidth > 0 ? containerWidth : screenWidth;
  const blockGap = 22;
  const available = Math.max(0, usableWidth - (weeks - 1) * blockGap - weeks * 6 * gap);
  const ringSize = Math.max(10, Math.min(size, Math.floor(available / (weeks * 7))));
  // EDIT THICKNESS HERE: bump the 0.28 multiplier to make the ring stroke
  // thicker immediately (e.g. 0.4); it scales with ring size.
  const ringStroke = strokeWidth ?? Math.max(5, Math.round(ringSize * 0.26));

  const radius = (ringSize - ringStroke - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  // Padding around the strip so the today border is never clipped at the edge.
  const pad = 2;

  const handleLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  // Build week blocks newest → oldest (current week first), the order they
  // appear left to right in the non-scrolling strip.
  const weeksData = useMemo(() => {
    const raw = Array.from({ length: weeks }, (_, k) => {
      const anchor = fromISODate(addDays(today, -(k * 7)));
      const weekStart = addDays(toISODate(anchor), -anchor.getDay());
      return {
        key: weekStart,
        isCurrent: k === 0,
      };
    });
    return raw;
  }, [weeks, today, completedDates]);

  const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

  return (
    <View style={{ gap: 4 }} onLayout={handleLayout}>
      {/* Weekday header - aligns with the ring columns below it. */}
      <View style={{ flexDirection: 'row', gap, paddingLeft: pad }}>
        {WEEKDAY_LETTERS.map((letter, weekday) => (
          <View key={weekday} style={{ width: ringSize, alignItems: 'center' }}>
            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{letter}</Text>
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: blockGap,
          paddingLeft: pad,
          paddingTop: pad,
        }}
      >
        {weeksData.map(({ key, isCurrent }) => (
          <View key={key} style={{ flexDirection: 'row', gap }}>
            {WEEKDAYS.map((weekday) => {
              const dayDate = addDays(key, weekday);
              const done = completed.has(dayDate);
              const center = ringSize / 2;
              const isTodayRing = isCurrent && weekday === todayWeekday;
              return (
                <View key={weekday} style={{ width: ringSize, alignItems: 'center' }}>
                  <Svg width={ringSize} height={ringSize}>
                    <Circle
                      cx={center}
                      cy={center}
                      r={radius + ringStroke / 2}
                      fill={colors.bgSurfaceRaised}
                    />
                    <Circle
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke={colors.borderSubtle}
                      strokeWidth={ringStroke}
                      fill="none"
                    />
                    <Circle
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke={color}
                      strokeWidth={ringStroke}
                      strokeLinecap="round"
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset={done ? circumference * (1 - progressPct) : circumference}
                      transform={`rotate(-90 ${center} ${center})`}
                      fill="none"
                    />
                    {isTodayRing ? (
                      <>
                        <Circle
                          cx={center}
                          cy={center}
                          r={radius - ringStroke / 2 - 1}
                          stroke={color}
                          strokeWidth={2}
                          fill="none"
                        />
                        <Circle
                          cx={center}
                          cy={center}
                          r={radius + ringStroke / 2 + 1}
                          stroke={color}
                          strokeWidth={2}
                          fill="none"
                        />
                      </>
                    ) : null}
                  </Svg>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}