import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { Button, SwitchRow, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';

import { describeNext } from './describe-next';
import { turnOffReminders, turnOnReminders } from './notifications';
import { remindersActive, useReminderStatus } from './status';

/** Settings row: the switch shows whether reminders will REALLY fire (app setting AND OS permission). */
export function RemindersToggle() {
  const db = useSQLiteContext();
  const status = useReminderStatus();
  const [busy, setBusy] = useState(false);
  const active = remindersActive(status);
  const blocked = status.enabled && status.permission === 'denied';

  const change = async (next: boolean) => {
    setBusy(true);
    try {
      if (next) await turnOnReminders(db);
      else await turnOffReminders(db);
    } finally {
      setBusy(false);
    }
  };

  let line: string;
  if (!status.loaded) line = 'Checking…';
  else if (active)
    line = status.scheduledCount
      ? `On · ${status.scheduledCount} scheduled · next ${describeNext(status.nextAt!)}`
      : 'On · nothing upcoming (add or resume a protocol)';
  else if (blocked) line = 'Notifications are blocked for Peptify in your phone settings.';
  else if (status.enabled) line = 'Allow notifications to get reminders.';
  else line = 'Off';

  return (
    <View style={styles.wrap}>
      <SwitchRow label="Dose reminders" value={active} onValueChange={busy ? () => {} : change} />
      <Text variant="caption" color={blocked ? 'warning' : 'textSecondary'} accessibilityLiveRegion="polite">
        {line}
      </Text>
      {blocked ? (
        <Button title="Open phone settings" variant="secondary" size="sm" onPress={() => Linking.openSettings()} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
});
