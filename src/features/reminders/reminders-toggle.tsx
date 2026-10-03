import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, Linking } from 'react-native';

import { SwitchRow } from '@/components/ui';
import { prefs } from '@/features/settings/prefs';

import { requestReminderPermission, syncReminders } from './notifications';

export function RemindersToggle() {
  const db = useSQLiteContext();
  const [on, setOn] = useState(prefs.remindersEnabled());

  const change = async (next: boolean) => {
    if (next && !(await requestReminderPermission())) {
      Alert.alert('Notifications are off', 'Allow notifications for Peptify in your phone settings to get dose reminders.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    prefs.setRemindersEnabled(next);
    setOn(next);
    syncReminders(db);
  };

  return <SwitchRow label="Dose reminders" value={on} onValueChange={change} />;
}
