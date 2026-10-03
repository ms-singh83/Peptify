import Constants from 'expo-constants';

import { Card, Disclaimer, Screen, Text } from '@/components/ui';

// Built in T-504.
export default function SettingsScreen() {
  return (
    <Screen title="Settings">
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
