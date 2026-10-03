import type { Dose, Protocol, TimeOfDay } from '@/types/domain';

import { toISODate, toISODateTime } from './dates';
import { isScheduledOn, occurrences, type Occurrence } from './schedule';

/** `due` = time has passed and nothing logged yet (still loggable today). */
export type SlotStatus = 'taken' | 'skipped' | 'due' | 'upcoming';

export type TodaySlot = {
  occurrence: Occurrence;
  protocol: Protocol;
  dose: Dose | null;
  status: SlotStatus;
};

/**
 * Merge today's schedule with today's logged doses.
 * Shows active protocols scheduled today, plus any slot already logged today
 * (so pausing a protocol doesn't hide what you already did).
 */
export function buildTodaySlots(protocols: Protocol[], doses: Dose[], now: Date): TodaySlot[] {
  const today = toISODate(now);
  const nowISO = toISODateTime(now);
  const doseBySlot = new Map(
    doses.filter((d) => d.protocolId && d.scheduledFor).map((d) => [`${d.protocolId}|${d.scheduledFor}`, d]),
  );

  const slots: TodaySlot[] = [];
  for (const p of protocols) {
    const occ = isScheduledOn(p, today) ? occurrences(p, today, today) : [];
    for (const o of occ) {
      const dose = doseBySlot.get(`${p.id}|${o.scheduledFor}`) ?? null;
      if (p.status !== 'active' && !dose) continue;
      const status: SlotStatus = dose ? dose.status : o.scheduledFor <= nowISO ? 'due' : 'upcoming';
      slots.push({ occurrence: o, protocol: p, dose, status });
    }
  }
  return slots.sort((a, b) => (a.occurrence.scheduledFor < b.occurrence.scheduledFor ? -1 : 1));
}

export function groupSlotsByTime(slots: TodaySlot[]): { time: TimeOfDay; slots: TodaySlot[] }[] {
  const groups: { time: TimeOfDay; slots: TodaySlot[] }[] = [];
  for (const s of slots) {
    const last = groups[groups.length - 1];
    if (last && last.time === s.occurrence.time) last.slots.push(s);
    else groups.push({ time: s.occurrence.time, slots: [s] });
  }
  return groups;
}
