import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';

import { Button, Card, Text } from '@/components/ui';
import { useActiveProtocolCount } from '@/features/protocols/hooks';

import { turnOnReminders } from './notifications';
import { remindersActive, useReminderStatus } from './status';

/** Shown on Today when you have active protocols but reminders can't fire. */
export function RemindersBanner() {
  const db = useSQLiteContext();
  const status = useReminderStatus();
  const { data: activeCount = 0 } = useActiveProtocolCount();
  const [busy, setBusy] = useState(false);

  if (!status.loaded || activeCount === 0 || remindersActive(status)) return null;
  const blocked = status.permission === 'denied' && !status.canAskAgain;

  return (
    <Card accessibilityRole="alert">
      <Text variant="headline" color="warning">
        Reminders are off
      </Text>
      <Text variant="callout" color="textSecondary">
        {blocked
          ? 'Notifications are blocked for Peptify. Turn them on in your phone settings to get dose reminders.'
          : 'Turn on reminders so you get a notification at each dose time.'}
      </Text>
      <Button
        title={blocked ? 'Open phone settings' : 'Turn on reminders'}
        size="sm"
        loading={busy}
        onPress={async () => {
          setBusy(true);
          try {
            await turnOnReminders(db);
          } finally {
            setBusy(false);
          }
        }}
      />
    </Card>
  );
}
