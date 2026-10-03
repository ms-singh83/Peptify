import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { Button, Card, EmptyState, ListRow, Screen, SegmentedControl, Text } from '@/components/ui';
import { protocolSummary, protocolTitle } from '@/features/protocols/describe';
import { useProtocols } from '@/features/protocols/hooks';
import type { ProtocolStatus } from '@/types/domain';

const FILTERS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'ended', label: 'Ended' },
] as const satisfies readonly { value: ProtocolStatus; label: string }[];

const EMPTY: Record<ProtocolStatus, { title: string; body: string }> = {
  active: { title: 'No active protocols', body: 'Create a protocol to get your schedule and reminders.' },
  paused: { title: 'Nothing paused', body: 'Paused protocols stay here until you resume them.' },
  ended: { title: 'Nothing ended yet', body: 'Ended protocols keep their history here.' },
};

export default function ProtocolsScreen() {
  const [status, setStatus] = useState<ProtocolStatus>('active');
  const { data, isLoading, isError, refetch } = useProtocols(status);
  const add = () => router.push('/protocol/form');

  return (
    <Screen title="Protocols" headerRight={<Button title="Add" accessibilityLabel="Add protocol" size="sm" onPress={add} />}>
      <SegmentedControl accessibilityLabel="Filter protocols" options={FILTERS} value={status} onChange={setStatus} />

      {isLoading ? (
        <ActivityIndicator />
      ) : isError ? (
        <EmptyState title="Couldn't load protocols" actionTitle="Try again" onAction={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState
          {...EMPTY[status]}
          actionTitle={status === 'active' ? 'Create a protocol' : undefined}
          onAction={status === 'active' ? add : undefined}
        />
      ) : (
        <Card>
          {data.map((p) => (
            <ListRow
              key={p.id}
              title={protocolTitle(p)}
              subtitle={protocolSummary(p)}
              accessibilityHint="Opens protocol details"
              onPress={() => router.push({ pathname: '/protocol/[id]', params: { id: p.id } })}
              right={
                <Text variant="headline" color="textSecondary">
                  ›
                </Text>
              }
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}
