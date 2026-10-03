import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { syncReminders } from './notifications';

const DEBOUNCE_MS = 600;

/**
 * Keeps scheduled reminders in sync with the data (on launch, on foreground, and after
 * any successful write) and opens the dose sheet when a reminder is tapped. Renders nothing.
 */
export function ReminderSync() {
  const db = useSQLiteContext();
  const qc = useQueryClient();
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => syncReminders(db), DEBOUNCE_MS);
    };
    schedule();
    const app = AppState.addEventListener('change', (s) => s === 'active' && schedule());
    const unsub = qc.getMutationCache().subscribe((e) => {
      if (e.type === 'updated' && e.mutation.state.status === 'success') schedule();
    });
    return () => {
      clearTimeout(timer);
      app.remove();
      unsub();
    };
  }, [db, qc]);

  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const req = response.notification.request;
    const key = `${req.identifier}@${response.notification.date}`;
    if (handled.current === key) return;
    handled.current = key;
    const data = req.content.data as { protocolId?: string; scheduledFor?: string } | undefined;
    if (data?.protocolId && data.scheduledFor) {
      router.push({ pathname: '/dose', params: { protocolId: data.protocolId, scheduledFor: data.scheduledFor } });
    }
  }, [response]);

  return null;
}
