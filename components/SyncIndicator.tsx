import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/Colors';
import { useSyncStatus } from '@/lib/sync/useSyncStatus';

/** Small syncing spinner (design doc §7.8) - local, not global. */
export function SyncIndicator() {
  const { colors } = useTheme();
  const { status } = useSyncStatus();

  if (!status.isSyncing) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      <ActivityIndicator size="small" color={colors.textTertiary} />
      <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Syncing</Text>
    </View>
  );
}
