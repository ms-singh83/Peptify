import { StyleSheet, View } from 'react-native';

import { Button, Card, Disclaimer, NumberField, Screen, SegmentedControl, Text } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ResultCard } from '@/features/calculator/result-card';
import { SYRINGE_SIZES, useCalculator, type CalcDoseUnit, type SyringeSize } from '@/features/calculator/use-calculator';

const UNIT_OPTIONS = [
  { value: 'mcg', label: 'mcg' },
  { value: 'mg', label: 'mg' },
] as const satisfies readonly { value: CalcDoseUnit; label: string }[];

const SYRINGE_OPTIONS = SYRINGE_SIZES.map((s) => ({ value: String(s), label: `${s} units` }));

export default function CalculatorScreen() {
  const { fields, set, result, errors, reset } = useCalculator();
  const hasInput = !!(fields.vialMg || fields.waterMl || fields.dose);

  return (
    <Screen
      title="Calculator"
      subtitle="Reconstitution & units to draw"
      headerRight={hasInput ? <Button title="Clear" accessibilityLabel="Clear calculator" variant="ghost" size="sm" onPress={reset} /> : null}>
      <NumberField label="Peptide in vial" unit="mg" placeholder="5" value={fields.vialMg} onChangeText={set.setVialMg} error={errors.vialMg} />
      <NumberField
        label="Bacteriostatic water added"
        unit="mL"
        placeholder="2"
        value={fields.waterMl}
        onChangeText={set.setWaterMl}
        error={errors.waterMl}
      />
      <View style={styles.doseRow}>
        <View style={styles.flex}>
          <NumberField
            label="Dose"
            unit={fields.doseUnit}
            placeholder={fields.doseUnit === 'mcg' ? '250' : '0.25'}
            value={fields.dose}
            onChangeText={set.setDose}
            error={errors.dose}
          />
        </View>
        <View style={styles.unitPicker}>
          <SegmentedControl
            accessibilityLabel="Dose unit"
            options={UNIT_OPTIONS}
            value={fields.doseUnit}
            onChange={set.setDoseUnit}
          />
        </View>
      </View>

      <View style={styles.syringe}>
        <Text variant="callout" color="textSecondary">
          Syringe size (U-100)
        </Text>
        <SegmentedControl
          accessibilityLabel="Syringe size"
          options={SYRINGE_OPTIONS}
          value={String(fields.syringe)}
          onChange={(v) => set.setSyringe(Number(v) as SyringeSize)}
        />
      </View>

      {result ? (
        <ResultCard result={result} syringe={fields.syringe} />
      ) : (
        <Card>
          <Text color="textSecondary">Enter the vial amount, water added and your dose to see how many units to draw.</Text>
        </Card>
      )}

      <Disclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  doseRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  unitPicker: { width: 110, marginTop: 24 },
  syringe: { gap: Spacing.xs },
});
