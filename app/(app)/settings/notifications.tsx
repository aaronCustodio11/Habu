import { Switch, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { ensureNotificationsPermission } from '@/lib/notifications/permissions';
import { formatTimeHM } from '@/lib/dates';
import { radius, spacing } from '@/constants/Colors';
import type { Board } from '@/types/board';

/** Global reminder preferences - one row per board's daily reminder. */
export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { userId } = useAuth();
  const { boards, updateBoard } = useBoards(userId);

  const remindable = boards.filter((board) => !board.archived);

  const sendTest = async () => {
    try {
      const granted = await ensureNotificationsPermission();
      if (!granted) return;
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Habu test', body: 'Reminders are working.', sound: true },
        trigger: null,
      });
    } catch (error) {
      console.warn('[notifications] test notification failed:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgBase, padding: spacing.lg, gap: spacing.md }}>
      {__DEV__ ? <Button label="Send test notification now" onPress={() => void sendTest()} /> : null}
      {remindable.length === 0 ? (
        <Text style={{ color: colors.textTertiary, fontSize: 15 }}>
          Create a board with a reminder enabled to see it here.
        </Text>
      ) : (
        remindable.map((board: Board) => (
          <View
            key={board.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
              backgroundColor: colors.bgSurface,
              borderRadius: radius.md,
              padding: spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 17 }}>{board.name}</Text>
              <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
                {board.reminderEnabled && board.reminderTime
                  ? `Daily at ${formatTimeHM(board.reminderTime)}`
                  : 'Reminder off'}
              </Text>
            </View>
            <Switch
              value={board.reminderEnabled}
              onValueChange={(value) =>
                void updateBoard(board.id, {
                  reminderEnabled: value,
                  reminderTime: value ? board.reminderTime ?? '18:00' : null,
                })
              }
              trackColor={{ true: colors.textPrimary, false: colors.borderSubtle }}
              thumbColor={colors.bgSurfaceRaised}
            />
          </View>
        ))
      )}
    </View>
  );
}
