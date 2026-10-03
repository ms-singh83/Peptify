import { format, parseISO } from 'date-fns';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { Radius, Spacing, TabularNums, type ThemeColor } from '@/constants/theme';
import { displayName } from '@/features/library/peptides';
import { useTheme } from '@/hooks/use-theme';
import { round } from '@/lib/units';
import { daysUntilExpiry, dosesLeft, remainingFraction, vialWarnings, type VialWarning } from '@/lib/vials';
import type { Vial } from '@/types/domain';

const WARNING: Record<VialWarning, { label: string; color: ThemeColor }> = {
  empty: { label: 'Empty', color: 'danger' },
  low: { label: 'Running low', color: 'warning' },
  expired: { label: 'Past expiry date', color: 'danger' },
  expiring: { label: 'Expires soon', color: 'warning' },
};

type Props = { vial: Vial; doseMcg: number | null; now: Date; onPress: () => void };

export function VialCard({ vial, doseMcg, now, onPress }: Props) {
  const theme = useTheme();
  const fraction = remainingFraction(vial);
  const warnings = vialWarnings(vial, now, doseMcg);
  const left = dosesLeft(vial, doseMcg);
  const days = daysUntilExpiry(vial, now);
  const barColor = warnings.includes('empty') || warnings.includes('expired') ? theme.danger : warnings.length ? theme.warning : theme.success;
  const name = displayName(vial);
  const remaining = `${round(vial.remainingMcg / 1000, 2)} of ${round(vial.totalMg, 2)} mg left`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${remaining}${warnings.length ? `, ${warnings.map((w) => WARNING[w].label).join(', ')}` : ''}`}
      onPress={onPress}>
      {({ pressed }) => (
        <Card style={[pressed && styles.pressed, vial.status !== 'active' && styles.inactive]}>
          <View style={styles.row}>
            <Text variant="headline" style={styles.flex}>
              {name}
            </Text>
            {vial.status !== 'active' ? (
              <Text variant="caption" color="textSecondary">
                {vial.status === 'empty' ? 'Empty' : 'Discarded'}
              </Text>
            ) : null}
          </View>
          <View style={[styles.track, { backgroundColor: theme.border }]}>
            <View style={[styles.fill, { width: `${fraction * 100}%`, backgroundColor: barColor }]} />
          </View>
          <Text variant="callout" color="textSecondary" style={TabularNums}>
            {remaining}
            {left !== null ? ` · about ${left} ${left === 1 ? 'dose' : 'doses'}` : ''}
          </Text>
          {vial.waterMl === null ? (
            <Text variant="caption" color="textSecondary">
              Not reconstituted yet
            </Text>
          ) : vial.expiresAt ? (
            <Text variant="caption" color="textSecondary">
              Expiry date {format(parseISO(vial.expiresAt), 'd MMM yyyy')}
              {days !== null && days >= 0 ? ` · ${days} ${days === 1 ? 'day' : 'days'}` : ''}
            </Text>
          ) : null}
          {vial.status === 'active' && warnings.length ? (
            <View style={styles.row}>
              {warnings.map((w) => (
                <Text key={w} variant="caption" color={WARNING[w].color} style={styles.bold}>
                  {WARNING[w].label}
                </Text>
              ))}
            </View>
          ) : null}
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  flex: { flex: 1 },
  track: { height: 8, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  pressed: { opacity: 0.7 },
  inactive: { opacity: 0.6 },
  bold: { fontWeight: '600' },
});
