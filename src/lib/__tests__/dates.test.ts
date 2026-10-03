import { toISODate, toISODateTime } from '../dates';

describe('dates', () => {
  it('formats local date and datetime', () => {
    const d = new Date(2026, 0, 5, 8, 3, 9); // local time
    expect(toISODate(d)).toBe('2026-01-05');
    expect(toISODateTime(d)).toBe('2026-01-05T08:03:09');
  });
});
