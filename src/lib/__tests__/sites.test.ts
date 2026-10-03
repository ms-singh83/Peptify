import { suggestSite } from '../sites';

describe('suggestSite', () => {
  it('starts with the first site when nothing is logged', () => {
    expect(suggestSite([])).toBe('abdomen-upper-left');
  });

  it('prefers a never-used site', () => {
    expect(
      suggestSite([
        { site: 'abdomen-upper-left', lastUsed: '2026-10-01T08:00:00' },
        { site: 'abdomen-upper-right', lastUsed: '2026-10-02T08:00:00' },
      ]),
    ).toBe('abdomen-lower-left');
  });

  it('picks the least recently used when all have been used', () => {
    const all = [
      'abdomen-upper-left',
      'abdomen-upper-right',
      'abdomen-lower-left',
      'abdomen-lower-right',
      'thigh-left',
      'thigh-right',
      'deltoid-left',
      'deltoid-right',
    ] as const;
    const uses = all.map((site, i) => ({ site, lastUsed: `2026-10-${String(10 + i).padStart(2, '0')}T08:00:00` }));
    uses[5] = { site: 'thigh-right', lastUsed: '2026-09-01T08:00:00' };
    expect(suggestSite(uses)).toBe('thigh-right');
  });
});
