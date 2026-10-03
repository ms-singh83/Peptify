import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Chip, FieldLabel, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { displayName } from '@/features/library/peptides';
import { useActiveVials, useVial } from '@/features/vials/hooks';
import { round } from '@/lib/units';

type Props = { vialId: string | null; peptideSlug: string | null; onChange: (vialId: string | null) => void };

/** Optional: link a vial so each logged dose is subtracted from it. */
export function VialSection({ vialId, peptideSlug, onChange }: Props) {
  const { data: vials = [] } = useActiveVials();
  const linked = useVial(vialId);
  const linkedInactive = linked.data && linked.data.status !== 'active' ? linked.data : null;
  // Same peptide first — that's almost always the right one.
  const sorted = [...vials].sort((a, b) => Number(b.peptideSlug === peptideSlug) - Number(a.peptideSlug === peptideSlug));

  return (
    <View style={styles.wrap}>
      <FieldLabel>Draw from vial (optional)</FieldLabel>
      {linkedInactive ? (
        <Text variant="callout" color="warning">
          Linked vial ({displayName(linkedInactive)}) is {linkedInactive.status}. Doses won&apos;t be subtracted until you pick
          another vial.
        </Text>
      ) : null}
      {vials.length || linkedInactive ? (
        <View style={styles.chips}>
          <Chip label="None" selected={vialId === null} onPress={() => onChange(null)} />
          {sorted.map((v) => (
            <Chip
              key={v.id}
              label={`${displayName(v)} · ${round(v.remainingMcg / 1000, 2)} mg left`}
              selected={vialId === v.id}
              onPress={() => onChange(v.id)}
            />
          ))}
        </View>
      ) : (
        <Text variant="callout" color="textSecondary">
          Add a vial to have doses subtracted automatically.
        </Text>
      )}
      <Button title="Add a vial" variant="ghost" size="sm" onPress={() => router.push('/vials/form')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
