import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { Button } from './button';
import { Text } from './text';

type Props = {
  icon?: ReactNode;
  title: string;
  body?: string;
  actionTitle?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, body, actionTitle, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      {icon}
      <Text variant="title2" style={styles.center}>
        {title}
      </Text>
      {body ? (
        <Text color="textSecondary" style={styles.center}>
          {body}
        </Text>
      ) : null}
      {actionTitle && onAction ? <Button title={actionTitle} onPress={onAction} style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xxxl, paddingHorizontal: Spacing.xl },
  center: { textAlign: 'center' },
  button: { marginTop: Spacing.md, alignSelf: 'stretch' },
});
