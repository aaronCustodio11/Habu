import { useCallback, useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleAlert from 'lucide-react-native/icons/circle-alert';

import { useTheme } from '@/hooks/useTheme';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from '@/components/board/ColorPicker';
import { AmountStepper } from '@/components/board/AmountStepper';
import { AmountPreview } from '@/components/board/AmountPreview';
import { HeatmapGrid } from '@/components/layouts/HeatmapGrid';
import { GridTypePicker } from '@/components/layouts/GridTypePicker';
import { PillGrid } from '@/components/layouts/PillGrid';
import { RingGrid } from '@/components/layouts/RingGrid';
import { BOARD_ICONS, getBoardIcon } from '@/constants/Icons';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { BOARD_UNITS, getUnitAbbr, getUnitLabel } from '@/constants/Units';
import { BOARD_LAYOUTS, type BoardLayout } from '@/constants/BoardLayouts';
import { iconPickStore } from '@/store/iconPickStore';
import { unitPickStore } from '@/store/unitPickStore';
import { radius, spacing } from '@/constants/Colors';
import type { Board, BoardDraft } from '@/types/board';

/** True when the user has OS-level "Reduce Motion" on (iOS + Android). Falls
 *  back to false on platforms that don't expose it. Lights-on once and caches,
 *  so it doesn't re-hit the native bridge on every render. */
function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduce)
      .catch(() => {});
  }, []);
  return reduce;
}

/**
 * Premium layout-switch entrance (design doc §8 Motion): the incoming grid
 * scales up fractionally while fading + rising, with a light spring settle so
 * switching visual styles feels physical rather than snapping. GPU-composited
 * transform/opacity on the native driver only, so it holds 60fps even when the
 * user flips layouts quickly. Honour Reduce Motion by collapsing to a plain
 * ease-out fade (no transform) as the design doc mandates.
 */
function LayoutPreview({ layout, children }: { layout: BoardLayout; children: ReactNode }) {
  const reduce = useReduceMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.965)).current;

  useEffect(() => {
    if (reduce) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 220,
        friction: 22,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 220,
        friction: 22,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, scale, reduce, layout]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }, { scale }],
      }}
      key={layout}
    >
      {children}
    </Animated.View>
  );
}

/** Body-visualization layouts (the two that share the large preview region). */
type BodyLayout = Extract<BoardLayout, 'ring' | 'heatmap'>;

/**
 * Body preview region (ring <-> heatmap). Keeps the previously selected grid
 * mounted as an absolutely-positioned overlay that fades out while the new grid
 * fades in beneath it, so switching between the two large visualizations
 * cross-fades cleanly for every combination. The overlay is positioned absolute
 * so it never re-flows the layout. Switching to/from the pill (a different
 * region) isn't cross-faded here — the pill's own header fade covers it.
 */
