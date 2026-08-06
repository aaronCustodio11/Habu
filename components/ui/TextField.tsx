import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  /** 'flat' removes the border and sits on a raised surface (for in-card inputs). */
  variant?: 'default' | 'flat';
  /** Optional icon (MaterialCommunityIcons glyph) beside the input. */
  icon?: string;
  /** Where the trailing/leading icon sits relative to the text. */
  iconPosition?: 'left' | 'right';
  /** Icon rendered inline, right where the placeholder text ends (part of the placeholder). */
  placeholderIcon?: string;
}

/** Solid `bg-surface` input (design doc §7.5). Focus shifts border weight, never color. */
export function TextField({
  label,
  error,
  style,
  onFocus,
  onBlur,
  secureTextEntry,
  variant = 'default',
  icon,
  iconPosition = 'right',
  placeholderIcon,
  placeholder,
  ...rest
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(Boolean(secureTextEntry));

  const iconNode = icon ? (
    <View style={{ padding: spacing.xs }}>
      <MaterialCommunityIcons name={icon as never} size={20} color={colors.textTertiary} />
    </View>
  ) : null;

  // The placeholder icon is part of the placeholder itself, shown only while
  // the field is empty (native placeholders can't embed an icon).
  const valueEmpty = !rest.value || rest.value.length === 0;

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{label}</Text> : null}
      <View
        style={{
          minHeight: 48,
          paddingLeft: variant === 'flat' ? spacing.xs : spacing.md,
          paddingRight: spacing.sm,
          borderRadius: radius.md,
          backgroundColor: variant === 'flat' ? colors.bgSurfaceRaised : colors.bgSurface,
          borderWidth: variant === 'flat' ? 0 : focused ? 1.5 : 1,
          borderColor: variant === 'flat' ? undefined : focused ? colors.textPrimary : colors.borderSubtle,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {iconPosition === 'left' ? iconNode : null}
        {placeholderIcon && valueEmpty ? (
          <View
            style={{
              position: 'absolute',
              left: variant === 'flat' ? spacing.xs : spacing.md,
              top: 0,
              bottom: 0,
              flexDirection: 'row',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Text style={{ color: colors.textTertiary, fontSize: 17 }}>{placeholder}</Text>
            <MaterialCommunityIcons
              name={placeholderIcon as never}
              size={17}
              color={colors.textTertiary}
            />
          </View>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textTertiary}
          placeholder={placeholderIcon ? undefined : placeholder}
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
        {iconPosition === 'right' ? iconNode : null}
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
