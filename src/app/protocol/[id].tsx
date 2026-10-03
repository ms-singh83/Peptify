import { format, parseISO } from 'date-fns';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Button, Card, EmptyState, Screen, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { protocolSummary, protocolTitle } from '@/features/protocols/describe';
import { useDeleteProtocol, useProtocol, useSetProtocolStatus } from '@/features/protocols/hooks';
import { formatTime } from '@/lib/format';
import { nextOccurrence } from '@/lib/schedule';
import type { ProtocolStatus } from '@/types/domain';

const fmtDate = (d: string) => format(parseISO(d), 'd MMM yyyy');

export default function ProtocolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: p, isLoading } = useProtocol(id);
  const setStatus = useSetProtocolStatus();
  const remove = useDeleteProtocol();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!p) {
    return (
      <Screen safeTop={false}>
        <EmptyState title="Protocol not found" actionTitle="Go back" onAction={() => router.back()} />
      </Screen>
    );
  }

  const next = p.status === 'active' ? nextOccurrence(p, new Date()) : null;
  const change = (status: ProtocolStatus) => setStatus.mutate({ id: p.id, status });

  const confirmEnd = () =>
    Alert.alert('End this protocol?', 'It stops appearing on Today. Your history is kept.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End protocol', style: 'destructive', onPress: () => change('ended') },
    ]);

  const confirmDelete = () =>
    Alert.alert('Delete this protocol?', 'This removes the protocol. Logged doses stay in your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // Leave first so the screen doesn't flash "not found" while queries refresh.
          router.back();
          remove.mutate(p.id);
        },
      },
    ]);

  return (
    <>
      <Stack.Screen options={{ title: protocolTitle(p) }} />
      <Screen safeTop={false}>
        <Card>
          <Text variant="title2">{protocolTitle(p)}</Text>
          <Text color="textSecondary">{protocolSummary(p)}</Text>
          <Text variant="caption" color="textSecondary">
            {p.status === 'active' ? 'Active' : p.status === 'paused' ? 'Paused' : 'Ended'} · Started {fmtDate(p.startDate)}
            {p.endDate ? ` · Ends ${fmtDate(p.endDate)}` : ''}
          </Text>
        </Card>

        <Card>
          <Text variant="callout" color="textSecondary">
            Next dose
          </Text>
          <Text variant="headline">
            {next
              ? `${format(parseISO(next.date), 'EEE d MMM')} at ${formatTime(next.time)}`
              : p.status === 'active'
                ? 'No upcoming doses'
                : 'None while not active'}
          </Text>
        </Card>

        {p.notes ? (
          <Card>
            <Text variant="callout" color="textSecondary">
              Notes
            </Text>
            <Text>{p.notes}</Text>
          </Card>
        ) : null}

        <View style={styles.actions}>
          <Button
            title="Edit"
            variant="secondary"
            onPress={() => router.push({ pathname: '/protocol/form', params: { id: p.id } })}
          />
          {p.status === 'active' ? <Button title="Pause" variant="secondary" onPress={() => change('paused')} /> : null}
          {p.status !== 'active' ? (
            <Button title="Resume" variant="secondary" onPress={() => change('active')} />
          ) : null}
          {p.status !== 'ended' ? <Button title="End protocol" variant="ghost" onPress={confirmEnd} /> : null}
          <Button title="Delete" variant="destructive" onPress={confirmDelete} />
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: Spacing.sm },
});
