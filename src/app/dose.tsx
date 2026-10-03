import { format, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  DateTimeField,
  FieldLabel,
  NumberField,
  Screen,
  SegmentedControl,
  Text,
  TextField,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { SiteGrid } from '@/features/doses/site-grid';
import { useDoseForSlot, useSiteUses } from '@/features/doses/hooks';
import { displayName } from '@/features/library/peptides';
import { useProtocol } from '@/features/protocols/hooks';
import { useLogDose, useUndoDose } from '@/features/today/hooks';
import { toISODate } from '@/lib/dates';
import { formatTime } from '@/lib/format';
import { parseDecimal } from '@/lib/number';
import { suggestSite } from '@/lib/sites';
import type { DoseStatus, InjectionSite } from '@/types/domain';

const STATUS_OPTIONS = [
  { value: 'taken', label: 'Taken' },
  { value: 'skipped', label: 'Skipped' },
] as const satisfies readonly { value: DoseStatus; label: string }[];

/** Log or edit one dose. Params: protocolId (required), scheduledFor (omit for an extra, unscheduled dose). */
export default function DoseSheet() {
  const { protocolId, scheduledFor } = useLocalSearchParams<{ protocolId: string; scheduledFor?: string }>();
  const protocol = useProtocol(protocolId);
  const existing = useDoseForSlot(protocolId, scheduledFor);
  const siteUses = useSiteUses();
  const log = useLogDose();
  const undo = useUndoDose();

  const now = new Date();
  const [status, setStatus] = useState<DoseStatus>('taken');
  const [date, setDate] = useState(toISODate(now));
  const [time, setTime] = useState(format(now, 'HH:mm'));
  const [amount, setAmount] = useState('');
  const [site, setSite] = useState<InjectionSite | null>(null);
  const [notes, setNotes] = useState('');
  const [ready, setReady] = useState(false);

  const suggested = useMemo(() => (siteUses.data ? suggestSite(siteUses.data) : null), [siteUses.data]);
  const loading = protocol.isLoading || (!!scheduledFor && existing.isLoading) || siteUses.isLoading;

  // Prefill once: existing entry for this slot, otherwise the protocol's planned dose + suggested site.
  useEffect(() => {
    if (ready || loading || !protocol.data) return;
    const d = existing.data;
    if (d) {
      setStatus(d.status);
      if (d.takenAt) {
        setDate(d.takenAt.slice(0, 10));
        setTime(d.takenAt.slice(11, 16));
      }
      setAmount(d.amount !== null ? String(d.amount) : String(protocol.data.doseAmount));
      setSite(d.site);
      setNotes(d.notes ?? '');
    } else {
      setAmount(String(protocol.data.doseAmount));
      setSite(suggested);
    }
    setReady(true);
  }, [ready, loading, protocol.data, existing.data, suggested]);

  if (loading || !ready) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Log dose' }} />
        {!loading && !protocol.data ? <Text color="textSecondary">Protocol not found.</Text> : <ActivityIndicator />}
      </View>
    );
  }

  const p = protocol.data!;
  const parsedAmount = parseDecimal(amount);
  const amountError = status === 'taken' && (parsedAmount === null || parsedAmount <= 0) ? 'Enter the amount taken' : null;

  const save = () => {
    if (amountError) return;
    log.mutate(
      {
        protocolId: p.id,
        scheduledFor: scheduledFor ?? null,
        takenAt: status === 'taken' ? `${date}T${time}:00` : null,
        status,
        amount: status === 'taken' ? parsedAmount : null,
        unit: status === 'taken' ? p.doseUnit : null,
        site: status === 'taken' ? site : null,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          if (status === 'taken') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
        onError: (e) => Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.'),
      },
    );
  };

  const remove = () =>
    existing.data &&
    Alert.alert('Delete this entry?', 'The dose will show as not logged again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => undo.mutate(existing.data!.id, { onSuccess: () => router.back() }),
      },
    ]);

  const slotLabel = scheduledFor
    ? `Scheduled ${format(parseISO(scheduledFor), 'EEE d MMM')} at ${formatTime(scheduledFor.slice(11, 16))}`
    : 'Extra dose (not on the schedule)';

  return (
    <>
      <Stack.Screen options={{ title: existing.data ? 'Edit dose' : 'Log dose' }} />
      <Screen
        safeTop={false}
        footer={<Button title="Save" loading={log.isPending} disabled={!!amountError} onPress={save} />}>
        <Card>
          <Text variant="headline">{displayName(p)}</Text>
          <Text variant="callout" color="textSecondary">
            {slotLabel}
          </Text>
        </Card>

        {scheduledFor ? (
          <SegmentedControl accessibilityLabel="Dose status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        ) : null}

        {status === 'taken' ? (
          <>
            <View style={styles.group}>
              <FieldLabel>Time taken</FieldLabel>
              <View style={styles.row}>
                <DateTimeField label="Date taken" mode="date" value={date} onChange={setDate} />
                <DateTimeField label="Time taken" mode="time" value={time} onChange={setTime} />
              </View>
            </View>
            <NumberField
              label="Amount"
              unit={p.doseUnit === 'iu' ? 'IU' : p.doseUnit}
              value={amount}
              onChangeText={setAmount}
              error={amountError}
            />
            <View style={styles.group}>
              <FieldLabel>Injection site (optional)</FieldLabel>
              <SiteGrid value={site} suggested={suggested} onChange={setSite} />
            </View>
          </>
        ) : null}

        <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} multiline maxLength={500} />

        {existing.data ? <Button title="Delete entry" variant="destructive" onPress={remove} /> : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  group: { gap: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
});
