import { format } from 'date-fns';
import { router } from 'expo-router';

import { EmptyState, Screen } from '@/components/ui';

// Real data arrives in T-205/T-206.
export default function TodayScreen() {
  return (
    <Screen title="Today" subtitle={format(new Date(), 'EEEE, d MMMM')}>
      <EmptyState
        title="No doses scheduled today"
        body="Add a protocol and your doses will show up here."
        actionTitle="Add a protocol"
        onAction={() => router.navigate('/protocols')}
      />
    </Screen>
  );
}
