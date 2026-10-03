import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { fromTime12, toTime12 } from '@/lib/format';
import type { TimeOfDay } from '@/types/domain';

import { Text } from './text';
import { Wheel } from './wheel';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'] as const;

type Props = { value: TimeOfDay; onChange: (t: TimeOfDay) => void };

/** Hour / minute / AM-PM wheels, minute precision. */
export function TimePicker({ value, onChange }: Props) {
  const t = toTime12(value);
  return (
    <View style={styles.row}>
      <Wheel label="Hour" items={HOURS} index={t.hour - 1} onChange={(i) => onChange(fromTime12({ ...t, hour: i + 1 }))} />
      <Text variant="title2" color="textSecondary">
        :
      </Text>
      <Wheel label="Minute" items={MINUTES} index={t.minute} onChange={(i) => onChange(fromTime12({ ...t, minute: i }))} />
      <Wheel
        label="AM or PM"
        items={PERIODS}
        index={t.pm ? 1 : 0}
        onChange={(i) => onChange(fromTime12({ ...t, pm: i === 1 }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
});
