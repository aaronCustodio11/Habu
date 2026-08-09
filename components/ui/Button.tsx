import { Pressable, Text, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/constants/Colors';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

/**
 * Grayscale button set (design doc §7.4). Primary is the only "loud" chrome
 * element — black-on-white in light mode, white-on-black in dark.
 */
export function Button({ label, variant = 'primary', style, labelStyle, disabled, ...rest }: ButtonProps) {
  const { colors } = useTheme();

  const fill: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: colors.textPrimary },
    secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderSubtle },
    destructive: { backgroundColor: colors.danger },
    ghost: { backgroundColor: 'transparent' },
  };

  const labelColor: Record<Variant, string> = {
    primary: colors.bgBase,
    secondary: colors.textPrimary,
    destructive: colors.bgBase,
    ghost: colors.textSecondary,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: 20,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
        },
        fill[variant],
        style,
        pressed && { opacity: 0.7 },
      ]}
      {...rest}
    >
      <Text
        style={[
          { color: labelColor[variant], fontSize: 17, fontWeight: '600', textAlign: 'center' },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
