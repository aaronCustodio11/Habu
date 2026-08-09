import { Text, View } from 'react-native';
import CloudOff from 'lucide-react-native/icons/cloud-off';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/Colors';
import { useSyncStatus } from '@/lib/sync/useSyncStatus';

/** Persistent thin banner when the device is offline (design doc §7.8). */
export function OfflineBanner() {
  const { colors } = useTheme();
  const { status } = useSyncStatus();

  if (status.isOnline) return null;

  return (
    <View
      style={{
        backgroundColor: colors.stateOfflineBg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      }}
    >
      <CloudOff size={16} color={colors.textSecondary} />
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Offline - changes will sync later</Text>
    </View>
  );
}
