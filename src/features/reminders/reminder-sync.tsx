import { useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { syncReminders } from './notifications';
import { useReminderStatus } from './status';

const DEBOUNCE_MS = 600;

/**
 * Keeps scheduled reminders in sync with the data: on launch, on foreground, and after
 * any successful write. Renders nothing. (Tap handling lives in useReminderTapNavigation.)
 */
export function ReminderSync() {
  const db = useSQLiteContext();
  const qc = useQueryClient();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => syncReminders(db), DEBOUNCE_MS);
    };
    schedule();
    // Coming back from system Settings may have changed the permission: re-sync (which refreshes status).
    const app = AppState.addEventListener('change', (s) => {
      if (s === 'active') {
        useReminderStatus.getState().refresh();
        schedule();
      }
    });
    const unsub = qc.getMutationCache().subscribe((e) => {
      if (e.type === 'updated' && e.mutation.state.status === 'success') schedule();
    });
    return () => {
      clearTimeout(timer);
      app.remove();
      unsub();
    };
  }, [db, qc]);

  return null;
}
