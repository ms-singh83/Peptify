import { EmptyState, Screen } from '@/components/ui';

// Built in T-203/T-204.
export default function ProtocolsScreen() {
  return (
    <Screen title="Protocols">
      <EmptyState title="No protocols yet" body="Protocols you create will appear here." />
    </Screen>
  );
}
