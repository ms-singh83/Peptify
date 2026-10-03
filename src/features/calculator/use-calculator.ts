import { useMemo, useState } from 'react';

import { parseDecimal } from '@/lib/number';
import { reconstitute } from '@/lib/recon';

export const SYRINGE_SIZES = [30, 50, 100] as const;
export type SyringeSize = (typeof SYRINGE_SIZES)[number];
export type CalcDoseUnit = 'mcg' | 'mg';

export function useCalculator() {
  const [vialMg, setVialMg] = useState('');
  const [waterMl, setWaterMl] = useState('');
  const [dose, setDose] = useState('');
  const [doseUnit, setDoseUnit] = useState<CalcDoseUnit>('mcg');
  const [syringe, setSyringe] = useState<SyringeSize>(100);

  const parsed = {
    vialMg: parseDecimal(vialMg),
    waterMl: parseDecimal(waterMl),
    dose: parseDecimal(dose),
  };
  const complete = parsed.vialMg !== null && parsed.waterMl !== null && parsed.dose !== null;

  const result = useMemo(
    () =>
      complete
        ? reconstitute({
            vialMg: parsed.vialMg!,
            waterMl: parsed.waterMl!,
            dose: parsed.dose!,
            doseUnit,
            syringeUnits: syringe,
          })
        : null,
    [complete, parsed.vialMg, parsed.waterMl, parsed.dose, doseUnit, syringe],
  );

  // Field-level messages only once the user has typed something.
  const errors = {
    vialMg: vialMg && (parsed.vialMg === null || parsed.vialMg <= 0) ? 'Enter the mg in the vial' : null,
    waterMl: waterMl && (parsed.waterMl === null || parsed.waterMl <= 0) ? 'Enter the mL of water added' : null,
    dose:
      dose && (parsed.dose === null || parsed.dose <= 0)
        ? 'Enter your dose'
        : complete && !result
          ? 'Dose is larger than the whole vial'
          : null,
  };

  return {
    fields: { vialMg, waterMl, dose, doseUnit, syringe },
    set: { setVialMg, setWaterMl, setDose, setDoseUnit, setSyringe },
    result,
    errors,
    reset: () => {
      setVialMg('');
      setWaterMl('');
      setDose('');
    },
  };
}
