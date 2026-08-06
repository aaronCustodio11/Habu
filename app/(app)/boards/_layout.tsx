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
          // A regular pushed screen (module 5) on every platform — iOS, Android,
          // and native iOS 26+. The OS drives a standard native push (slide +
          // interactive back gesture), so there's no JS animation and it stays
          // 60fps on any device.
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.bgBase },
        }}
      />
    </Stack>
  );
}
