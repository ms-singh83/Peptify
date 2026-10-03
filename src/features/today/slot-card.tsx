import { format, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { displayName } from '@/features/library/peptides';
import { useTheme } from '@/hooks/use-theme';
import { SITE_LABELS } from '@/lib/sites';
import type { SlotStatus, TodaySlot } from '@/lib/today';
import { formatAmount } from '@/lib/units';

const STATUS: Record<SlotStatus, { label: string; color: ThemeColor }> = {
  taken: { label: 'Taken', color: 'success' },
  skipped: { label: 'Skipped', color: 'warning' },
  due: { label: 'Due', color: 'primary' },
  upcoming: { label: 'Upcoming', color: 'textSecondary' },
};

type Props = {
  slot: TodaySlot;
  busy: boolean;
  onLog: (status: 'taken' | 'skipped') => void;
  onUndo: () => void;
  /** Opens the dose sheet for site/time/amount details. */
  onOpen: () => void;
};

export function SlotCard({ slot, busy, onLog, onUndo, onOpen }: Props) {
  const theme = useTheme();
  const { protocol, dose, status } = slot;
  const name = displayName(protocol);
  const amount = formatAmount(protocol.doseAmount, protocol.doseUnit);
  const logged = status === 'taken' || status === 'skipped';
  const s = STATUS[status];

  return (
    <Card style={logged && { borderLeftWidth: 4, borderLeftColor: theme[s.color] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${amount}, ${s.label}`}
        accessibilityHint="Opens details to set site, time or amount"
        onPress={onOpen}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}>
        <View style={styles.flex}>
          <Text variant="headline">{name}</Text>
          <Text color="textSecondary">{amount}</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: theme.background }]}>
          <Text variant="caption" color={s.color} style={styles.pillText}>
            {status === 'taken' ? '✓ ' : ''}
            {s.label}
          </Text>
        </View>
      </Pressable>

      {logged ? (
        <View style={styles.row}>
          <Text variant="callout" color="textSecondary" style={styles.flex}>
            {status === 'taken' && dose?.takenAt
              ? `Logged at ${format(parseISO(dose.takenAt), 'h:mm a')}${dose.site ? ` · ${SITE_LABELS[dose.site]}` : ''}`
              : 'Marked as skipped'}
          </Text>
          <Button
            title="Undo"
            accessibilityLabel={`Undo ${s.label.toLowerCase()} for ${name}`}
            variant="ghost"
            size="sm"
            disabled={busy}
            onPress={onUndo}
          />
        </View>
      ) : (
        <View style={styles.row}>
          <Button
            title="Taken"
            accessibilityLabel={`Mark ${name} ${amount} as taken`}
            style={styles.flex}
            disabled={busy}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onLog('taken');
            }}
          />
          <Button
            title="Skip"
            accessibilityLabel={`Skip ${name}`}
            variant="secondary"
            disabled={busy}
            onPress={() => onLog('skipped')}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  pill: { borderRadius: Radius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  pillText: { fontWeight: '600' },
  pressed: { opacity: 0.6 },
});
