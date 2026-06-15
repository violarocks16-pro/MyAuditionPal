/**
 * Local deadline reminders.
 *
 * "Local" means the phone schedules and shows these itself — no server needed.
 * We schedule one reminder per audition that has an application deadline, store
 * the notification's id on the audition, and cancel it if the audition is removed.
 *
 * This is the only file that talks to expo-notifications directly.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Audition } from '@/types/audition';

// Show the reminder as a banner even if the app happens to be open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Android needs a channel for notifications to appear; harmless on iOS. */
export async function configureNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Deadline reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/** Ask for permission if we don't already have it. Returns true if allowed. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * When the reminder should fire: 9:00 AM the day before the deadline (local time).
 * Returns null if the deadline is unparseable or that moment is already in the past.
 */
function reminderDateFor(deadline: string): Date | null {
  const parts = deadline.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [year, month, day] = parts;
  const reminder = new Date(year, month - 1, day - 1, 9, 0, 0, 0);
  if (reminder.getTime() <= Date.now()) return null;
  return reminder;
}

/**
 * Schedule a deadline reminder for an audition.
 * Returns the new notification's id, or null if nothing was scheduled.
 */
export async function scheduleDeadlineReminder(audition: Audition): Promise<string | null> {
  if (!audition.applicationDeadline) return null;

  const fireDate = reminderDateFor(audition.applicationDeadline);
  if (!fireDate) return null;

  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Application deadline tomorrow',
      body: `${audition.ensemble} — ${audition.position} is due ${audition.applicationDeadline}.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
    },
  });
}

/** Cancel a previously scheduled reminder, if there is one. */
export async function cancelReminder(notificationId?: string): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Already gone or never scheduled — nothing to do.
  }
}
