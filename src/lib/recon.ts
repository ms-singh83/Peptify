import type { DoseUnit } from '@/types/domain';

import { toMcg } from './units';

export type ReconInput = {
  /** Peptide in the vial, mg. */
  vialMg: number;
  /** Bacteriostatic water added, mL. */
  waterMl: number;
  /** Desired dose amount, in `doseUnit`. */
  dose: number;
  doseUnit: DoseUnit;
  /** Syringe scale. U-100 insulin syringe = 100 units per mL. */
  unitsPerMl?: number;
  /** Syringe capacity in units (e.g. 30, 50, 100). */
  syringeUnits?: number;
};

export type ReconResult = {
  concentrationMcgPerMl: number;
  drawMl: number;
  drawUnits: number;
  dosesPerVial: number;
  exceedsSyringe: boolean;
};

const isPositive = (n: number) => Number.isFinite(n) && n > 0;

/**
 * Pure reconstitution math. Returns null when the inputs can't produce a valid draw
 * (non-positive numbers, IU doses, or a dose bigger than the vial).
 */
export function reconstitute({
  vialMg,
  waterMl,
  dose,
  doseUnit,
  unitsPerMl = 100,
  syringeUnits = 100,
}: ReconInput): ReconResult | null {
  if (![vialMg, waterMl, dose, unitsPerMl, syringeUnits].every(isPositive)) return null;

  const doseMcg = toMcg(dose, doseUnit);
  const vialMcg = vialMg * 1000;
  if (doseMcg === null || doseMcg > vialMcg) return null;

  const concentrationMcgPerMl = vialMcg / waterMl;
  const drawMl = doseMcg / concentrationMcgPerMl;
  const drawUnits = drawMl * unitsPerMl;

  return {
    concentrationMcgPerMl,
    drawMl,
    drawUnits,
    // small epsilon so 900/300 style float noise (2.9999999) doesn't floor to 2
    dosesPerVial: Math.floor(vialMcg / doseMcg + 1e-9),
    exceedsSyringe: drawUnits > syringeUnits + 1e-9,
  };
}
