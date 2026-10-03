import { addDays, differenceInCalendarDays, getISODay, parseISO } from 'date-fns';

import type { ISODate, ISODateTime, Protocol, TimeOfDay } from '@/types/domain';

import { toISODate, toISODateTime } from './dates';

export type Occurrence = {
  protocolId: string;
  date: ISODate;
  time: TimeOfDay;
  /** `${date}T${time}:00` — the key doses are stored under. */
  scheduledFor: ISODateTime;
};

/** Parse a `YYYY-MM-DD` string as local midnight. */
const day = (d: ISODate) => parseISO(d);

/** Pure schedule rule — ignores protocol status (callers decide what to show). */
export function isScheduledOn(p: Protocol, date: ISODate): boolean {
  if (date < p.startDate) return false;
  if (p.endDate && date > p.endDate) return false;

  // Calendar-day difference is DST-safe (a 23h or 25h day still counts as 1).
  const sinceStart = differenceInCalendarDays(day(date), day(p.startDate));
  const s = p.schedule;
  switch (s.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return (s.weekdays as number[]).includes(getISODay(day(date)));
    case 'interval':
      return sinceStart % s.intervalDays === 0;
    case 'cycle':
      return sinceStart % (s.onDays + s.offDays) < s.onDays;
  }
}

const slot = (protocolId: string, date: ISODate, time: TimeOfDay): Occurrence => ({
  protocolId,
  date,
  time,
  scheduledFor: `${date}T${time}:00`,
});

/** Occurrences of one protocol between `from` and `to`, both inclusive, sorted. */
export function occurrences(p: Protocol, from: ISODate, to: ISODate): Occurrence[] {
  const start = from < p.startDate ? p.startDate : from;
  const end = p.endDate && p.endDate < to ? p.endDate : to;
  if (start > end) return [];

  const times = [...p.times].sort();
  const out: Occurrence[] = [];
  for (let d = day(start); toISODate(d) <= end; d = addDays(d, 1)) {
    const date = toISODate(d);
    if (isScheduledOn(p, date)) for (const t of times) out.push(slot(p.id, date, t));
  }
  return out;
}

export function occurrencesForProtocols(protocols: Protocol[], from: ISODate, to: ISODate): Occurrence[] {
  return protocols
    .flatMap((p) => occurrences(p, from, to))
    .sort((a, b) => (a.scheduledFor < b.scheduledFor ? -1 : a.scheduledFor > b.scheduledFor ? 1 : 0));
}

/** Next slot strictly after `after`, looking ahead at most `horizonDays`. */
export function nextOccurrence(p: Protocol, after: Date, horizonDays = 366): Occurrence | null {
  const afterISO = toISODateTime(after);
  const from = toISODate(after);
  const to = toISODate(addDays(after, horizonDays));
  return occurrences(p, from, to).find((o) => o.scheduledFor > afterISO) ?? null;
}
