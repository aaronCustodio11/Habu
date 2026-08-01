import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

/** Solid `bg-surface` input (design doc §7.5). Focus shifts border weight, never color. */
export function TextField({ label, error, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textTertiary}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          {
            minHeight: 48,
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.bgSurface,
            borderWidth: focused ? 1.5 : 1,
            borderColor: focused ? colors.textPrimary : colors.borderSubtle,
            color: colors.textPrimary,
            fontSize: 17,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
