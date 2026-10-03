import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = { label: string; checked: boolean; onChange: (v: boolean) => void };

export function Checkbox({ label, checked, onChange }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      style={styles.row}>
      <View
        style={[
          styles.box,
          { borderColor: checked ? theme.primary : theme.textSecondary, backgroundColor: checked ? theme.primary : 'transparent' },
        ]}>
        {checked ? (
          <Text variant="callout" color="onPrimary" style={styles.tick}>
            ✓
          </Text>
        ) : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: MinTapTarget },
  box: { width: 26, height: 26, borderRadius: Radius.sm - 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tick: { fontWeight: '700', lineHeight: 20 },
  label: { flex: 1 },
});
