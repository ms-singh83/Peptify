import { StyleSheet, View } from 'react-native';

import { Button, DateTimeField, FieldLabel, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { formatTime } from '@/lib/format';
import type { TimeOfDay } from '@/types/domain';

type Props = {
  times: TimeOfDay[];
  onChange: (times: TimeOfDay[]) => void;
  error?: string;
};

const MAX_TIMES = 6;
const SUGGESTED: TimeOfDay[] = ['08:00', '20:00', '12:00', '16:00', '06:00', '22:00'];

export function TimesSection({ times, onChange, error }: Props) {
  const nextTime = SUGGESTED.find((t) => !times.includes(t)) ?? '12:00';

  return (
    <View style={styles.wrap}>
      <FieldLabel>Time of day</FieldLabel>
      {times.map((t, i) => (
        <View key={`${i}-${t}`} style={styles.row}>
          <Text style={styles.flex}>Dose {i + 1}</Text>
          <DateTimeField
            label={`Dose ${i + 1} time`}
            mode="time"
            value={t}
            onChange={(v) => onChange(times.map((x, j) => (j === i ? v : x)))}
          />
          {times.length > 1 ? (
            <Button
              title="Remove"
              accessibilityLabel={`Remove ${formatTime(t)}`}
              variant="ghost"
              size="sm"
              onPress={() => onChange(times.filter((_, j) => j !== i))}
            />
          ) : null}
        </View>
      ))}
      {times.length < MAX_TIMES ? (
        <Button title="Add another time" variant="secondary" size="sm" onPress={() => onChange([...times, nextTime])} />
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
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  flex: { flex: 1 },
});
