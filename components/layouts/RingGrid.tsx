import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
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
 * Recent-weeks weekday ring strip. A pinned header of weekday letters
 * (S M T W T F S) never scrolls; beneath it, each week block is a row of
 * seven ring placeholders aligned under those letters. Blocks scroll
 * horizontally with the newest (current) week on the right, so the user
 * scrolls left to reach past weeks (up to `weeks`).
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
  const [containerWidth, setContainerWidth] = useState(0);
  // Padding around the strip so the today border is never clipped at the edge.
  const pad = 2;
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

  // Responsive by design: the ring size is derived from the actual container
  // width (not the whole screen), so exactly seven rings plus their gaps always
  // fit the space the host gives it on any device — phone, tablet, or a narrow
  // card. The size is capped at the requested value and floored so rings never
  // collapse into nothing; older weeks overflow and scroll horizontally.
  const usableWidth = containerWidth > 0 ? containerWidth : 360;
  const ringSize = Math.max(20, Math.min(size, Math.floor((usableWidth - gap * 6 - pad * 2) / 7)));
  // EDIT THICKNESS HERE: bump the 0.28 multiplier to make the ring stroke
  // thicker immediately (e.g. 0.4); it scales with ring size.
  const ringStroke = strokeWidth ?? Math.max(5, Math.round(ringSize * 0.26));

  // Page width used by the pinned header so it lines up with a week block.
  const blockWidth = 7 * ringSize + 6 * gap;
  // Visual gap between separate week blocks (larger than the inner ring gap).
  const blockGap = 22;

  // Build week blocks oldest → newest so the newest (current) block lands on
  // the right edge, where the strip starts scrolled.
  const weeksData = useMemo(() => {
    const raw = Array.from({ length: weeks }, (_, k) => {
      const anchor = fromISODate(addDays(today, -(k * 7)));
      const weekStart = addDays(toISODate(anchor), -anchor.getDay());
      return {
        key: weekStart,
        isCurrent: k === 0,
      };
    });
    return raw.reverse();
  }, [weeks, today, completedDates]);

  const radius = (ringSize - ringStroke - 4) / 2;
  const circumference = 2 * Math.PI * radius;

  const scrollRef = useRef<ScrollView>(null);
  const viewportWidthRef = useRef(0);
  const contentWidthRef = useRef(0);

  // Default view = the current (newest) week on the right; the user scrolls
  // left to reach past weeks (mirrors HeatmapGrid's scroll mechanic). The
  // offset is applied whenever both widths are known and re-applied until it
  // lands (a real race on Android and during mount).
  const scrollToLatest = () => {
    const viewportWidth = viewportWidthRef.current;
    const contentWidth = contentWidthRef.current;
    if (viewportWidth <= 0 || contentWidth <= 0) return;
    const maxOffset = Math.max(contentWidth - viewportWidth, 0);
    if (maxOffset <= 0) return;
    scrollRef.current?.scrollTo({ x: maxOffset, animated: false });
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const handleViewportLayout = (e: LayoutChangeEvent) => {
    viewportWidthRef.current = e.nativeEvent.layout.width;
    scrollToLatest();
  };

  const handleContentSizeChange = (w: number, _h: number) => {
    contentWidthRef.current = w;
    scrollToLatest();
  };

  // Post-mount fallback: re-apply the newest-week offset a few times in case
  // the layout/content callbacks fired before native committed.
  useEffect(() => {
    const timers = [0, 50, 150, 400].map((delay) => setTimeout(scrollToLatest, delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

  return (
    <View style={{ gap: 4 }} onLayout={handleLayout}>
      {/* Pinned weekday header - never scrolls with the rings. */}
      <View style={{ flexDirection: 'row', gap, paddingLeft: pad }}>
        {WEEKDAY_LETTERS.map((letter, weekday) => (
          <View key={weekday} style={{ width: ringSize, alignItems: 'center' }}>
            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{letter}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ height: ringSize + pad, flexGrow: 0 }}
        onLayout={handleViewportLayout}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={{
          flexDirection: 'row',
          gap: blockGap,
          paddingRight: pad,
          paddingTop: pad,
        }}
        snapToInterval={blockWidth + blockGap}
        snapToAlignment="start"
        decelerationRate="fast"
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
      </ScrollView>
    </View>
  );
}
