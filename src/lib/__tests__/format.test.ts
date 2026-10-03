import { describeSchedule, describeTimes, formatTime } from '../format';

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
