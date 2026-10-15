// "Remind me later" as a one-time local notification. Local notifications
// work in Expo Go; push notifications are not used.
//
// Notifications never include the medication name, so nothing private shows
// on the lock screen.

import { Platform } from 'react-native';

export type ReminderResult =
  | { scheduled: true; at: Date }
  | { scheduled: false; reason: 'denied' | 'unsupported' | 'error' };

const CHANNEL_ID = 'dose-reminders';
let handlerSet = false;

export async function remindLater(minutes: number): Promise<ReminderResult> {
  if (Platform.OS === 'web') return { scheduled: false, reason: 'unsupported' };

  try {
    // Loaded on first use so Home still works if the module has a problem.
    const Notifications = await import('expo-notifications');

    if (!handlerSet) {
      // Show the reminder even if the app is open when it fires.
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      handlerSet = true;
    }

    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && permission.canAskAgain) {
      permission = await Notifications.requestPermissionsAsync();
    }
    if (!permission.granted) return { scheduled: false, reason: 'denied' };

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Dose reminders',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medication reminder',
        body: 'It’s time for the dose you asked to be reminded about. Open the app to log it.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: minutes * 60,
        channelId: CHANNEL_ID,
      },
    });
    return { scheduled: true, at: new Date(Date.now() + minutes * 60 * 1000) };
  } catch {
    return { scheduled: false, reason: 'error' };
  }
}
