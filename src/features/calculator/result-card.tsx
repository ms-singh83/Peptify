import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { Spacing, TabularNums } from '@/constants/theme';
import type { ReconResult } from '@/lib/recon';
import { round } from '@/lib/units';

import { Syringe } from './syringe';

type Props = { result: ReconResult; syringe: number };

const fmt = (n: number, d = 2) => round(n, d).toLocaleString();

export function ResultCard({ result, syringe }: Props) {
  const { drawUnits, drawMl, concentrationMcgPerMl, dosesPerVial, exceedsSyringe } = result;
  const tiny = drawUnits < 2;

  return (
    <Card accessibilityLiveRegion="polite">
      <Text variant="callout" color="textSecondary">
        Draw to
      </Text>
      <Text variant="largeTitle" color="primary" style={TabularNums}>
        {fmt(drawUnits, 1)} units
      </Text>
      <Text color="textSecondary" style={TabularNums}>
        {fmt(drawMl, 3)} mL on a U-100 syringe
      </Text>

      <Syringe units={drawUnits} capacity={syringe} />

      {exceedsSyringe ? (
        <Text variant="callout" color="danger">
          This is more than a {syringe}-unit syringe holds.
        </Text>
      ) : null}
      {tiny ? (
        <Text variant="callout" color="warning">
          Under 2 units is hard to measure precisely on most syringes.
        </Text>
      ) : null}

      <View style={styles.stats}>
        <Stat label="Concentration" value={`${fmt(concentrationMcgPerMl, 0)} mcg/mL`} />
        <Stat label="Doses per vial" value={String(dosesPerVial)} />
      </View>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
      <Text variant="headline" style={TabularNums}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm },
  stat: { flex: 1, gap: 2 },
});
