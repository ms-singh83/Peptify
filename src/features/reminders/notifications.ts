import { addDays, parseISO } from 'date-fns';
import * as Notifications from 'expo-notifications';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { listDosesBetween } from '@/db/repositories/doses';
import { listProtocols } from '@/db/repositories/protocols';
import { displayName } from '@/features/library/peptides';
import { prefs } from '@/features/settings/prefs';
import { toISODate } from '@/lib/dates';
import { diffReminders, HORIZON_DAYS, ID_PREFIX, planReminders } from '@/lib/reminders';

const CHANNEL_ID = 'dose-reminders';

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
  const p = await Notifications.requestPermissionsAsync();
  return p.granted;
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
        await syncOnce(db, opts);
      } while (again);
    } catch (e) {
      // Reminders must never take the app down; the next sync retries.
      console.warn('Reminder sync failed', e);
    } finally {
      running = null;
    }
  })();
  return running;
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
    await Notifications.scheduleNotificationAsync({
      identifier: r.identifier,
      content: { title: r.title, body: r.body, data: r.data, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: parseISO(r.fireAt), // local time
        channelId: CHANNEL_ID,
      },
    });
  }
}
