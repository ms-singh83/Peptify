import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SITE_LABELS } from '@/lib/sites';
import { INJECTION_SITES, type InjectionSite } from '@/types/domain';

type Props = {
  value: InjectionSite | null;
  suggested: InjectionSite | null;
  onChange: (site: InjectionSite | null) => void;
};

/** 2-column grid of injection sites; tap again to clear. */
export function SiteGrid({ value, suggested, onChange }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Injection site">
      {INJECTION_SITES.map((site) => {
        const selected = value === site;
        const isSuggested = suggested === site;
        return (
          <Pressable
            key={site}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${SITE_LABELS[site]}${isSuggested ? ', suggested' : ''}`}
            onPress={() => onChange(selected ? null : site)}
            style={[
              styles.cell,
              {
                backgroundColor: selected ? theme.primaryMuted : theme.surface,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}>
            <Text variant="callout" color={selected ? 'primary' : 'text'} style={selected && styles.bold}>
              {SITE_LABELS[site]}
            </Text>
            {isSuggested ? (
              <Text variant="caption" color="primary">
                Suggested · least recent
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  cell: {
    width: '48.5%',
    minHeight: MinTapTarget + 8,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
  },
  bold: { fontWeight: '600' },
});
