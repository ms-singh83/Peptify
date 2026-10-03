import { describeSchedule, describeTimes, formatTime, fromTime12, toTime12 } from '../format';

describe('describeSchedule', () => {
  it.each([
    [{ type: 'daily' as const }, 'Daily'],
    [{ type: 'weekdays' as const, weekdays: [5, 1, 3] as (1 | 3 | 5)[] }, 'Mon, Wed, Fri'],
    [{ type: 'weekdays' as const, weekdays: [1, 2, 3, 4, 5] as (1 | 2 | 3 | 4 | 5)[] }, 'Weekdays'],
    [{ type: 'weekdays' as const, weekdays: [7, 6] as (6 | 7)[] }, 'Weekends'],
    [{ type: 'interval' as const, intervalDays: 3 }, 'Every 3 days'],
    [{ type: 'cycle' as const, onDays: 5, offDays: 2 }, '5 days on, 2 off'],
  ])('%o → %s', (s, expected) => {
    expect(describeSchedule(s)).toBe(expected);
  });
});

describe('times', () => {
  it('formats 12h and sorts', () => {
    expect(formatTime('08:00')).toBe('8:00 AM');
    expect(formatTime('20:30')).toBe('8:30 PM');
    expect(formatTime('00:05')).toBe('12:05 AM');
    expect(describeTimes(['20:00', '08:00'])).toBe('8:00 AM, 8:00 PM');
  });
});

describe('12-hour conversion', () => {
  it.each([
    ['00:00', { hour: 12, minute: 0, pm: false }],
    ['00:30', { hour: 12, minute: 30, pm: false }],
    ['08:05', { hour: 8, minute: 5, pm: false }],
    ['12:00', { hour: 12, minute: 0, pm: true }],
    ['13:45', { hour: 1, minute: 45, pm: true }],
    ['23:59', { hour: 11, minute: 59, pm: true }],
  ])('%s ⇄ %o', (t, t12) => {
    expect(toTime12(t)).toEqual(t12);
    expect(fromTime12(t12)).toBe(t);
  });
});