function BodyCrossfade({
  layout,
  color,
  completedDates,
  amountPerLog,
  dailyTarget,
  allowExceeding,
}: {
  layout: BoardLayout;
  color: string;
  completedDates?: Iterable<string>;
  amountPerLog: number;
  dailyTarget: number;
  allowExceeding?: boolean;
}) {
  const reduce = useReduceMotion();
  const [leaving, setLeaving] = useState<BodyLayout | null>(null);
  const leavingOpacity = useRef(new Animated.Value(0)).current;
  const prevLayout = useRef(layout);

  useEffect(() => {
    const old = prevLayout.current;
    prevLayout.current = layout;
    if (old === layout) return;
    const oldIsBody = old === 'ring' || old === 'heatmap';
    const newIsBody = layout === 'ring' || layout === 'heatmap';
    if (oldIsBody && newIsBody) {
      // ring <-> heatmap: keep the outgoing grid overlaid and fade it out.
      setLeaving(old);
      leavingOpacity.setValue(1);
      Animated.timing(leavingOpacity, {
        toValue: 0,
        duration: reduce ? 120 : 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setLeaving((cur) => (cur === old ? null : cur));
      });
    } else {
      // Transition to/from the pill: no body overlay needed.
      setLeaving(null);
    }
  }, [layout, reduce, leavingOpacity]);

  const renderGrid = (l: BodyLayout) =>
    l === 'ring' ? (
      <View style={{ alignItems: 'center' }}>
        <RingGrid
          color={color}
          gap={3}
          completedDates={completedDates}
          amountPerLog={amountPerLog}
          dailyTarget={dailyTarget}
        />
      </View>
    ) : (
      <HeatmapGrid
        color={color}
        weeks={15}
        cellSize={16}
        gap={4}
        showDayLabels
        completedDates={completedDates}
        amountPerLog={amountPerLog}
        dailyTarget={dailyTarget}
        allowExceeding={allowExceeding}
      />
    );

  if (layout !== 'ring' && layout !== 'heatmap') return null;

  return (
    <View>
      {/* Incoming grid (fresh mount per layout so its entrance fade runs). */}
      <LayoutPreview key={layout} layout={layout}>
        {renderGrid(layout)}
      </LayoutPreview>
      {/* Outgoing grid overlaid and fading out (doesn't affect layout height). */}
      {leaving ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            opacity: leavingOpacity,
          }}
        >
          {renderGrid(leaving)}
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Fixed thickness of the skeleton so it can mirror the heatmap preview shape. */
const SKELETON_CELL = 16;
const SKELETON_GAP = 4;

/**
 * Premium loading placeholder for the preview (edit mode, when a board's real
 * check-in history is still being read from storage). Renders the heatmap's
 * cell-grid silhouette in grayscale and sweeps a soft sheen across it, so the
 * block reads as "about to populate" — not as an empty preview. Native-driver
 * loop + fixed height means no re-layout and no jank; creation mode never
 * mounts it (no data to wait on), so that path stays instant.
 */
function PreviewSkeleton({ color }: { color: string }) {
  const { isDark } = useTheme();
  const sheen = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sheen, {
        toValue: 1,
        duration: 1100,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [sheen]);

  const rows = [13, 11, 12, 9];
  const base = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const tinted = `${color}22`;
  const cellW = SKELETON_CELL;

  return (
    <View
      style={{
        flexDirection: 'column',
        gap: SKELETON_GAP,
        overflow: 'hidden',
        height: rows.length * (cellW + SKELETON_GAP) - SKELETON_GAP,
      }}
    >
      {rows.map((count, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: SKELETON_GAP, paddingLeft: r * 3 }}>
          {Array.from({ length: Math.max(...rows) }).map((_, c) => {
            const fill = c < count;
            return (
              <View
                key={c}
                style={{
                  width: cellW,
                  height: cellW,
                  borderRadius: 4,
                  backgroundColor: fill ? tinted : base,
                }}
              />
            );
          })}
        </View>
      ))}
      {/* Sheen sweep across the silhouette. */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: 80,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
          transform: [
            {
              translateX: sheen.interpolate({
                inputRange: [-1, 1],
                outputRange: [-120, 400],
              }),
            },
          ],
        }}
      />
    </View>
  );
}

export interface BoardFormProps {
  initial?: Board;
  submitLabel: string;
  onSubmit: (draft: BoardDraft) => void | Promise<void>;
  /** The header's confirm button sets this to the form's submit function. */
  submitRef?: MutableRefObject<(() => void) | null>;
  /** Show the footer submit button (default true). Screens with a header
   *  confirm button (e.g. edit) pass `false`. */
  footerSubmit?: boolean;
  /** Completion dates rendered into the layout preview (edit mode shows real
   *  history; create mode omits it and previews stay empty). */
  completedDates?: Iterable<string>;
  /** True while the board's real history is still being read from storage
   *  (edit mode). When set, the preview shows a brief skeleton until data
   *  arrives; create mode leaves this unset so the preview is instant. */
  loading?: boolean;
}

