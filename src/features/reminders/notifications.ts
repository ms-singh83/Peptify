import { addDays, parseISO } from 'date-fns';
import * as Notifications from 'expo-notifications';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Linking, Platform } from 'react-native';

import { listDosesBetween } from '@/db/repositories/doses';
import { listProtocols } from '@/db/repositories/protocols';
import { displayName } from '@/features/library/peptides';
import { prefs } from '@/features/settings/prefs';
import { toISODate } from '@/lib/dates';
import { diffReminders, HORIZON_DAYS, ID_PREFIX, planReminders } from '@/lib/reminders';

import { useReminderStatus } from './status';

const CHANNEL_ID = 'dose-reminders';

// Free-tier limit (maxProtocols: 1) is passed once purchases exist (T-503).

// Show reminders even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Dose reminders',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function hasReminderPermission(): Promise<boolean> {
  const p = await Notifications.getPermissionsAsync();
  return p.granted || p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

/** Ask the OS for permission (shows the system prompt once). Returns whether granted. */
export async function requestReminderPermission(): Promise<boolean> {
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  await Notifications.requestPermissionsAsync();
  return hasReminderPermission();
}

async function cancelAllOurs() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

let running: Promise<void> | null = null;
let again = false;

/**
 * Make scheduled reminders match the data. Safe to call often: concurrent calls
 * collapse into one extra pass. `maxProtocols` limits reminders on the free tier.
 */
export function syncReminders(db: SQLiteDatabase, opts: { maxProtocols?: number } = {}): Promise<void> {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    try {
      do {
        again = false;
        try {
          await syncOnce(db, opts);
        } catch (e) {
          // Reminders must never take the app down; a queued or later sync retries.
          console.warn('Reminder sync failed', e);
        }
      } while (again);
    } finally {
      running = null;
      // Whatever happened, let the UI show the real state.
      await useReminderStatus.getState().refresh();
    }
  })();
  return running;
}

export type TurnOnResult = 'on' | 'blocked';

/**
 * The one action behind every "turn reminders on" button: enable Peptify's switch,
 * ask the OS if it still can, otherwise send the user to system settings.
 */
export async function turnOnReminders(db: SQLiteDatabase): Promise<TurnOnResult> {
  prefs.setRemindersEnabled(true);
  // If iOS/Android will no longer show its prompt, the only way is the system Settings page.
  const before = await Notifications.getPermissionsAsync().catch(() => null);
  const promptAvailable = !before || before.granted || before.canAskAgain;
  const granted = await requestReminderPermission().catch(() => false);
  await syncReminders(db);
  if (granted) return 'on';
  // The user just tapped "Don't Allow" on the prompt: respect it, don't bounce them to Settings.
  if (!promptAvailable) await Linking.openSettings();
  return 'blocked';
}

export async function turnOffReminders(db: SQLiteDatabase): Promise<void> {
  prefs.setRemindersEnabled(false);
  await syncReminders(db);
}

async function syncOnce(db: SQLiteDatabase, { maxProtocols }: { maxProtocols?: number }) {
  if (!prefs.remindersEnabled() || !(await hasReminderPermission())) {
    await cancelAllOurs();
    return;
  }
  await ensureChannel();

  const now = new Date();
  const from = toISODate(now);
  const to = toISODate(addDays(now, HORIZON_DAYS + 1));
  const [protocols, doses] = await Promise.all([
    listProtocols(db),
    listDosesBetween(db, `${from}T00:00:00`, `${to}T00:00:00`),
  ]);
  const logged = new Set(
    doses.filter((d) => d.protocolId && d.scheduledFor).map((d) => `${d.protocolId}|${d.scheduledFor}`),
  );

  const planned = planReminders(protocols, now, { logged, maxProtocols, nameOf: displayName });
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const { toCancel, toSchedule } = diffReminders(
    scheduled.map((n) => n.identifier),
    planned,
  );

  await Promise.all(toCancel.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  for (const r of toSchedule) {
    // One bad slot must not block the rest.
    await Notifications.scheduleNotificationAsync({
      identifier: r.identifier,
      content: { title: r.title, body: r.body, data: r.data, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: parseISO(r.fireAt), // local time
        channelId: CHANNEL_ID,
      },
    }).catch((e) => console.warn('Could not schedule reminder', r.identifier, e));
  }
}
