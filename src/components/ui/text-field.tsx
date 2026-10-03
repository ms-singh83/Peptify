import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { MinTapTarget, Radius, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type Props = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string | null;
};

export function TextField({ label, error, multiline, accessibilityLabel, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="callout" color="textSecondary">
          {label}
        </Text>
      ) : null}
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? undefined}
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        style={[
          Type.body,
          styles.input,
          multiline && styles.multiline,
          { color: theme.text, backgroundColor: theme.surface, borderColor: error ? theme.danger : theme.border },
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  input: {
    minHeight: MinTapTarget + 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
});
