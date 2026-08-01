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
    />
  );
}
