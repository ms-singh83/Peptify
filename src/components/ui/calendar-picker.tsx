import { addMonths, format, parseISO, startOfMonth } from 'date-fns';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MinTapTarget, Radius, Spacing, TabularNums } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { monthGrid } from '@/lib/calendar';
import { toISODate } from '@/lib/dates';
import type { ISODate } from '@/types/domain';

import { Button } from './button';
import { Text } from './text';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type Props = { value: ISODate; onChange: (d: ISODate) => void; minimumDate?: ISODate };

/** Month calendar date picker (pure JS). */
export function CalendarPicker({ value, onChange, minimumDate }: Props) {
  const theme = useTheme();
  const [month, setMonth] = useState(() => startOfMonth(parseISO(value)));
  const today = toISODate(new Date());

  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        <Button title="‹" accessibilityLabel="Previous month" variant="ghost" size="sm" onPress={() => setMonth((m) => addMonths(m, -1))} />
        <Text variant="headline" accessibilityRole="header">
          {format(month, 'MMMM yyyy')}
        </Text>
        <Button title="›" accessibilityLabel="Next month" variant="ghost" size="sm" onPress={() => setMonth((m) => addMonths(m, 1))} />
      </View>
      <View style={styles.week}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} variant="caption" color="textSecondary" style={styles.head}>
            {d}
          </Text>
        ))}
      </View>
      {monthGrid(month).map((week, wi) => (
        <View key={wi} style={styles.week}>
          {week.map((date, di) => {
            if (!date) return <View key={di} style={styles.cell} />;
            const disabled = !!minimumDate && date < minimumDate;
            const selected = date === value;
            return (
              <Pressable
                key={date}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled }}
                accessibilityLabel={format(parseISO(date), 'EEEE d MMMM yyyy') + (date === today ? ', today' : '')}
                disabled={disabled}
                onPress={() => onChange(date)}
                style={[
                  styles.cell,
                  selected && { backgroundColor: theme.primary },
                  !selected && date === today && { borderColor: theme.primary, borderWidth: 1 },
                ]}>
                <Text
                  variant="callout"
                  style={TabularNums}
                  color={selected ? 'onPrimary' : disabled ? 'border' : 'text'}>
                  {Number(date.slice(8))}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: 2 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  week: { flexDirection: 'row' },
  head: { flex: 1, textAlign: 'center', paddingVertical: Spacing.xs },
  cell: { flex: 1, minHeight: MinTapTarget, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill },
});
