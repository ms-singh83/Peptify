import { monthGrid } from '../calendar';

describe('monthGrid', () => {
  it('October 2026 starts on Thursday and has 5 weeks', () => {
    const g = monthGrid(new Date(2026, 9, 15));
    expect(g).toHaveLength(5);
    expect(g[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
    expect(g[4]).toEqual(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', null]);
  });

  it('February 2027 (starts Monday, 28 days) fills exactly 4 weeks', () => {
    const g = monthGrid(new Date(2027, 1, 1));
    expect(g).toHaveLength(4);
    expect(g[0][0]).toBe('2027-02-01');
    expect(g[3][6]).toBe('2027-02-28');
  });

  it('handles the November DST month', () => {
    const flat = monthGrid(new Date(2026, 10, 1)).flat().filter(Boolean);
    expect(flat).toHaveLength(30);
    expect(new Set(flat).size).toBe(30);
  });
});
