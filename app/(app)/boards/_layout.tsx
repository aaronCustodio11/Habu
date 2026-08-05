import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

/** Nested stack inside the Boards tab (list, create, per-board screens). */
export default function BoardsLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgBase },
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          // True native bottom sheet (iOS 26 → native UISheetPresentationController
          // sheet; Android → Material bottom-sheet behavior). No JS animation —
          // the OS drives slide + drag, so it stays 60fps on every device.
          // NOTE: Expo Go on SDK 54 cannot render this natively (its bundled
          // react-native-screens ignores the sheet); it shows correctly in
          // development/standalone builds.
          presentation: 'formSheet',
          animation: 'slide_from_bottom',
          sheetAllowedDetents: [0.55, 0.92],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetExpandsWhenScrolledToEdge: false,
          sheetCornerRadius: 28,
          // Prevent the SDK 54 / RN 0.81 zero-size formSheet content bug (#2522).
          contentStyle: { height: '100%', backgroundColor: colors.bgSurface },
        }}
      />
    </Stack>
  );
}
