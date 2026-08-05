import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';

export interface AmountStepperProps {
  value: number;
  /** Minimum allowed value. Stepping below it is clamped; input is clamped on blur. */
  min?: number;
  step?: number;
  onChange: (value: number) => void;
}

/** Compact -/+ stepper with a typeable numeric field (default-amount selector). */
export function AmountStepper({ value, min = 0, step = 1, onChange }: AmountStepperProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(String(value));

  const clamp = (n: number) => (Number.isFinite(n) && n >= min ? n : min);

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
    const disabled = dir < 0 && value <= min;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dir < 0 ? 'Decrease' : 'Increase'}
        disabled={disabled}
        onPress={() => adjust(dir * step)}
        style={({ pressed }) => ({
          width: 44,
          height: 44,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.bgBase,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        })}
      >
        <MaterialCommunityIcons name={dir < 0 ? 'minus' : 'plus'} size={22} color={colors.textPrimary} />
      </Pressable>
    );
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.bgSurface,
        borderRadius: radius.md,
        padding: spacing.sm,
      }}
    >
      {stepButton(-1)}
      <TextInput
        accessibilityLabel="Default amount"
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
  );
}