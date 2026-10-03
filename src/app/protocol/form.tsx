import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import {
  Button,
  DateTimeField,
  FieldLabel,
  NumberField,
  Screen,
  SegmentedControl,
  SwitchRow,
  Text,
  TextField,
} from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { emptyForm, fromProtocol, toProtocolInput, type FormErrors, type ProtocolFormState } from '@/features/protocols/form-state';
import { useProtocol, useSaveProtocol } from '@/features/protocols/hooks';
import { PeptidePicker } from '@/features/protocols/peptide-picker';
import { ScheduleSection } from '@/features/protocols/schedule-section';
import { TimesSection } from '@/features/protocols/times-section';
import { VialSection } from '@/features/protocols/vial-section';
import { toISODate } from '@/lib/dates';
import { DOSE_UNITS, type DoseUnit } from '@/types/domain';

const UNIT_OPTIONS = DOSE_UNITS.map((u) => ({ value: u, label: u === 'iu' ? 'IU' : u })) as {
  value: DoseUnit;
  label: string;
}[];

export default function ProtocolFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useProtocol(id);
  const save = useSaveProtocol();

  const [form, setForm] = useState<ProtocolFormState>(() => emptyForm(toISODate(new Date())));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(!id);

  // Fill the form once when editing.
  useEffect(() => {
    if (id && existing.data && !loaded) {
      setForm(fromProtocol(existing.data));
      setLoaded(true);
    }
  }, [id, existing.data, loaded]);

  const update = (patch: Partial<ProtocolFormState>) => setForm((prev) => ({ ...prev, ...patch }));

  // After the first Save attempt, keep errors in sync with what's on screen.
  useEffect(() => {
    if (!submitted) return;
    const r = toProtocolInput(form);
    setErrors(r.ok ? {} : r.errors);
  }, [form, submitted]);

  const onSave = () => {
    setSubmitted(true);
    const r = toProtocolInput(form);
    if (!r.ok) {
      setErrors(r.errors);
      return;
    }
    save.mutate(
      { id, input: r.input },
      {
        onSuccess: () => router.back(),
        onError: (e) => Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.'),
      },
    );
  };

  const title = id ? 'Edit protocol' : 'New protocol';

  if (id && !loaded) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title }} />
        {existing.isError || (existing.isFetched && !existing.data) ? (
          <Text color="textSecondary">This protocol could not be found.</Text>
        ) : (
          <ActivityIndicator />
        )}
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title }} />
      <Screen safeTop={false} footer={<Button title={id ? 'Save changes' : 'Save protocol'} loading={save.isPending} onPress={onSave} haptic />}>
        <PeptidePicker
          peptideSlug={form.peptideSlug}
          customName={form.customName}
          onChange={update}
          error={errors.name}
        />

        <NumberField
          label="Dose"
          unit={form.doseUnit === 'iu' ? 'IU' : form.doseUnit}
          placeholder={form.doseUnit === 'mg' ? '0.25' : '250'}
          value={form.dose}
          onChangeText={(dose) => update({ dose })}
          error={errors.dose}
        />
        <SegmentedControl
          accessibilityLabel="Dose unit"
          options={UNIT_OPTIONS}
          value={form.doseUnit}
          onChange={(doseUnit) => update({ doseUnit })}
        />

        <ScheduleSection form={form} update={update} error={errors.schedule} />
        <TimesSection times={form.times} onChange={(times) => update({ times })} error={errors.times} />

        <VialSection vialId={form.vialId} peptideSlug={form.peptideSlug} onChange={(vialId) => update({ vialId })} />

        <View style={styles.group}>
          <FieldLabel>Dates</FieldLabel>
          <View style={styles.dateRow}>
            <Text style={styles.flex}>Start</Text>
            <DateTimeField label="Start date" mode="date" value={form.startDate} onChange={(startDate) => update({ startDate })} />
          </View>
          <SwitchRow label="Has an end date" value={form.hasEndDate} onValueChange={(hasEndDate) => update({ hasEndDate })} />
          {form.hasEndDate ? (
            <View style={styles.dateRow}>
              <Text style={styles.flex}>End</Text>
              <DateTimeField
                label="End date"
                mode="date"
                value={form.endDate}
                minimumDate={form.startDate}
                onChange={(endDate) => update({ endDate })}
              />
            </View>
          ) : null}
          {errors.endDate ? (
            <Text variant="caption" color="danger">
              {errors.endDate}
            </Text>
          ) : null}
        </View>

        {errors.general ? (
          <Text variant="callout" color="danger">
            {errors.general}
          </Text>
        ) : null}

        <TextField
          label="Notes (optional)"
          placeholder="Anything you want to remember"
          value={form.notes}
          onChangeText={(notes) => update({ notes })}
          multiline
          maxLength={500}
          error={errors.notes}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  group: { gap: Spacing.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
});
