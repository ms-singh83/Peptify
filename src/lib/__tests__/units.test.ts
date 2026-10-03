import { formatAmount, fromMcg, toMcg } from '../units';

describe('toMcg', () => {
  it('converts mg and mcg', () => {
    expect(toMcg(1, 'mg')).toBe(1000);
    expect(toMcg(250, 'mcg')).toBe(250);
    expect(toMcg(0.25, 'mg')).toBe(250);
  });

  it('returns null for IU (no universal conversion)', () => {
    expect(toMcg(2, 'iu')).toBeNull();
  });
});

describe('fromMcg', () => {
  it('converts back to mg', () => {
    expect(fromMcg(2500, 'mg')).toBe(2.5);
    expect(fromMcg(2500, 'mcg')).toBe(2500);
    expect(fromMcg(2500, 'iu')).toBeNull();
  });
});

describe('formatAmount', () => {
  it('trims trailing zeros and adds the unit', () => {
    expect(formatAmount(250, 'mcg')).toBe('250 mcg');
    expect(formatAmount(0.1, 'mg')).toBe('0.1 mg');
    expect(formatAmount(2.5, 'mg')).toBe('2.5 mg');
    expect(formatAmount(1 / 3, 'mg')).toBe('0.33 mg');
    expect(formatAmount(2, 'iu')).toBe('2 IU');
  });
});
