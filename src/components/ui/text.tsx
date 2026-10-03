import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { Type, type ThemeColor, type TypeVariant } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: ThemeColor;
};

export function Text({ variant = 'body', color = 'text', style, ...rest }: TextProps) {
  const theme = useTheme();
  return <RNText style={[Type[variant], { color: theme[color] }, style]} {...rest} />;
}
