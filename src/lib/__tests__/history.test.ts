import type { Dose, Protocol } from '@/types/domain';

import { currentStreak, summarizeDays } from '../history';

const protocol = (o: Partial<Protocol> = {}): Protocol => ({
  id: 'p',
  peptideSlug: 'bpc-157',
  customName: null,
  doseAmount: 250,
  doseUnit: 'mcg',
  schedule: { type: 'daily' },
  times: ['08:00'],
  startDate: '2026-10-01',
  endDate: null,
  status: 'active',
  vialId: null,
  notes: null,
  createdAt: '2026-10-01T07:00:00',
  ...o,
});

const dose = (date: string, status: Dose['status'] = 'taken', protocolId: string | null = 'p'): Dose => ({
  id: `${protocolId}-${date}`,
  protocolId,
  scheduledFor: protocolId ? `${date}T08:00:00` : null,
  takenAt: `${date}T08:05:00`,
  status,
  amount: 250,
  unit: 'mcg',
  site: null,
  notes: null,
  vialId: null,
  vialDrawMcg: null,
  createdAt: `${date}T08:05:00`,
});

const now = new Date(2026, 9, 5, 12, 0); // Mon 2026-10-05 noon

describe('summarizeDays', () => {
  it('classifies taken, skipped, missed and open days', () => {
    const days = summarizeDays(
      [protocol()],
      [dose('2026-10-01'), dose('2026-10-02', 'skipped'), dose('2026-10-04')],
      '2026-10-01',
      '2026-10-06',
      now,
    );
    expect([...days.values()].map((d) => [d.date, d.status])).toEqual([
      ['2026-10-01', 'complete'],
      ['2026-10-02', 'skipped'],
      ['2026-10-03', 'missed'],
      ['2026-10-04', 'complete'],
      ['2026-10-05', 'pending'], // today, 08:00 passed but still loggable
      ['2026-10-06', 'pending'],
    ]);
    expect(days.get('2026-10-03')!.missed).toBe(1);
  });

  it('does not count misses before the protocol was created', () => {
    const days = summarizeDays(
      [protocol({ startDate: '2026-09-25', createdAt: '2026-10-03T09:00:00' })],
      [],
      '2026-09-25',
      '2026-10-04',
      now,
    );
    expect(days.get('2026-09-28')!.status).toBe('none');
    expect(days.get('2026-10-03')!.status).toBe('missed');
  });

  it('ignores paused protocols for expectations but keeps their logged doses', () => {
    const days = summarizeDays([protocol({ status: 'paused' })], [dose('2026-10-02')], '2026-10-01', '2026-10-04', now);
    expect(days.get('2026-10-01')!.status).toBe('none');
    expect(days.get('2026-10-02')!.status).toBe('complete');
  });

  it('counts unscheduled doses on their taken day', () => {
    const days = summarizeDays([], [dose('2026-10-02', 'taken', null)], '2026-10-01', '2026-10-03', now);
    expect(days.get('2026-10-02')!.taken).toBe(1);
  });

  it('shows a partially logged day as partial (two times, one logged, today)', () => {
    const p = protocol({ times: ['08:00', '20:00'] });
    const days = summarizeDays([p], [dose('2026-10-05')], '2026-10-05', '2026-10-05', now);
    expect(days.get('2026-10-05')!.status).toBe('partial');
  });
});

describe('currentStreak', () => {
  it('counts complete days back from yesterday when today is still open', () => {
    const days = summarizeDays(
      [protocol()],
      [dose('2026-10-02'), dose('2026-10-03'), dose('2026-10-04')],
      '2026-10-01',
      '2026-10-05',
      now,
    );
    // 10-01 missed breaks it; 02–04 complete; today pending doesn't break
    expect(currentStreak(days, now)).toBe(3);
  });

  it('includes today once complete and skips days with nothing scheduled', () => {
    const p = protocol({ schedule: { type: 'weekdays', weekdays: [1, 5] } }); // Mon, Fri
    const days = summarizeDays([p], [dose('2026-10-02'), dose('2026-10-05')], '2026-10-01', '2026-10-05', now);
    expect(currentStreak(days, now)).toBe(2);
  });

  it('is zero after a missed day', () => {
    const days = summarizeDays([protocol()], [], '2026-10-01', '2026-10-05', now);
    expect(currentStreak(days, now)).toBe(0);
  });
});
