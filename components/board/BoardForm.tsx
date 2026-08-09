import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ChevronRight from 'lucide-react-native/icons/chevron-right';

import { useTheme } from '@/hooks/useTheme';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ColorPicker } from '@/components/board/ColorPicker';
import { AmountStepper } from '@/components/board/AmountStepper';
import { AmountPreview } from '@/components/board/AmountPreview';
import { HeatmapGrid } from '@/components/layouts/HeatmapGrid';
import { LayoutPicker } from '@/components/layouts/LayoutPicker';
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

  // Errors surface as an auto-dismissing toast (with an error haptic), so a
  // mistake never leaves the form stuck in a stale inline message.
  const showError = useCallback((message: string) => {
    setError(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }, []);
  const hideError = useCallback(() => setError(null), []);

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
          {layout === 'pill' ? (
            <PillGrid
              color={color}
              cellSize={12}
              gap={3}
              completedDates={completedDates}
              amountPerLog={defaultAmount}
              dailyTarget={dailyTarget}
              allowExceeding={allowExceeding}
            />
          ) : null}
        </View>
        {layout === 'ring' ? (
          <View style={{ alignItems: 'center' }}>
            <RingGrid
              color={color}
              gap={3}
              completedDates={completedDates}
              amountPerLog={defaultAmount}
              dailyTarget={dailyTarget}
            />
          </View>
        ) : layout === 'heatmap' ? (
          <HeatmapGrid
            color={color}
            weeks={15}
            cellSize={16}
            gap={4}
            showDayLabels
            completedDates={completedDates}
            amountPerLog={defaultAmount}
            dailyTarget={dailyTarget}
            allowExceeding={allowExceeding}
          />
        ) : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Layout</Text>
        <LayoutPicker value={layout} color={color} onChange={setLayout} />
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

      {footerSubmit ? (
        <Button label={submitLabel} onPress={() => void submit()} disabled={submitting} />
      ) : null}

      <Toast message={error} onHide={hideError} />
    </View>
  );
}