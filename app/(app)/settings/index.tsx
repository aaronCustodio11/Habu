import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useContentWidth } from '@/hooks/useContentWidth';
import { LucideIcon, type LucideIconName } from '@/components/ui/LucideIcon';
import { spacing, typography } from '@/constants/Colors';

interface Row {
  key: string;
  icon: LucideIconName;
  label: string;
  onPress: () => void;
}

/** Settings menu (module 13). */
export default function SettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { contentStyle } = useContentWidth();
  const { signOut, email } = useAuth();

  const rows: Row[] = [
    { key: 'account', icon: 'CircleUser', label: 'Account', onPress: () => router.push('/settings/account') },
    { key: 'notifications', icon: 'Bell', label: 'Notifications', onPress: () => router.push('/settings/notifications') },
    { key: 'theme', icon: 'Contrast', label: 'Theme', onPress: () => router.push('/settings/theme') },
    { key: 'delete', icon: 'Trash2', label: 'Delete Account', onPress: () => router.push('/settings/delete-account') },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.bgBase, flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
    >
      <View
        style={[
          contentStyle,
          {
            paddingTop: spacing.lg + insets.top,
            paddingBottom: spacing.lg + insets.bottom,
            paddingHorizontal: spacing.lg,
            gap: spacing.md,
          },
        ]}
      >
        <Text style={{ color: colors.textPrimary, fontSize: typography.title, fontWeight: '800' }}>Settings</Text>

        {email ? (
          <Text style={{ color: colors.textTertiary, fontSize: 13 }}>Signed in as {email}</Text>
        ) : null}

        <View style={{ gap: spacing.xs }}>
          {rows.map((row) => (
            <Pressable
              key={row.key}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              onPress={row.onPress}
              style={({ pressed }) => [
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.md,
                  backgroundColor: colors.bgSurface,
                  borderRadius: 12,
                  paddingHorizontal: spacing.md,
                  minHeight: 56,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <LucideIcon name={row.icon} size={22} color={colors.textSecondary} />
              <Text style={{ color: colors.textPrimary, fontSize: 17, flex: 1 }} numberOfLines={1}>
                {row.label}
              </Text>
              <ChevronRight size={22} color={colors.textTertiary} />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          hitSlop={8}
          onPress={() => void signOut()}
          style={({ pressed }) => [
            { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text
            style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', textDecorationLine: 'underline' }}
          >
            Sign out
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
