import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

/** Solid `bg-surface` input (design doc §7.5). Focus shifts border weight, never color. */
export function TextField({ label, error, style, onFocus, onBlur, secureTextEntry, ...rest }: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(Boolean(secureTextEntry));

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{label}</Text> : null}
      <View
        style={{
          minHeight: 48,
          paddingLeft: spacing.md,
          paddingRight: spacing.sm,
          borderRadius: radius.md,
          backgroundColor: colors.bgSurface,
          borderWidth: focused ? 1.5 : 1,
          borderColor: focused ? colors.textPrimary : colors.borderSubtle,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secure}
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
              flex: 1,
              color: colors.textPrimary,
              fontSize: 17,
              minHeight: 48,
            },
            style,
          ]}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={secure ? 'Show password' : 'Hide password'}
            hitSlop={8}
            onPress={() => setSecure((prev) => !prev)}
            style={{ padding: spacing.xs }}
          >
            <MaterialCommunityIcons
              name={secure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
