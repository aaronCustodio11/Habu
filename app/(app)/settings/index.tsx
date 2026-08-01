import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/constants/Colors';

interface Row {
  key: string;
  icon: string;
  label: string;
  onPress: () => void;
}

/** Settings menu (module 13). */
export default function SettingsScreen() {
  const { colors } = useTheme();
  const { signOut, email } = useAuth();

  const rows: Row[] = [
    { key: 'account', icon: 'account-outline', label: 'Account', onPress: () => router.push('/settings/account') },
    { key: 'notifications', icon: 'bell-outline', label: 'Notifications', onPress: () => router.push('/settings/notifications') },
    { key: 'theme', icon: 'theme-light-dark', label: 'Theme', onPress: () => router.push('/settings/theme') },
    { key: 'delete', icon: 'delete-outline', label: 'Delete Account', onPress: () => router.push('/settings/delete-account') },
  ];

  return (
    <ScrollView style={{ backgroundColor: colors.bgBase, flex: 1 }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      <Text style={{ color: colors.textPrimary, fontSize: typography.title, fontWeight: '800' }}>Settings</Text>

      {email ? (
        <Text style={{ color: colors.textTertiary, fontSize: 13 }}>Signed in as {email}</Text>
      ) : null}

      <View style={{ gap: spacing.xs }}>
        {rows.map((row) => (
          <View
            key={row.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              backgroundColor: colors.bgSurface,
              borderRadius: 12,
              padding: spacing.md,
            }}
          >
            <MaterialCommunityIcons name={row.icon as never} size={22} color={colors.textSecondary} />
            <Text style={{ color: colors.textPrimary, fontSize: 17, flex: 1 }} onPress={row.onPress}>
              {row.label}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textTertiary} />
          </View>
        ))}
      </View>

      <Text
        style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginTop: spacing.lg, textDecorationLine: 'underline' }}
        onPress={() => void signOut()}
      >
        Sign out
      </Text>
    </ScrollView>
  );
}
