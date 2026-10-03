import { protocolFromRow, scheduleToColumns, type ProtocolRow } from '../mappers';

const base: ProtocolRow = {
  id: 'p1',
  peptide_slug: 'bpc-157',
  custom_name: null,
  dose_amount: 250,
  dose_unit: 'mcg',
  schedule_type: 'daily',
  weekdays: null,
  interval_days: null,
  cycle_on_days: null,
  cycle_off_days: null,
  times: '["08:00","20:00"]',
  start_date: '2026-10-05',
  end_date: null,
  status: 'active',
  vial_id: null,
  notes: null,
  created_at: '2026-10-05T08:00:00',
};

describe('protocol mapping', () => {
  it.each([
    { type: 'daily' as const },
    { type: 'weekdays' as const, weekdays: [1, 3, 5] as (1 | 3 | 5)[] },
    { type: 'interval' as const, intervalDays: 3 },
    { type: 'cycle' as const, onDays: 5, offDays: 2 },
  ])('round-trips schedule %o', (schedule) => {
    const row = { ...base, ...scheduleToColumns(schedule) };
    expect(protocolFromRow(row).schedule).toEqual(schedule);
  });

  it('parses times and keeps other fields', () => {
    const p = protocolFromRow(base);
    expect(p.times).toEqual(['08:00', '20:00']);
    expect(p.doseUnit).toBe('mcg');
    expect(p.peptideSlug).toBe('bpc-157');
  });
});
