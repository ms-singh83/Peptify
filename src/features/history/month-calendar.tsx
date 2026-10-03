import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { MinTapTarget, Radius, Spacing, TabularNums, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { monthGrid } from '@/lib/calendar';
import type { DayStatus, DaySummary } from '@/lib/history';
import type { ISODate } from '@/types/domain';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const DOT: Record<DayStatus, { color: ThemeColor | null; label: string }> = {
  complete: { color: 'success', label: 'all taken' },
  partial: { color: 'primary', label: 'partly logged' },
  pending: { color: 'textSecondary', label: 'scheduled' },
  skipped: { color: 'warning', label: 'skipped' },
  missed: { color: 'danger', label: 'missed' },
  none: { color: null, label: 'nothing scheduled' },
};

type Props = {
  month: Date;
  days: Map<ISODate, DaySummary> | null;
  selected: ISODate | null;
  today: ISODate;
  onSelect: (date: ISODate) => void;
};

export function MonthCalendar({ month, days, selected, today, onSelect }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.week}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} variant="caption" color="textSecondary" style={styles.headCell}>
            {d}
          </Text>
        ))}
      </View>
      {monthGrid(month).map((week, wi) => (
        <View key={wi} style={styles.week}>
          {week.map((date, di) => {
            if (!date) return <View key={di} style={styles.cell} />;
            const s = days?.get(date)?.status ?? 'none';
            const dot = DOT[s];
            const isSelected = date === selected;
            const isToday = date === today;
            return (
              <Pressable
                key={date}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${date}${isToday ? ', today' : ''}, ${dot.label}`}
                onPress={() => onSelect(date)}
                style={[
                  styles.cell,
                  isSelected && { backgroundColor: theme.primaryMuted },
                  isToday && { borderColor: theme.primary, borderWidth: 1 },
                ]}>
                <Text variant="callout" style={TabularNums} color={date > today ? 'textSecondary' : 'text'}>
                  {Number(date.slice(8))}
                </Text>
                <View style={[styles.dot, { backgroundColor: dot.color ? theme[dot.color] : 'transparent' }]} />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function Legend() {
  const theme = useTheme();
  const items: DayStatus[] = ['complete', 'partial', 'skipped', 'missed'];
  return (
    <View style={styles.legend}>
      {items.map((s) => (
        <View key={s} style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: theme[DOT[s].color!] }]} />
          <Text variant="caption" color="textSecondary">
            {DOT[s].label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 2 },
  week: { flexDirection: 'row' },
  headCell: { flex: 1, textAlign: 'center', paddingVertical: Spacing.xs },
  cell: {
    flex: 1,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    gap: 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
