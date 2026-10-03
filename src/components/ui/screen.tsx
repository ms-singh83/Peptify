import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type Props = {
  title?: string;
  subtitle?: string;
  /** Rendered at the right of the title row (e.g. an add button). */
  headerRight?: ReactNode;
  children: ReactNode;
  /** Set false for screens that render their own list (FlashList). */
  scroll?: boolean;
  /** Content pinned under the scroll area, e.g. a Save button. */
  footer?: ReactNode;
} & Pick<ScrollViewProps, 'keyboardShouldPersistTaps'>;

export function Screen({ title, subtitle, headerRight, children, scroll = true, footer, ...rest }: Props) {
  const theme = useTheme();

  const header = title ? (
    <View style={styles.header}>
      <View style={styles.flex}>
        <Text variant="largeTitle" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text color="textSecondary">{subtitle}</Text> : null}
      </View>
      {headerRight}
    </View>
  ) : null;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.flex, { backgroundColor: theme.background }]}>
      {scroll ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps={rest.keyboardShouldPersistTaps ?? 'handled'}
          contentContainerStyle={styles.content}>
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content]}>
          {header}
          {children}
        </View>
      )}
      {footer ? <View style={[styles.footer, { borderTopColor: theme.border }]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  footer: { padding: Spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
});
