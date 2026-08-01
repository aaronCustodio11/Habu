import * as Notifications from 'expo-notifications';
import { REMINDER_CHANNEL_ID } from '@/lib/notifications/permissions';

export interface ReminderParams {
  /** Stable id — reuse the board id so (re)scheduling stays idempotent. */
  identifier: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
  boardId?: string;
}

/** Schedules a repeating daily reminder, replacing any existing one. */
export async function scheduleDailyReminder(params: ReminderParams): Promise<void> {
  await cancelDailyReminder(params.identifier);
  await Notifications.scheduleNotificationAsync({
    identifier: params.identifier,
    content: {
      title: params.title,
      body: params.body,
      sound: true,
      data: params.boardId ? { boardId: params.boardId } : undefined,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: REMINDER_CHANNEL_ID,
      hour: params.hour,
      minute: params.minute,
    },
  });
}

export async function cancelDailyReminder(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Nothing scheduled under this identifier — nothing to do.
  }
}

export async function listScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}
