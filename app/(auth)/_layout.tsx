import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

/** Logged-out stack (login / forgot / reset). */
export default function AuthLayout() {
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
