import { describeHalfLife } from '../labels';
import { PEPTIDES, searchPeptides } from '../peptides';

describe('describeHalfLife', () => {
  it.each([
    [0.5, 'about 30 minutes'],
    [2.7, 'about 2.7 hours'],
    [26, 'about 26 hours'],
    [120, 'about 5 days'],
    [168, 'about 7 days'],
  ])('%p h → %s', (h, s) => expect(describeHalfLife(h)).toBe(s));
});

describe('library content', () => {
  it('has 25 entries, 5 free, unique slugs', () => {
    expect(PEPTIDES).toHaveLength(25);
    expect(PEPTIDES.filter((p) => p.free)).toHaveLength(5);
    expect(new Set(PEPTIDES.map((p) => p.slug)).size).toBe(25);
  });

  it('every reference is an https URL with a title', () => {
    for (const p of PEPTIDES) for (const r of p.references) {
      expect(r.url).toMatch(/^https:\/\//);
      expect(r.title.length).toBeGreaterThan(5);
    }
  });

  it('search matches names and aliases case-insensitively', () => {
    expect(searchPeptides('bpc').map((p) => p.slug)).toContain('bpc-157');
    expect(searchPeptides('BREMELANOTIDE').map((p) => p.slug)).toContain('pt-141');
  });
});
