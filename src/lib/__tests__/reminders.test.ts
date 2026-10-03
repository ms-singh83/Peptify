import type { Protocol } from '@/types/domain';

import { diffReminders, MAX_PENDING, planReminders, reminderId } from '../reminders';

const protocol = (id: string, o: Partial<Protocol> = {}): Protocol => ({
  id,
  peptideSlug: null,
  customName: id.toUpperCase(),
  doseAmount: 250,
  doseUnit: 'mcg',
  schedule: { type: 'daily' },
  times: ['08:00'],
  startDate: '2026-10-01',
  endDate: null,
  status: 'active',
  vialId: null,
  notes: null,
  createdAt: `2026-10-01T0${id.length}:00:00`,
  ...o,
});

const nameOf = (p: Protocol) => p.customName ?? '';
const now = new Date(2026, 9, 5, 9, 0); // after today's 08:00

describe('planReminders', () => {
  it('plans future, unlogged slots for 14 days, soonest first', () => {
    const plan = planReminders([protocol('a')], now, { logged: new Set(), nameOf });
    expect(plan[0].identifier).toMatch(/^dose:a\|2026-10-06T08:00:00#[0-9a-z]+$/);
    expect(plan[0]).toMatchObject({
      fireAt: '2026-10-06T08:00:00',
      title: 'Time for A',
      body: '250 mcg · scheduled 8:00 AM',
      data: { protocolId: 'a', scheduledFor: '2026-10-06T08:00:00' },
    });
    expect(plan).toHaveLength(14); // 10-06 … 10-19
  });

  it('skips logged slots and non-active protocols', () => {
    const plan = planReminders([protocol('a'), protocol('b', { status: 'paused' })], now, {
      logged: new Set(['a|2026-10-06T08:00:00']),
      nameOf,
    });
    expect(plan[0].fireAt).toBe('2026-10-07T08:00:00');
    expect(plan.every((r) => r.data.protocolId === 'a')).toBe(true);
  });

  it('caps the total at the iOS-safe limit', () => {
    const many = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
    const plan = planReminders([protocol('a', { times: many })], now, { logged: new Set(), nameOf });
    expect(plan).toHaveLength(MAX_PENDING);
  });

  it('free tier: only the oldest active protocol', () => {
    const plan = planReminders([protocol('bb'), protocol('a')], now, { logged: new Set(), nameOf, maxProtocols: 1 });
    expect(new Set(plan.map((r) => r.data.protocolId))).toEqual(new Set(['a']));
  });
});

it('a changed dose produces a different identifier for the same slot', () => {
  const a = planReminders([protocol('a')], now, { logged: new Set(), nameOf })[0];
  const b = planReminders([protocol('a', { doseAmount: 300 })], now, { logged: new Set(), nameOf })[0];
  expect(a.fireAt).toBe(b.fireAt);
  expect(a.identifier).not.toBe(b.identifier);
});

describe('diffReminders', () => {
  it('cancels stale ids, schedules missing ones, ignores foreign ids', () => {
    const plan = planReminders([protocol('a')], now, { logged: new Set(), nameOf }).slice(0, 2);
    const stale = reminderId('a', '2026-10-05T08:00:00');
    const { toCancel, toSchedule } = diffReminders([stale, plan[0].identifier, 'other-lib-id'], plan);
    expect(toCancel).toEqual([stale]);
    expect(toSchedule.map((r) => r.identifier)).toEqual([plan[1].identifier]);
  });
});
