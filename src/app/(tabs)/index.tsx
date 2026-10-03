import { format } from 'date-fns';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Button, EmptyState, Screen, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useStreak } from '@/features/history/hooks';
import { quickLogInput, useLogDose, useToday, useUndoDose } from '@/features/today/hooks';
import { SlotCard } from '@/features/today/slot-card';
import { formatTime } from '@/lib/format';
import { groupSlotsByTime } from '@/lib/today';

const partOfDay = (time: string) => {
  const h = Number(time.slice(0, 2));
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
};

export default function TodayScreen() {
  const { slots, now, isLoading, isError, refetch } = useToday();
  const streak = useStreak();
  const log = useLogDose();
  const undo = useUndoDose();
  const busy = log.isPending || undo.isPending;

  const fail = (e: unknown) => Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
  const done = slots.filter((s) => s.status === 'taken' || s.status === 'skipped').length;

  return (
    <Screen
      title="Today"
      subtitle={`${format(now, 'EEEE, d MMMM')}${slots.length ? ` · ${done} of ${slots.length} logged` : ''}`}
      headerRight={
        streak > 0 ? (
          <View style={styles.streak} accessible accessibilityLabel={`${streak} day streak`}>
            <Text variant="headline" color="primary">
              {streak}
            </Text>
            <Text variant="caption" color="textSecondary">
              day streak
            </Text>
          </View>
        ) : null
      }>
      {isLoading ? (
        <ActivityIndicator />
      ) : isError ? (
        <EmptyState title="Couldn't load today" actionTitle="Try again" onAction={() => refetch()} />
      ) : !slots.length ? (
        <EmptyState
          title="No doses scheduled today"
          body="Add a protocol and your doses will show up here."
          actionTitle="Add a protocol"
          onAction={() => router.push('/protocol/form')}
        />
      ) : (
        groupSlotsByTime(slots).map((g) => (
          <View key={g.time} style={styles.group}>
            <Text variant="callout" color="textSecondary" accessibilityRole="header">
              {partOfDay(g.time)} · {formatTime(g.time)}
            </Text>
            {g.slots.map((slot) => (
              <SlotCard
                key={slot.occurrence.scheduledFor + slot.protocol.id}
                slot={slot}
                busy={busy}
                onLog={(status) => log.mutate(quickLogInput(slot, status), { onError: fail })}
                onUndo={() => slot.dose && undo.mutate(slot.dose.id, { onError: fail })}
                onOpen={() =>
                  router.push({
                    pathname: '/dose',
                    params: { protocolId: slot.protocol.id, scheduledFor: slot.occurrence.scheduledFor },
                  })
                }
              />
            ))}
          </View>
        ))
      )}
      {!isLoading ? <Button title="View history" variant="secondary" onPress={() => router.push('/history')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.sm },
  streak: { alignItems: 'center' },
});
