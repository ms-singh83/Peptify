import { router, Stack } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { Button, EmptyState, Screen, Text } from '@/components/ui';
import { useProtocols } from '@/features/protocols/hooks';
import { VialCard } from '@/features/vials/vial-card';
import { useVials } from '@/features/vials/hooks';
import { useNow } from '@/hooks/use-now';
import { toMcg } from '@/lib/units';

export default function VialsScreen() {
  const vials = useVials();
  const protocols = useProtocols('active');
  const now = useNow();
  const add = () => router.push('/vials/form');

  // Per-dose amount from the active protocol drawing from each vial, for "doses left".
  const doseFor = new Map<string, number>();
  for (const p of protocols.data ?? []) {
    const mcg = toMcg(p.doseAmount, p.doseUnit);
    if (p.vialId && mcg !== null) doseFor.set(p.vialId, mcg);
  }

  const active = (vials.data ?? []).filter((v) => v.status === 'active');
  const past = (vials.data ?? []).filter((v) => v.status !== 'active');
  const open = (id: string) => router.push({ pathname: '/vials/form', params: { id } });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Vials',
          headerRight: () => <Button title="Add" accessibilityLabel="Add vial" variant="ghost" size="sm" onPress={add} />,
        }}
      />
      <Screen safeTop={false}>
        {vials.isLoading ? (
          <ActivityIndicator />
        ) : vials.isError ? (
          <EmptyState title="Something went wrong" body="Please try again." actionTitle="Retry" onAction={() => vials.refetch()} />
        ) : !vials.data?.length ? (
          <EmptyState
            title="No vials yet"
            body="Add a vial and link it to a protocol. Each logged dose is subtracted automatically."
            actionTitle="Add a vial"
            onAction={add}
          />
        ) : (
          <>
            {active.map((v) => (
              <VialCard key={v.id} vial={v} doseMcg={doseFor.get(v.id) ?? null} now={now} onPress={() => open(v.id)} />
            ))}
            {past.length ? (
              <Text variant="callout" color="textSecondary" accessibilityRole="header">
                Finished
              </Text>
            ) : null}
            {past.map((v) => (
              <VialCard key={v.id} vial={v} doseMcg={null} now={now} onPress={() => open(v.id)} />
            ))}
          </>
        )}
      </Screen>
    </>
  );
}
