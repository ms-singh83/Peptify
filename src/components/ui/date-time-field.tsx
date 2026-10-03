import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useIsDark, useTheme } from '@/hooks/use-theme';
import { toISODate } from '@/lib/dates';
import { formatTime } from '@/lib/format';

import { Button } from './button';
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

/** Native wheel height on iOS; set explicitly so the picker never collapses to 0 in a sheet. */
const IOS_PICKER_HEIGHT = 216;

/**
 * Always-visible value button. Tap → iOS: bottom sheet with a wheel picker (Done/Cancel);
 * Android: the native dialog. (The iOS inline "compact" picker could render 0px wide under
 * the new architecture, so we don't use it.)
 */
export function DateTimeField({ label, mode, value, onChange, minimumDate }: Props) {
  const theme = useTheme();
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => toDate(mode, value));
  const min = minimumDate ? parseISO(minimumDate) : undefined;
  const shown = display(mode, value);

  const openPicker = () => {
    const current = toDate(mode, value);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode,
        minimumDate: min,
        onChange: (e: DateTimePickerEvent, d?: Date) => {
          if (e.type === 'set' && d) onChange(fromDate(mode, d));
        },
      });
      return;
    }
    setDraft(current);
    setOpen(true);
  };

  const done = () => {
    onChange(fromDate(mode, draft));
    setOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${shown}`}
        accessibilityHint={`Opens a ${mode} picker`}
        onPress={openPicker}
        style={({ pressed }) => [
          styles.field,
          { backgroundColor: theme.surface, borderColor: theme.border },
          pressed && styles.pressed,
        ]}>
        <Text variant="headline" color="primary">
          {shown}
        </Text>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close picker"
            style={[styles.backdrop, { backgroundColor: theme.overlay }]}
            onPress={() => setOpen(false)}
          />
          <View style={[styles.sheet, { backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing.sm }]}>
            <View style={[styles.toolbar, { borderBottomColor: theme.border }]}>
              <Button title="Cancel" variant="ghost" size="sm" onPress={() => setOpen(false)} />
              <Text variant="headline">{label}</Text>
              <Button title="Done" variant="ghost" size="sm" onPress={done} />
            </View>
            <DateTimePicker
              value={draft}
              mode={mode}
              display="spinner"
              minimumDate={min}
              onChange={(_e, d) => d && setDraft(d)}
              themeVariant={isDark ? 'dark' : 'light'}
              textColor={theme.text}
              style={styles.picker}
            />
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: MinTapTarget,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: { opacity: 0.6 },
  backdrop: { flex: 1 },
  sheet: { borderTopLeftRadius: Radius.md, borderTopRightRadius: Radius.md },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  picker: { width: '100%', height: IOS_PICKER_HEIGHT },
});
