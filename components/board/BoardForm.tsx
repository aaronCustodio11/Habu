import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from '@/components/board/ColorPicker';
import { AmountStepper } from '@/components/board/AmountStepper';
import { HeatmapGrid } from '@/components/heatmap/HeatmapGrid';
import { LayoutPicker } from '@/components/layouts/LayoutPicker';
import { PillGrid } from '@/components/layouts/PillGrid';
import { ProgressRing } from '@/components/layouts/ProgressRing';
import { getBoardIcon } from '@/constants/Icons';
import { getUnitLabel } from '@/constants/Units';
import type { BoardLayout } from '@/constants/BoardLayouts';
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
}

const PRESET_TIMES = ['07:00', '09:00', '12:00', '18:00', '21:00'];

/** Shared create/edit board form (preview, name, icon, color, amounts, reminder). */
export function BoardForm({ initial, submitLabel, onSubmit, submitRef }: BoardFormProps) {
  const { colors } = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'fire');
  const [color, setColor] = useState(initial?.color ?? '#43A047');
  const [layout, setLayout] = useState<BoardLayout>(initial?.layout ?? 'heatmap');
  const [trackAmounts, setTrackAmounts] = useState(initial?.trackAmounts ?? false);
  const [unit, setUnit] = useState(initial?.unit ?? 'count');
  const [useDefaultAmount, setUseDefaultAmount] = useState(initial?.useDefaultAmount ?? false);
  const [defaultAmount, setDefaultAmount] = useState(initial?.defaultAmount ?? 1);
  const [reminderEnabled, setReminderEnabled] = useState(initial?.reminderEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime ?? '18:00');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Ref guard (not state) so two entry points (header Check + footer button)
  // can't both pass a fast double-tap before React re-renders → no duplicate
  // board creation / duplicate router.back().
  const submittingRef = useRef(false);

  // Pick up the icon chosen in the pick-icon modal and clear the handoff.
  useEffect(() => {
    return iconPickStore.subscribe((state) => {
      if (state.picked) {
        setIcon(state.picked);
        iconPickStore.getState().setPicked(null);
      }
    });
  }, []);

  // Pick up the unit chosen in the pick-unit modal and clear the handoff.
  useEffect(() => {
    return unitPickStore.subscribe((state) => {
      if (state.picked) {
        setUnit(state.picked);
        unitPickStore.getState().setPicked(null);
      }
    });
  }, []);

  const submit = async () => {
    if (submittingRef.current) return;
    if (!name.trim()) {
      setError('Give your board a name.');
      return;
    }
    setError(null);
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        icon,
        color,
        layout,
        trackAmounts,
        unit: trackAmounts ? unit : 'count',
        useDefaultAmount: trackAmounts && useDefaultAmount,
        defaultAmount: trackAmounts && useDefaultAmount ? defaultAmount : null,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : null,
      });
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
              router.push({ pathname: '/modal/pick-icon', params: { current: icon, color } })
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
            <MaterialCommunityIcons name={iconGlyph} size={22} color={colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <TextField
              variant="flat"
              placeholder="Enter Board Name"
              placeholderIcon="pencil-outline"
              value={name}
              onChangeText={setName}
              style={{ textAlign: 'left' }}
            />
          </View>
        </View>
        {layout === 'pill' ? (
          <PillGrid color={color} days={30} />
        ) : layout === 'ring' ? (
          <View style={{ alignItems: 'center' }}>
            <ProgressRing color={color} days={30} />
          </View>
        ) : (
          <HeatmapGrid color={color} weeks={15} cellSize={16} gap={4} showDayLabels />
        )}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Layout</Text>
        <LayoutPicker value={layout} onChange={setLayout} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Color</Text>
        <ColorPicker value={color} onChange={setColor} />
      </View>

      {toggleRow(
        'Track Amounts',
        'Record a number with each check-in, like minutes or distance.',
        trackAmounts,
        setTrackAmounts,
      )}

      {trackAmounts ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose a unit"
          onPress={() => router.push({ pathname: '/modal/pick-unit', params: { current: unit } })}
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
            <Text style={{ color: colors.textPrimary, fontSize: 17 }}>Unit</Text>
            <Text style={{ color: colors.textTertiary, fontSize: 13 }}>{getUnitLabel(unit)}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textTertiary} />
        </Pressable>
      ) : null}

      {toggleRow(
        'Use Default Amount',
        'Pre-fill every check-in with a set amount.',
        useDefaultAmount,
        setUseDefaultAmount,
      )}

      {useDefaultAmount ? (
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Default amount</Text>
          <AmountStepper value={defaultAmount} min={1} onChange={setDefaultAmount} />
        </View>
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

      {error ? <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{error}</Text> : null}

      <Button label={submitLabel} onPress={() => void submit()} disabled={submitting} />
    </View>
  );
}