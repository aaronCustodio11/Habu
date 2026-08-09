import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Minus from 'lucide-react-native/icons/minus';
import Plus from 'lucide-react-native/icons/plus';

import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';

export interface AmountStepperProps {
  value: number;
  /** Minimum allowed value. Stepping below it is clamped; input is clamped on blur. */
  min?: number;
  /** Maximum allowed value (e.g. a daily cap). When set, the +/input can't go above it. */
  max?: number;
  step?: number;
  /** Optional label rendered inside the card above the stepper. */
  title?: string;
  /** Optional helper text rendered under the label. */
  helper?: string;
  onChange: (value: number) => void;
}

/** Compact -/+ stepper with a typeable numeric field (default-amount selector). */
export function AmountStepper({
  value,
  min = 0,
  max,
  step = 1,
  title,
  helper,
  onChange,
}: AmountStepperProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(String(value));

  const clamp = (n: number) => {
    let next = Number.isFinite(n) ? n : min;
    if (next < min) next = min;
    if (max !== undefined && next > max) next = max;
    return next;
  };

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const n = parseFloat(raw.replace(',', '.'));
    const next = clamp(n);
    onChange(next);
    setDraft(String(next));
  };

  const adjust = (delta: number) => {
    const next = clamp(Math.round((value + delta) * 100) / 100);
    onChange(next);
    setDraft(String(next));
  };

  const stepButton = (dir: -1 | 1) => {
    const disabled =
      (dir < 0 && value <= min) || (dir > 0 && max !== undefined && value >= max);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dir < 0 ? 'Decrease' : 'Increase'}
        disabled={disabled}
        onPress={() => adjust(dir * step)}
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bgBase,
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {dir < 0 ? <Minus size={22} color={colors.textPrimary} /> : <Plus size={22} color={colors.textPrimary} />}
      </Pressable>
    );
  };

  return (
    <View
      style={{
        gap: spacing.sm,
        backgroundColor: colors.bgSurface,
        borderRadius: radius.md,
        padding: spacing.md,
      }}
    >
      {title ? (
        <Text style={{ color: colors.textPrimary, fontSize: 17 }}>{title}</Text>
      ) : null}
      {helper ? (
        <Text style={{ color: colors.textTertiary, fontSize: 13 }}>{helper}</Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {stepButton(-1)}
        <TextInput
          accessibilityLabel="Amount"
          value={draft}
          onChangeText={setDraft}
          onBlur={() => commit(draft)}
          onSubmitEditing={() => commit(draft)}
          keyboardType="decimal-pad"
          selectTextOnFocus
          style={{
            flex: 1,
            minHeight: 44,
            textAlign: 'center',
            color: colors.textPrimary,
            fontSize: 17,
            fontWeight: '600',
          }}
        />
        {stepButton(1)}
      </View>
    </View>
  );
}