import { StyleSheet, Switch, View } from 'react-native';

import { MinTapTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type Props = { label: string; value: boolean; onValueChange: (v: boolean) => void };

export function SwitchRow({ label, value, onValueChange }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: theme.primary, false: theme.border }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: MinTapTarget, gap: Spacing.md },
  label: { flex: 1 },
});
