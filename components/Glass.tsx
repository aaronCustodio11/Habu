import { type PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

export type GlassProps = ViewProps & {
  /** Style applied only when Liquid Glass is NOT available. */
  fallbackStyle?: ViewProps['style'];
};

/**
 * Chrome-only glass surface (design doc §2.1). Renders a Liquid Glass
 * `GlassView` where supported (iOS 26+ without Reduce Transparency); anywhere
 * else it degrades to a plain `View` with `fallbackStyle` (usually a solid
 * surface). Never wrap primary content — heatmaps, lists, forms — in Glass.
 */
export function Glass({ fallbackStyle, style, children, ...rest }: PropsWithChildren<GlassProps>) {
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView style={style} {...rest}>
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[fallbackStyle, style]} {...rest}>
      {children}
    </View>
  );
}
