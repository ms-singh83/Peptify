import { StyleSheet, View } from 'react-native';

import { Chip, FieldLabel, NumberField, SegmentedControl, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { weekdayLabel } from '@/lib/format';
import type { ScheduleType, Weekday } from '@/types/domain';

import type { ProtocolFormState } from './form-state';

const TYPE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Days' },
  { value: 'interval', label: 'Every N' },
  { value: 'cycle', label: 'Cycle' },
] as const satisfies readonly { value: ScheduleType; label: string }[];

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7];

type Props = {
  form: ProtocolFormState;
  update: (patch: Partial<ProtocolFormState>) => void;
  error?: string;
};

export function ScheduleSection({ form, update, error }: Props) {
  const toggleDay = (d: Weekday) =>
    update({
      weekdays: form.weekdays.includes(d) ? form.weekdays.filter((x) => x !== d) : [...form.weekdays, d].sort(),
    });

  return (
    <View style={styles.wrap}>
      <FieldLabel>Schedule</FieldLabel>
      <SegmentedControl
        accessibilityLabel="Schedule type"
        options={TYPE_OPTIONS}
        value={form.scheduleType}
        onChange={(scheduleType) => update({ scheduleType })}
      />

      {form.scheduleType === 'weekdays' ? (
        <View style={styles.days}>
          {WEEKDAYS.map((d) => (
            <Chip key={d} label={weekdayLabel(d)} selected={form.weekdays.includes(d)} onPress={() => toggleDay(d)} />
          ))}
        </View>
      ) : null}

      {form.scheduleType === 'interval' ? (
        <NumberField
          label="Every how many days?"
          unit="days"
          value={form.intervalDays}
          onChangeText={(intervalDays) => update({ intervalDays })}
          hint="Counted from the start date"
        />
      ) : null}

      {form.scheduleType === 'cycle' ? (
        <View style={styles.row}>
          <View style={styles.flex}>
            <NumberField label="Days on" unit="days" value={form.onDays} onChangeText={(onDays) => update({ onDays })} />
          </View>
          <View style={styles.flex}>
            <NumberField label="Days off" unit="days" value={form.offDays} onChangeText={(offDays) => update({ offDays })} />
          </View>
        </View>
      ) : null}

      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md },
  flex: { flex: 1 },
});
