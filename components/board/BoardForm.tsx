import { useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from '@/components/board/ColorPicker';
import { IconPicker } from '@/components/board/IconPicker';
import { radius, spacing } from '@/constants/Colors';
import type { Board, BoardDraft } from '@/types/board';

export interface BoardFormProps {
  initial?: Board;
  submitLabel: string;
  onSubmit: (draft: BoardDraft) => void | Promise<void>;
}

const PRESET_TIMES = ['07:00', '09:00', '12:00', '18:00', '21:00'];

/** Shared create/edit board form (name, icon, color, reminder). */
export function BoardForm({ initial, submitLabel, onSubmit }: BoardFormProps) {
  const { colors } = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'fire');
  const [color, setColor] = useState(initial?.color ?? '#43A047');
  const [reminderEnabled, setReminderEnabled] = useState(initial?.reminderEnabled ?? false);
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime ?? '18:00');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) {
      setError('Give your board a name.');
      return;
    }
    setError(null);
    void onSubmit({
      name: name.trim(),
      icon,
      color,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : null,
    });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Run 5k" />

      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Icon</Text>
        <IconPicker value={icon} color={color} onChange={setIcon} />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Color</Text>
        <ColorPicker value={color} onChange={setColor} />
      </View>

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
          <Text style={{ color: colors.textPrimary, fontSize: 17 }}>Daily reminder</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
            A nudge to keep the streak alive.
          </Text>
        </View>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ true: colors.textPrimary, false: colors.borderSubtle }}
          thumbColor={colors.bgSurfaceRaised}
        />
      </View>

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

      <Button label={submitLabel} onPress={submit} />
    </View>
  );
}
