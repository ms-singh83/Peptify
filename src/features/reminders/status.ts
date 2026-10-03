import * as Notifications from 'expo-notifications';
import { create } from 'zustand';

import { prefs } from '@/features/settings/prefs';
import { ID_PREFIX, nextFireAt } from '@/lib/reminders';

export type Permission = 'granted' | 'denied' | 'undetermined';

type Status = {
  /** Peptify's own switch (Settings → Dose reminders). */
  enabled: boolean;
  /** The OS notification permission. */
  permission: Permission;
  /** Whether the OS will still show its permission prompt. */
  canAskAgain: boolean;
  scheduledCount: number;
  nextAt: string | null;
  loaded: boolean;
  refresh: () => Promise<void>;
};

/**
 * Single source of truth for "will reminders actually fire?". Refreshed after every
 * sync and on foreground, so UI never claims reminders are on when the OS blocks them.
 */
export const useReminderStatus = create<Status>((set) => ({
  enabled: prefs.remindersEnabled(),
  permission: 'undetermined',
  canAskAgain: true,
  scheduledCount: 0,
  nextAt: null,
  loaded: false,
  refresh: async () => {
    try {
      const [perm, scheduled] = await Promise.all([
        Notifications.getPermissionsAsync(),
        Notifications.getAllScheduledNotificationsAsync(),
      ]);
      const provisional = perm.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
      const ids = scheduled.map((n) => n.identifier).filter((id) => id.startsWith(ID_PREFIX));
      set({
        enabled: prefs.remindersEnabled(),
        permission: perm.granted || provisional ? 'granted' : perm.status === 'denied' ? 'denied' : 'undetermined',
        canAskAgain: perm.canAskAgain,
        scheduledCount: ids.length,
        nextAt: nextFireAt(ids),
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },
}));

/** Reminders will actually be delivered. */
export const remindersActive = (s: Pick<Status, 'enabled' | 'permission'>) => s.enabled && s.permission === 'granted';
