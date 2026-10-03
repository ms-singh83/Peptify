import { addDays, parseISO } from 'date-fns';

import type { Dose, ISODate, Protocol } from '@/types/domain';

import { toISODate } from './dates';
import { occurrences } from './schedule';

export type DayStatus = 'complete' | 'partial' | 'missed' | 'skipped' | 'pending' | 'none';

export type DaySummary = {
  date: ISODate;
  taken: number;
  skipped: number;
  /** Scheduled, in the past, nothing logged. */
  missed: number;
  /** Scheduled, not yet due or due today and still loggable. */
  open: number;
  status: DayStatus;
  doses: Dose[];
};

const doseDay = (d: Dose) => (d.scheduledFor ?? d.takenAt ?? d.createdAt).slice(0, 10);

function statusOf(s: Omit<DaySummary, 'status' | 'date' | 'doses'>): DayStatus {
  const total = s.taken + s.skipped + s.missed + s.open;
  if (total === 0) return 'none';
  if (s.missed > 0) return 'missed';
  if (s.open > 0) return s.taken + s.skipped > 0 ? 'partial' : 'pending';
  if (s.taken === 0) return 'skipped';
  return 'complete';
}

/**
 * Per-day summary for [from, to]. Rules that keep history honest:
 * - Only ACTIVE protocols generate expected slots (we don't know when others were paused).
 * - Nothing counts as missed before the protocol was created (back-dated start dates).
 * - A past day's unlogged slot is missed; today's unlogged slots stay open until midnight.
 */
export function summarizeDays(
  protocols: Protocol[],
  doses: Dose[],
  from: ISODate,
  to: ISODate,
  now: Date,
): Map<ISODate, DaySummary> {
  const today = toISODate(now);
  const days = new Map<ISODate, DaySummary>();
  for (let d = parseISO(from); toISODate(d) <= to; d = addDays(d, 1)) {
    const date = toISODate(d);
    days.set(date, { date, taken: 0, skipped: 0, missed: 0, open: 0, status: 'none', doses: [] });
  }

  const logged = new Set<string>();
  for (const dose of doses) {
    const day = days.get(doseDay(dose));
    if (!day) continue;
    day.doses.push(dose);
    if (dose.status === 'taken') day.taken += 1;
    else day.skipped += 1;
    if (dose.protocolId && dose.scheduledFor) logged.add(`${dose.protocolId}|${dose.scheduledFor}`);
  }

  for (const p of protocols) {
    if (p.status !== 'active') continue;
    const created = p.createdAt.slice(0, 10);
    for (const o of occurrences(p, from, to)) {
      if (logged.has(`${p.id}|${o.scheduledFor}`)) continue;
      const day = days.get(o.date)!;
      if (o.date < today && o.date >= created) day.missed += 1;
      else if (o.date >= today) day.open += 1;
    }
  }

  for (const day of days.values()) day.status = statusOf(day);
  return days;
}

/**
 * Consecutive days, counting back from today, where nothing was missed and at least one
 * dose was taken. Days with nothing scheduled are skipped over; today only adds to the
 * streak once complete, but an unfinished today never breaks it.
 */
export function currentStreak(days: Map<ISODate, DaySummary>, now: Date): number {
  let streak = 0;
  for (let d = now; ; d = addDays(d, -1)) {
    const day = days.get(toISODate(d));
    if (!day) break;
    const isToday = day.date === toISODate(now);
    if (day.status === 'complete') streak += 1;
    // Nothing scheduled, or a deliberate skip: neither extends nor breaks the streak.
    else if (day.status === 'none' || day.status === 'skipped') continue;
    // Today isn't over yet.
    else if (isToday) continue;
    else break;
  }
  return streak;
}
