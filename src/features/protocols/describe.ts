import { displayName } from '@/features/library/peptides';
import { describeSchedule, describeTimes } from '@/lib/format';
import { formatAmount } from '@/lib/units';
import type { Protocol } from '@/types/domain';

export const protocolTitle = (p: Protocol) => displayName(p);

/** "250 mcg · Daily · 8:00 AM" */
export const protocolSummary = (p: Protocol) =>
  [formatAmount(p.doseAmount, p.doseUnit), describeSchedule(p.schedule), describeTimes(p.times)].join(' · ');
