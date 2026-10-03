import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatTime } from '@/lib/format';

import { Button } from './button';
import { CalendarPicker } from './calendar-picker';
import { Text } from './text';
import { TimePicker } from './time-picker';

type Props = {
  label: string;
  mode: 'date' | 'time';
  /** `YYYY-MM-DD` for date, `HH:mm` for time. */
  value: string;
  onChange: (value: string) => void;
  /** `YYYY-MM-DD`; earlier days are disabled (date mode). */
  minimumDate?: string;
};

const display = (mode: Props['mode'], v: string) => (mode === 'date' ? format(parseISO(v), 'd MMM yyyy') : formatTime(v));

/**
 * Always-visible value button that opens a bottom sheet with a JS picker
 * (time wheels or a month calendar) and Cancel/Done. Pure JS on purpose: no native
 * module means it can never render as "Unimplemented component" in a stale build,
 * and it looks the same on iOS and Android.
 */
export function DateTimeField({ label, mode, value, onChange, minimumDate }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const shown = display(mode, value);

  const openPicker = () => {
    setDraft(value);
    setOpen(true);
  };
  const done = () => {
    onChange(draft);
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
          <View style={styles.body}>
            {mode === 'time' ? (
              <TimePicker value={draft} onChange={setDraft} />
            ) : (
              <CalendarPicker value={draft} onChange={setDraft} minimumDate={minimumDate} />
            )}
          </View>
        </View>
      </Modal>
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
  body: { paddingVertical: Spacing.md },
});
