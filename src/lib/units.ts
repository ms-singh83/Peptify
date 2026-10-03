import type { DoseUnit } from '@/types/domain';

const MCG_PER: Record<Exclude<DoseUnit, 'iu'>, number> = { mcg: 1, mg: 1000 };

/** Convert to micrograms. IU has no universal mass conversion, so returns null. */
export function toMcg(amount: number, unit: DoseUnit): number | null {
  if (unit === 'iu') return null;
  return amount * MCG_PER[unit];
}

/** Convert micrograms to `unit`. Returns null for IU. */
export function fromMcg(mcg: number, unit: DoseUnit): number | null {
  if (unit === 'iu') return null;
  return mcg / MCG_PER[unit];
}

/** Round to at most `decimals` places, dropping trailing zeros. */
export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}

export function formatAmount(value: number, unit: DoseUnit, decimals = 2): string {
  return `${round(value, decimals)} ${unit === 'iu' ? 'IU' : unit}`;
}
