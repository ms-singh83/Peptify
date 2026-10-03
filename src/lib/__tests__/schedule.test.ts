import type { Protocol, Schedule } from '@/types/domain';

import { isScheduledOn, nextOccurrence, occurrences, occurrencesForProtocols } from '../schedule';

function protocol(schedule: Schedule, overrides: Partial<Protocol> = {}): Protocol {
  return {
    id: 'p1',
    peptideSlug: 'bpc-157',
    customName: null,
    doseAmount: 250,
    doseUnit: 'mcg',
    schedule,
    times: ['08:00'],
    startDate: '2026-10-05', // Monday
    endDate: null,
    status: 'active',
    vialId: null,
    notes: null,
    createdAt: '2026-10-05T07:00:00',
    ...overrides,
  };
}

const dates = (p: Protocol, from: string, to: string) => occurrences(p, from, to).map((o) => o.date);

describe('timezone', () => {
  it('runs in America/New_York', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/New_York');
  });
});

describe('daily', () => {
  it('produces one occurrence per day per time, sorted', () => {
    const p = protocol({ type: 'daily' }, { times: ['20:00', '08:00'] });
    const occ = occurrences(p, '2026-10-05', '2026-10-06');
    expect(occ.map((o) => o.scheduledFor)).toEqual([
      '2026-10-05T08:00:00',
      '2026-10-05T20:00:00',
      '2026-10-06T08:00:00',
      '2026-10-06T20:00:00',
    ]);
    expect(occ[0]).toMatchObject({ protocolId: 'p1', date: '2026-10-05', time: '08:00' });
  });

  it('clips to start and end dates (inclusive)', () => {
    const p = protocol({ type: 'daily' }, { startDate: '2026-10-07', endDate: '2026-10-09' });
    expect(dates(p, '2026-10-01', '2026-10-31')).toEqual(['2026-10-07', '2026-10-08', '2026-10-09']);
  });

  it('returns nothing for an inverted range', () => {
    expect(occurrences(protocol({ type: 'daily' }), '2026-10-10', '2026-10-01')).toEqual([]);
  });
});

describe('weekdays', () => {
  it('only lands on the chosen ISO weekdays (Mon/Wed/Fri)', () => {
    const p = protocol({ type: 'weekdays', weekdays: [1, 3, 5] });
    expect(dates(p, '2026-10-05', '2026-10-18')).toEqual([
      '2026-10-05',
      '2026-10-07',
      '2026-10-09',
      '2026-10-12',
      '2026-10-14',
      '2026-10-16',
    ]);
  });

  it('treats 7 as Sunday', () => {
    const p = protocol({ type: 'weekdays', weekdays: [7] });
    expect(dates(p, '2026-10-05', '2026-10-18')).toEqual(['2026-10-11', '2026-10-18']);
  });
});

describe('interval', () => {
  it('every 3 days counted from the start date', () => {
    const p = protocol({ type: 'interval', intervalDays: 3 });
    expect(dates(p, '2026-10-05', '2026-10-15')).toEqual(['2026-10-05', '2026-10-08', '2026-10-11', '2026-10-14']);
  });

  it('stays aligned when the query starts mid-cycle', () => {
    const p = protocol({ type: 'interval', intervalDays: 3 });
    expect(dates(p, '2026-10-09', '2026-10-12')).toEqual(['2026-10-11']);
  });

  it('is not shifted by the DST change (US: 2026-11-01)', () => {
    const p = protocol({ type: 'interval', intervalDays: 2 }, { startDate: '2026-10-30' });
    expect(dates(p, '2026-10-30', '2026-11-05')).toEqual(['2026-10-30', '2026-11-01', '2026-11-03', '2026-11-05']);
  });
});

describe('cycle', () => {
  it('5 on / 2 off', () => {
    const p = protocol({ type: 'cycle', onDays: 5, offDays: 2 });
    expect(dates(p, '2026-10-05', '2026-10-18')).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
    ]);
  });

  it('long cycles: 2 on / 12 off', () => {
    const p = protocol({ type: 'cycle', onDays: 2, offDays: 12 });
    expect(dates(p, '2026-10-05', '2026-10-31')).toEqual(['2026-10-05', '2026-10-06', '2026-10-19', '2026-10-20']);
  });
});

describe('isScheduledOn', () => {
  it('is false before start and after end', () => {
    const p = protocol({ type: 'daily' }, { endDate: '2026-10-10' });
    expect(isScheduledOn(p, '2026-10-04')).toBe(false);
    expect(isScheduledOn(p, '2026-10-05')).toBe(true);
    expect(isScheduledOn(p, '2026-10-10')).toBe(true);
    expect(isScheduledOn(p, '2026-10-11')).toBe(false);
  });
});

describe('occurrencesForProtocols', () => {
  it('merges and sorts across protocols', () => {
    const a = protocol({ type: 'daily' }, { id: 'a', times: ['09:00'] });
    const b = protocol({ type: 'daily' }, { id: 'b', times: ['07:30', '21:00'] });
    expect(occurrencesForProtocols([a, b], '2026-10-05', '2026-10-05').map((o) => `${o.protocolId}@${o.time}`)).toEqual([
      'b@07:30',
      'a@09:00',
      'b@21:00',
    ]);
  });
});

describe('nextOccurrence', () => {
  it('finds the next slot after a moment, skipping past times today', () => {
    const p = protocol({ type: 'weekdays', weekdays: [1, 3] }, { times: ['08:00', '20:00'] });
    expect(nextOccurrence(p, new Date(2026, 9, 5, 9, 0))?.scheduledFor).toBe('2026-10-05T20:00:00');
    expect(nextOccurrence(p, new Date(2026, 9, 5, 21, 0))?.scheduledFor).toBe('2026-10-07T08:00:00');
  });

  it('returns null once the protocol has ended', () => {
    const p = protocol({ type: 'daily' }, { endDate: '2026-10-06' });
    expect(nextOccurrence(p, new Date(2026, 9, 7, 0, 0))).toBeNull();
  });
});
