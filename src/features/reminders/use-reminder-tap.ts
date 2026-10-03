import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

/**
 * Opens the dose sheet when a reminder is tapped (including a cold start from the tap).
 * Call it from a layout that only mounts once the navigator is ready and onboarding is
 * done (the tabs layout), so the push can't be dropped.
 */
export function useReminderTapNavigation() {
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const req = response.notification.request;
    const key = `${req.identifier}@${response.notification.date}`;
    if (handled.current === key) return;
    const data = req.content.data as { protocolId?: string; scheduledFor?: string } | undefined;
    if (!data?.protocolId || !data.scheduledFor) return;

    // Defer one tick so the tabs navigator has finished mounting; mark handled only once pushed.
    const timer = setTimeout(() => {
      router.push({ pathname: '/dose', params: { protocolId: data.protocolId!, scheduledFor: data.scheduledFor! } });
      handled.current = key;
    }, 0);
    return () => clearTimeout(timer);
  }, [response]);
}
