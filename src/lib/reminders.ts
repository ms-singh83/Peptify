import { addDays } from 'date-fns';

import type { Protocol } from '@/types/domain';

import { toISODate, toISODateTime } from './dates';
import { formatTime } from './format';
import { occurrencesForProtocols } from './schedule';
import { formatAmount } from './units';

/** iOS keeps at most 64 pending local notifications per app; leave headroom. */
export const MAX_PENDING = 60;
export const HORIZON_DAYS = 14;
export const ID_PREFIX = 'dose:';
/** Don't schedule slots this close to now — they'd be in the past by the time the OS gets them. */
export const MIN_LEAD_MS = 15_000;

export type PlannedReminder = {
  identifier: string;
  /** Local datetime `YYYY-MM-DDTHH:mm:ss`. */
  fireAt: string;
  title: string;
  body: string;
  data: { protocolId: string; scheduledFor: string };
};

export const reminderId = (protocolId: string, scheduledFor: string) => `${ID_PREFIX}${protocolId}|${scheduledFor}`;

/** Short stable hash so a changed title/body (e.g. edited dose) produces a new identifier. */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

type Options = {
  /** Slots already logged (`protocolId|scheduledFor`) — no reminder needed. */
  logged: Set<string>;
  /** Only the first N active protocols (oldest first) get reminders — free tier uses 1. */
  maxProtocols?: number;
  nameOf: (p: Protocol) => string;
};

/** Every reminder that should exist right now, soonest first. Pure. */
export function planReminders(protocols: Protocol[], now: Date, { logged, maxProtocols, nameOf }: Options): PlannedReminder[] {
  const active = protocols
    .filter((p) => p.status === 'active')
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .slice(0, maxProtocols ?? Infinity);
  const byId = new Map(active.map((p) => [p.id, p]));
  const cutoff = toISODateTime(new Date(now.getTime() + MIN_LEAD_MS));

  return occurrencesForProtocols(active, toISODate(now), toISODate(addDays(now, HORIZON_DAYS)))
    .filter((o) => o.scheduledFor > cutoff && !logged.has(`${o.protocolId}|${o.scheduledFor}`))
    .slice(0, MAX_PENDING)
    .map((o) => {
      const p = byId.get(o.protocolId)!;
      const title = `Time for ${nameOf(p)}`;
      const body = `${formatAmount(p.doseAmount, p.doseUnit)} · scheduled ${formatTime(o.time)}`;
      return {
        identifier: `${reminderId(p.id, o.scheduledFor)}#${hash(title + body)}`,
        fireAt: o.scheduledFor,
        title,
        body,
        data: { protocolId: p.id, scheduledFor: o.scheduledFor },
      };
    });
}

/** What to cancel and what to add so the scheduled set matches the plan. Pure. */
export function diffReminders(scheduledIds: string[], planned: PlannedReminder[]) {
  const ours = scheduledIds.filter((id) => id.startsWith(ID_PREFIX));
  const wanted = new Set(planned.map((r) => r.identifier));
  const have = new Set(ours);
  return {
    toCancel: ours.filter((id) => !wanted.has(id)),
    toSchedule: planned.filter((r) => !have.has(r.identifier)),
  };
}
