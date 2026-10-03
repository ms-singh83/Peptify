import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Option = { readonly id: string; readonly label: string };

type Props = { options: readonly Option[]; value: string | null; onChange: (id: string) => void; label: string };

export function OptionList({ options, value, onChange, label }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.list} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.id)}
            style={[
              styles.option,
              {
                backgroundColor: selected ? theme.primaryMuted : theme.surface,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}>
            <Text variant="headline" color={selected ? 'primary' : 'text'}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.sm },
  option: {
    minHeight: MinTapTarget + 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
});
