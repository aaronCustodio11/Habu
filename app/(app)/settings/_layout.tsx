import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/constants/Colors';
import { Text, View } from 'react-native';

/** Settings stack - deliberately plain, standard grouped list (§10). */
export default function SettingsLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bgBase },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.textPrimary, fontSize: typography.heading, fontWeight: '700' },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.bgBase },
        headerTitle: '',
        headerLeft: () => <View style={{ width: spacing.xl }} />,
      }}
    />
  );
}
