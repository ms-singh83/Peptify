import { Pressable, StyleSheet } from 'react-native';

import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      hitSlop={6}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primaryMuted : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}>
      <Text variant="callout" color={selected ? 'primary' : 'text'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MinTapTarget - 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