const PRESET_TIMES = ['07:00', '09:00', '12:00', '18:00', '21:00'];
const MAX_NAME_LENGTH = 50;
const DEFAULT_ICON = 'fire';
const DEFAULT_COLOR = '#43A047';
const DEFAULT_REMINDER_TIME = '18:00';
const HEX_RE = /^#([0-9A-Fa-f]{6})$/;
const REMINDER_TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Shared create/edit board form (preview, name, icon, color, amounts, reminder). */
export function BoardForm({
  initial,
  submitLabel,
  onSubmit,
  submitRef,
  footerSubmit = true,
  completedDates,
  loading = false,
}: BoardFormProps) {
  const { colors } = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'fire');
  const [color, setColor] = useState(initial?.color ?? '#43A047');
  const [layout, setLayout] = useState<BoardLayout>(initial?.layout ?? 'heatmap');
  const [trackAmounts, setTrackAmounts] = useState(initial?.trackAmounts ?? false);
  const [unit, setUnit] = useState(initial?.unit ?? 'count');
  const [defaultAmount, setDefaultAmount] = useState(initial?.defaultAmount ?? 1);
  const [dailyTarget, setDailyTarget] = useState(initial?.dailyTargetAmount ?? 1);
  const [allowExceeding, setAllowExceeding] = useState(initial?.allowExceeding ?? false);
  const [reminderEnabled, setReminderEnabled] = useState(initial?.reminderEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime ?? '18:00');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Ref guard (not state) so two entry points (header Check + footer button)
  // can't both pass a fast double-tap before React re-renders → no duplicate
  // board creation / duplicate router.back().
  const submittingRef = useRef(false);

  // When exceeding is disallowed, clamp Amount Per Log to the Daily Target so
  // the persisted value and the stepper can never disagree with the rule.
  useEffect(() => {
    if (!allowExceeding && defaultAmount > dailyTarget) {
      setDefaultAmount(dailyTarget);
    }
  }, [allowExceeding, dailyTarget, defaultAmount]);

  // Pick up the icon chosen in the pick-icon modal and clear the handoff.
  useEffect(() => {
    return iconPickStore.subscribe((state) => {
      if (state.picked) {
        setIcon(state.picked);
        iconPickStore.getState().setPicked(null);
      }
    });
  }, []);

  // Pick up the unit chosen in the pick-unit screen and clear the handoff.
  useEffect(() => {
    return unitPickStore.subscribe((state) => {
      if (state.picked) {
        setUnit(state.picked);
        unitPickStore.getState().setPicked(null);
      }
    });
  }, []);

  // Errors render inline just above the submit button (with an error haptic);
  // they persist until the next submit attempt so the cause stays visible.
  const showError = useCallback((message: string) => {
    setError(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }, []);

  const submit = async () => {
    if (submittingRef.current) return;

    // Sanitize every field before it can reach the DB: trim/cap the name, drop
    // malformed picker values back to their defaults, and validate amounts.
    const cleanName = name.trim().slice(0, MAX_NAME_LENGTH);
    if (!cleanName) {
      showError('Give your board a name.');
      return;
    }
    const cleanIcon = BOARD_ICONS.some((option) => option.key === icon) ? icon : DEFAULT_ICON;
    const cleanColor = HEX_RE.test(color) ? color : DEFAULT_COLOR;
    const cleanLayout = BOARD_LAYOUTS.includes(layout) ? layout : 'heatmap';
    const cleanUnit = BOARD_UNITS.some((option) => option.key === unit) ? unit : 'count';

    if (trackAmounts) {
      if (
        !(Number.isFinite(defaultAmount) && defaultAmount > 0) ||
        !(Number.isFinite(dailyTarget) && dailyTarget > 0)
      ) {
        showError('Amounts must be positive numbers.');
        return;
      }
      if (!allowExceeding && defaultAmount > dailyTarget) {
        showError("Amount per log can't be above your Daily Target Amount.");
        return;
      }
    }

    let cleanReminderTime: string | null = null;
    if (reminderEnabled) {
      cleanReminderTime = REMINDER_TIME_RE.test(reminderTime) ? reminderTime : DEFAULT_REMINDER_TIME;
    }

    setError(null);
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit({
        name: cleanName,
        icon: cleanIcon,
        color: cleanColor,
        layout: cleanLayout,
        trackAmounts,
        unit: trackAmounts ? cleanUnit : 'count',
        useDefaultAmount: trackAmounts,
        defaultAmount: trackAmounts ? defaultAmount : null,
        dailyTargetAmount: trackAmounts ? dailyTarget : null,
        allowExceeding,
        reminderEnabled,
        reminderTime: cleanReminderTime,
      });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (submitRef) submitRef.current = submit;

  const iconGlyph = getBoardIcon(icon).icon;

  const toggleRow = (
    title: string,
    subtitle: string,
    value: boolean,
    onChange: (value: boolean) => void,
  ) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.bgSurface,
        borderRadius: radius.md,
        padding: spacing.md,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.textPrimary, fontSize: 17 }}>{title}</Text>
        <Text style={{ color: colors.textTertiary, fontSize: 13 }}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.textPrimary, false: colors.borderSubtle }}
        thumbColor={colors.bgSurfaceRaised}
      />
    </View>
  );

  return (
    <View style={{ gap: spacing.lg }}>
      {/* Live heatmap preview of the board (design doc §7.6), with the icon + name at its top-left. */}
      <View
        style={{
          backgroundColor: colors.bgSurfaceRaised,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          borderRadius: radius.lg,
          padding: spacing.md,
          gap: spacing.xs,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose an icon"
            onPress={() =>
              router.push({ pathname: '/boards/pick-icon', params: { current: icon, color } })
            }
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.bgBase,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <LucideIcon name={iconGlyph} size={22} color={color} />
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <TextField
              variant="flat"
              placeholder="Enter Board Name"
              placeholderIcon="PencilLine"
              value={name}
              onChangeText={setName}
              style={{ textAlign: 'left' }}
            />
          </View>
          {!loading && layout === 'pill' ? (
            <LayoutPreview layout={layout}>
              <PillGrid
                color={color}
                cellSize={20}
                gap={3}
                completedDates={completedDates}
                amountPerLog={defaultAmount}
                dailyTarget={dailyTarget}
                allowExceeding={allowExceeding}
              />
            </LayoutPreview>
          ) : null}
        </View>
        {loading ? (
          <View style={{ paddingBottom: spacing.xs }}>
            <PreviewSkeleton color={color} />
          </View>
        ) : (
          <BodyCrossfade
            layout={layout}
            color={color}
            completedDates={completedDates}
            amountPerLog={defaultAmount}
            dailyTarget={dailyTarget}
            allowExceeding={allowExceeding}
          />
        )}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Grid Type</Text>
        <GridTypePicker value={layout} color={color} onChange={setLayout} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Color</Text>
        <ColorPicker value={color} onChange={setColor} />
      </View>

      <View
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: radius.md,
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontSize: 17 }}>Track Amounts</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
              Record a number with each check-in, like minutes or distance.
            </Text>
          </View>
          <Switch
            value={trackAmounts}
            onValueChange={setTrackAmounts}
            trackColor={{ true: colors.textPrimary, false: colors.borderSubtle }}
            thumbColor={colors.bgSurfaceRaised}
          />
        </View>

        {trackAmounts ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose a unit"
            onPress={() => router.push({ pathname: '/boards/pick-unit', params: { current: unit } })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              padding: spacing.md,
              borderTopWidth: 1,
              borderTopColor: colors.borderSubtle,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 17 }}>Unit Type</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
                {getUnitLabel(unit)}
                {getUnitAbbr(unit) ? ` (${getUnitAbbr(unit)})` : ''}
              </Text>
            </View>
            <ChevronRight size={22} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      {trackAmounts ? (
        <>
          <AmountPreview
            color={color}
            layout={layout}
            amountPerLog={defaultAmount}
            dailyTarget={dailyTarget}
            allowExceeding={allowExceeding}
          />

          <AmountStepper
            value={allowExceeding ? defaultAmount : Math.min(defaultAmount, dailyTarget)}
            min={1}
            max={allowExceeding ? undefined : dailyTarget}
            title="Amount Per Log"
            helper="Added each time you log"
            onChange={setDefaultAmount}
          />

          <AmountStepper
            value={dailyTarget}
            min={1}
            title="Daily Target Amount"
            helper="Used to track your progress"
            onChange={setDailyTarget}
          />

          {toggleRow(
            'Allow Exceeding',
            'Let logged amounts go above the daily target.',
            allowExceeding,
            setAllowExceeding,
          )}
        </>
      ) : null}

      {toggleRow(
        'Daily reminder',
        'A nudge to keep the streak alive.',
        reminderEnabled,
        setReminderEnabled,
      )}

      {reminderEnabled ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {PRESET_TIMES.map((time) => {
            const selected = time === reminderTime;
            return (
              <View
                key={time}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.full,
                  borderWidth: 1,
                  borderColor: selected ? colors.textPrimary : colors.borderSubtle,
                  backgroundColor: selected ? colors.textPrimary : 'transparent',
                }}
              >
                <Text
                  style={{ color: selected ? colors.bgBase : colors.textSecondary, fontSize: 14 }}
                  onPress={() => setReminderTime(time)}
                >
                  {time}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {error ? (
        <View
          style={[styles.errorBox, { backgroundColor: colors.dangerSurface, borderColor: colors.danger }]}
        >
          <CircleAlert size={16} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      ) : null}

      {footerSubmit ? (
        <Button label={submitLabel} onPress={() => void submit()} disabled={submitting} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
});