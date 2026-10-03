import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

export function ProBadge() {
  const theme = useTheme();
  return (
    <View accessible accessibilityLabel="Pro feature" style={[styles.badge, { backgroundColor: theme.pro }]}>
      <Text variant="caption" color="background" style={styles.label}>
        PRO
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: Radius.pill, paddingHorizontal: Spacing.sm, paddingVertical: 2, alignSelf: 'flex-start' },
  label: { fontWeight: '700', letterSpacing: 0.5 },
});
