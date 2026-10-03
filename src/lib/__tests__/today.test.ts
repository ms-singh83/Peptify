import type { Dose, Protocol } from '@/types/domain';

import { buildTodaySlots, groupSlotsByTime } from '../today';

const protocol = (id: string, times: string[], o: Partial<Protocol> = {}): Protocol => ({
  id,
  peptideSlug: 'bpc-157',
  customName: null,
  doseAmount: 250,
  doseUnit: 'mcg',
  schedule: { type: 'daily' },
  times,
  startDate: '2026-10-01',
  endDate: null,
  status: 'active',
  vialId: null,
  notes: null,
  createdAt: '2026-10-01T00:00:00',
  ...o,
});

const dose = (protocolId: string | null, scheduledFor: string | null, status: Dose['status'] = 'taken'): Dose => ({
  id: `d-${protocolId}-${scheduledFor}`,
  protocolId,
  scheduledFor,
  takenAt: scheduledFor ?? '2026-10-05T10:00:00',
  status,
  amount: 250,
  unit: 'mcg',
  site: null,
  notes: null,
  vialId: null,
  vialDrawMcg: null,
  createdAt: '2026-10-05T10:00:00',
});

const now = new Date(2026, 9, 5, 12, 0); // 2026-10-05 12:00 local

describe('buildTodaySlots', () => {
  it('marks past unlogged slots as due and future ones as upcoming', () => {
    const slots = buildTodaySlots([protocol('a', ['08:00', '20:00'])], [], now);
    expect(slots.map((s) => [s.occurrence.time, s.status])).toEqual([
      ['08:00', 'due'],
      ['20:00', 'upcoming'],
    ]);
  });

  it('uses the logged dose status when present', () => {
    const slots = buildTodaySlots(
      [protocol('a', ['08:00', '20:00'])],
      [dose('a', '2026-10-05T08:00:00', 'taken'), dose('a', '2026-10-05T20:00:00', 'skipped')],
      now,
    );
    expect(slots.map((s) => s.status)).toEqual(['taken', 'skipped']);
    expect(slots[0].dose?.id).toBe('d-a-2026-10-05T08:00:00');
  });

  it('only shows active protocols scheduled today', () => {
    const slots = buildTodaySlots(
      [
        protocol('a', ['08:00']),
        protocol('paused', ['08:00'], { status: 'paused' }),
        protocol('later', ['08:00'], { startDate: '2026-10-06' }),
        protocol('wed', ['08:00'], { schedule: { type: 'weekdays', weekdays: [3] } }), // 10-05 is Monday
      ],
      [],
      now,
    );
    expect(slots.map((s) => s.protocol.id)).toEqual(['a']);
  });

  it('keeps a logged slot even if the protocol was paused afterwards', () => {
    const slots = buildTodaySlots(
      [protocol('p', ['08:00'], { status: 'paused' })],
      [dose('p', '2026-10-05T08:00:00')],
      now,
    );
    expect(slots).toHaveLength(1);
    expect(slots[0].status).toBe('taken');
  });
});

describe('groupSlotsByTime', () => {
  it('groups slots sharing a time, in order', () => {
    const slots = buildTodaySlots([protocol('a', ['08:00', '20:00']), protocol('b', ['08:00'])], [], now);
    expect(groupSlotsByTime(slots).map((g) => [g.time, g.slots.map((s) => s.protocol.id)])).toEqual([
      ['08:00', ['a', 'b']],
      ['20:00', ['a']],
    ]);
  });
});
