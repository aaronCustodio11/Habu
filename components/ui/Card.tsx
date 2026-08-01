import { type PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius, spacing } from '@/constants/Colors';

export interface CardProps {
  style?: StyleProp<ViewStyle>;
}

/** Solid surface tile (design doc §7.2 — content never sits on glass). */
export function Card({ style, children }: PropsWithChildren<CardProps>) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.bgSurface,
          borderRadius: radius.md,
          padding: spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
