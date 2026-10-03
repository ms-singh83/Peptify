import Constants from 'expo-constants';
import { router } from 'expo-router';

import { Card, Disclaimer, ListRow, Screen, Text } from '@/components/ui';
import { RemindersToggle } from '@/features/reminders/reminders-toggle';

// Built in T-504.
export default function SettingsScreen() {
  return (
    <Screen title="Settings">
      <Card>
        <RemindersToggle />
      </Card>
      <Card>
        <ListRow title="Vials & inventory" onPress={() => router.push('/vials')} />
        <ListRow title="History" onPress={() => router.push('/history')} />
      </Card>
      <Card>
        <Text variant="headline">About</Text>
        <Disclaimer />
      </Card>
      <Text variant="caption" color="textSecondary">
        Version {Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </Screen>
  );
}
