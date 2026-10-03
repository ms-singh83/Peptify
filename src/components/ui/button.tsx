import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { MinTapTarget, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Text } from './text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type Props = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  /** Light haptic tap on press (iOS/Android). */
  haptic?: boolean;
  size?: 'md' | 'sm';
};

const textColor: Record<Variant, ThemeColor> = {
  primary: 'onPrimary',
  secondary: 'primary',
  ghost: 'textSecondary',
  destructive: 'danger',
};

export function Button({
  title,
  variant = 'primary',
  loading,
  haptic,
  size = 'md',
  disabled,
  onPress,
  style,
  ...rest
}: Props) {
  const theme = useTheme();
  const bg =
    variant === 'primary' ? theme.primary : variant === 'secondary' ? theme.primaryMuted : 'transparent';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={(e) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={(state) => [
        styles.base,
        size === 'sm' && styles.sm,
        { backgroundColor: bg, opacity: isDisabled ? 0.5 : state.pressed ? 0.8 : 1 },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={theme[textColor[variant]]} />
      ) : (
        <Text variant={size === 'sm' ? 'callout' : 'headline'} color={textColor[variant]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MinTapTarget + 6,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: { minHeight: MinTapTarget, paddingHorizontal: Spacing.lg },
});
