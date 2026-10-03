import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Button, DateTimeField, NumberField, Screen, SwitchRow, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { PeptidePicker } from '@/features/protocols/peptide-picker';
import { useSaveVial, useSetVialStatus, useVial } from '@/features/vials/hooks';
import { toISODate } from '@/lib/dates';
import { parseDecimal } from '@/lib/number';
import { vialInputSchema } from '@/types/domain';

type Errors = Partial<Record<'name' | 'totalMg' | 'waterMl' | 'dates' | 'general', string>>;

/** Create/edit a vial. Params: id (edit), or totalMg/waterMl (prefill from the calculator). */
export default function VialFormScreen() {
  const params = useLocalSearchParams<{ id?: string; totalMg?: string; waterMl?: string }>();
  const { id } = params;
  const existing = useVial(id);
  const save = useSaveVial();
  const setStatus = useSetVialStatus();
  const today = toISODate(new Date());

  const [peptideSlug, setPeptideSlug] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [totalMg, setTotalMg] = useState(params.totalMg ?? '');
  const [reconstituted, setReconstituted] = useState(!!params.waterMl);
  const [waterMl, setWaterMl] = useState(params.waterMl ?? '');
  const [reconstitutedAt, setReconstitutedAt] = useState(today);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiresAt, setExpiresAt] = useState(today);
  const [errors, setErrors] = useState<Errors>({});
  const [loaded, setLoaded] = useState(!id);

  useEffect(() => {
    const v = existing.data;
    if (!id || loaded || !v) return;
    setPeptideSlug(v.peptideSlug);
    setCustomName(v.customName ?? '');
    setTotalMg(String(v.totalMg));
    setReconstituted(v.waterMl !== null);
    setWaterMl(v.waterMl !== null ? String(v.waterMl) : '');
    setReconstitutedAt(v.reconstitutedAt ?? today);
    setHasExpiry(!!v.expiresAt);
    setExpiresAt(v.expiresAt ?? today);
    setLoaded(true);
  }, [id, loaded, existing.data, today]);

  if (id && !loaded) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Vial' }} />
        {existing.isFetched && !existing.data ? <Text color="textSecondary">Vial not found.</Text> : <ActivityIndicator />}
      </View>
    );
  }

  const onSave = () => {
    const parsed = vialInputSchema.safeParse({
      peptideSlug,
      customName: peptideSlug ? null : customName.trim() || null,
      totalMg: parseDecimal(totalMg) ?? NaN,
      waterMl: reconstituted ? (parseDecimal(waterMl) ?? NaN) : null,
      reconstitutedAt: reconstituted ? reconstitutedAt : null,
      expiresAt: hasExpiry ? expiresAt : null,
    });
    const e: Errors = {};
    if (!peptideSlug && !customName.trim()) e.name = 'Choose a peptide or enter a name';
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (key === 'customName') e.name ??= issue.message;
        else if (key === 'totalMg') e.totalMg ??= 'Enter the mg in the vial';
        else if (key === 'waterMl') e.waterMl ??= 'Enter the mL of water added';
        else if (key === 'expiresAt' || key === 'reconstitutedAt') e.dates ??= issue.message;
      }
      if (!Object.keys(e).length) e.general = parsed.error.issues[0]?.message ?? 'Please check the form';
    }
    if (hasExpiry && reconstituted && expiresAt < reconstitutedAt) e.dates = 'Expiry must be after the reconstitution date';
    setErrors(e);
    if (Object.keys(e).length || !parsed.success) return;
    save.mutate(
      { id, input: parsed.data },
      {
        onSuccess: () => router.back(),
        onError: (err) => Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.'),
      },
    );
  };

  const v = existing.data;
  const changeStatus = (status: 'empty' | 'discarded' | 'active') =>
    id &&
    setStatus.mutate(
      { id, status },
      {
        onSuccess: () => router.back(),
        onError: (err) => Alert.alert('Could not update', err instanceof Error ? err.message : 'Please try again.'),
      },
    );
  const confirmDiscard = () =>
    Alert.alert('Discard this vial?', 'It stops being used for new doses. Unsaved edits on this screen are lost.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => changeStatus('discarded') },
    ]);

  return (
    <>
      <Stack.Screen options={{ title: id ? 'Edit vial' : 'New vial' }} />
      <Screen safeTop={false} footer={<Button title="Save vial" loading={save.isPending} onPress={onSave} />}>
        <PeptidePicker
          peptideSlug={peptideSlug}
          customName={customName}
          onChange={(x) => {
            setPeptideSlug(x.peptideSlug);
            setCustomName(x.customName);
          }}
          error={errors.name}
        />
        <NumberField label="Peptide in vial" unit="mg" placeholder="5" value={totalMg} onChangeText={setTotalMg} error={errors.totalMg} />

        <SwitchRow label="Reconstituted" value={reconstituted} onValueChange={setReconstituted} />
        {reconstituted ? (
          <>
            <NumberField
              label="Bacteriostatic water added"
              unit="mL"
              placeholder="2"
              value={waterMl}
              onChangeText={setWaterMl}
              error={errors.waterMl}
            />
            <View style={styles.row}>
              <Text style={styles.flex}>Reconstituted on</Text>
              <DateTimeField label="Reconstitution date" mode="date" value={reconstitutedAt} onChange={setReconstitutedAt} />
            </View>
          </>
        ) : null}

        <SwitchRow label="Track an expiry date" value={hasExpiry} onValueChange={setHasExpiry} />
        {hasExpiry ? (
          <View style={styles.row}>
            <Text style={styles.flex}>Expiry date</Text>
            <DateTimeField label="Expiry date" mode="date" value={expiresAt} onChange={setExpiresAt} />
          </View>
        ) : null}
        {errors.dates || errors.general ? (
          <Text variant="caption" color="danger">
            {errors.dates ?? errors.general}
          </Text>
        ) : null}

        {v ? (
          <View style={styles.actions}>
            {v.status === 'active' ? (
              <>
                <Button title="Mark as empty" variant="secondary" onPress={() => changeStatus('empty')} />
                <Button title="Discard vial" variant="destructive" onPress={confirmDiscard} />
              </>
            ) : (
              <Button title="Mark as active again" variant="secondary" onPress={() => changeStatus('active')} />
            )}
          </View>
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  flex: { flex: 1 },
  actions: { gap: Spacing.sm },
});
