import { Text } from './text';

/** Section label used above grouped form controls. */
export function FieldLabel({ children }: { children: string }) {
  return (
    <Text variant="callout" color="textSecondary">
      {children}
    </Text>
  );
}
