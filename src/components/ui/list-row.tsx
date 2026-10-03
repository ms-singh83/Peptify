import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MinTapTarget, Spacing } from '@/constants/theme';

import { Text } from './text';

type Props = {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  accessibilityHint?: string;
};

export function ListRow({ title, subtitle, left, right, onPress, accessibilityHint }: Props) {
  const content = (
    <>
      {left}
      <View style={styles.text}>
        <Text variant="headline" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="callout" color="textSecondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, minHeight: MinTapTarget + 12, paddingVertical: Spacing.sm },
  text: { flex: 1, gap: 2 },
  pressed: { opacity: 0.6 },
});
