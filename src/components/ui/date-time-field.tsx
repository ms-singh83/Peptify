import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useIsDark, useTheme } from '@/hooks/use-theme';
import { toISODate } from '@/lib/dates';
import { formatTime } from '@/lib/format';

import { Text } from './text';

type Props = {
  label: string;
  mode: 'date' | 'time';
  /** `YYYY-MM-DD` for date, `HH:mm` for time. */
  value: string;
  onChange: (value: string) => void;
  minimumDate?: string;
};

const toDate = (mode: Props['mode'], v: string) => (mode === 'date' ? parseISO(v) : parseISO(`2000-01-01T${v}:00`));
const fromDate = (mode: Props['mode'], d: Date) => (mode === 'date' ? toISODate(d) : format(d, 'HH:mm'));
const display = (mode: Props['mode'], v: string) => (mode === 'date' ? format(parseISO(v), 'd MMM yyyy') : formatTime(v));

/** iOS: native compact picker inline. Android: tap opens the native dialog. */
export function DateTimeField({ label, mode, value, onChange, minimumDate }: Props) {
  const theme = useTheme();
  const isDark = useIsDark();
  const date = toDate(mode, value);
  const min = minimumDate ? parseISO(minimumDate) : undefined;

  const handle = (e: DateTimePickerEvent, d?: Date) => {
    if (e.type === 'set' && d) onChange(fromDate(mode, d));
  };

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        accessibilityLabel={label}
        value={date}
        mode={mode}
        display="compact"
        minimumDate={min}
        onChange={handle}
        accentColor={theme.primary}
        themeVariant={isDark ? 'dark' : 'light'}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${display(mode, value)}`}
      onPress={() => DateTimePickerAndroid.open({ value: date, mode, minimumDate: min, onChange: handle })}
      style={[styles.field, { backgroundColor: theme.surface }]}>
      <Text variant="headline">{display(mode, value)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: MinTapTarget,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    justifyContent: 'center',
  },
});
