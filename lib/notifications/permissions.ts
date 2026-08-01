import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/** Android channel that all Habu reminders go through. */
export const REMINDER_CHANNEL_ID = 'habu-reminders';

/** Creates (or keeps) the Android channel used by daily reminders. */
export async function ensureReminderChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Habit reminders',
      description: 'Daily nudges for your boards',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  } catch (error) {
    console.warn('[notifications] failed to create channel:', error);
  }
}

/** Requests permission if needed. Resolves `true` when reminders may fire. */
export async function ensureNotificationsPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (error) {
    console.warn('[notifications] permission check failed:', error);
    return false;
  }
}
