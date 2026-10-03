import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { MinTapTarget, Radius, Spacing, TabularNums, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type Props = Omit<TextInputProps, 'onChangeText' | 'value' | 'keyboardType'> & {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Unit shown inside the field, e.g. "mg". */
  unit?: string;
  error?: string | null;
  hint?: string;
};

/** Decimal input. Keep the raw string in state; parse with lib/number.parseDecimal. */
export function NumberField({ label, value, onChangeText, unit, error, hint, style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <Text variant="callout" color="textSecondary">
        {label}
      </Text>
      <View
        style={[
          styles.field,
          { backgroundColor: theme.surface, borderColor: error ? theme.danger : theme.border },
        ]}>
        <TextInput
          accessibilityLabel={unit ? `${label} in ${unit}` : label}
          value={value}
          onChangeText={(t) => onChangeText(t.replace(/[^\d.,]/g, ''))}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholderTextColor={theme.textSecondary}
          style={[Type.title2, TabularNums, styles.input, { color: theme.text }, style]}
          {...rest}
        />
        {unit ? (
          <Text variant="headline" color="textSecondary">
            {unit}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textSecondary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MinTapTarget + 8,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: { flex: 1, paddingVertical: Spacing.sm },
});
