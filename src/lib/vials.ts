import { differenceInCalendarDays, parseISO } from 'date-fns';

import type { Vial } from '@/types/domain';

export const LOW_STOCK_DOSES = 3;
export const EXPIRY_WARNING_DAYS = 3;

export type VialWarning = 'empty' | 'low' | 'expired' | 'expiring';

export function remainingFraction(v: Pick<Vial, 'remainingMcg' | 'totalMg'>): number {
  if (v.totalMg <= 0) return 0;
  return Math.max(0, Math.min(1, v.remainingMcg / (v.totalMg * 1000)));
}

/** Whole doses left at `doseMcg` each (null when unknown). */
export function dosesLeft(v: Pick<Vial, 'remainingMcg'>, doseMcg: number | null): number | null {
  if (!doseMcg || doseMcg <= 0) return null;
  return Math.floor(v.remainingMcg / doseMcg + 1e-9);
}

export function daysUntilExpiry(v: Pick<Vial, 'expiresAt'>, now: Date): number | null {
  return v.expiresAt ? differenceInCalendarDays(parseISO(v.expiresAt), now) : null;
}

/** Most important first. */
export function vialWarnings(v: Vial, now: Date, doseMcg: number | null): VialWarning[] {
  const out: VialWarning[] = [];
  if (v.remainingMcg <= 0 || v.status === 'empty') out.push('empty');
  else {
    const left = dosesLeft(v, doseMcg);
    if (left !== null && left < LOW_STOCK_DOSES) out.push('low');
  }
  const days = daysUntilExpiry(v, now);
  if (days !== null) {
    if (days < 0) out.push('expired');
    else if (days <= EXPIRY_WARNING_DAYS) out.push('expiring');
  }
  return out;
}
