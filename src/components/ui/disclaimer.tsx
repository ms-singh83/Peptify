import { Text } from './text';

export const DISCLAIMER_TEXT =
  'For tracking and education only. Not medical advice. Peptify does not recommend any substance or dose. Always consult a licensed healthcare professional.';

export function Disclaimer() {
  return (
    <Text variant="caption" color="textSecondary" accessibilityRole="text">
      {DISCLAIMER_TEXT}
    </Text>
  );
}
