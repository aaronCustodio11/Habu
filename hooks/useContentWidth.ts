import { useMemo } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';

const CONTENT_CAP = 640;
const LARGE_SCREEN = 700;

/**
 * Responsive content column (design doc §3). On narrow screens content fills
 * the width; on large screens (tablets, landscape) it caps at `CONTENT_CAP`
 * and centers so cards don't stretch edge-to-edge. Apply `contentStyle` to
 * each scroll child — FlatList header/items/footer, or the single child of a
 * ScrollView's content container.
 */
export function useContentWidth(): { capped: boolean; contentStyle: ViewStyle } {
  const { width } = useWindowDimensions();
  return useMemo(
    () => ({
      capped: width > LARGE_SCREEN,
      contentStyle: {
        width: '100%',
        maxWidth: width > LARGE_SCREEN ? CONTENT_CAP : undefined,
        alignSelf: 'center',
      },
    }),
    [width],
  );
}
