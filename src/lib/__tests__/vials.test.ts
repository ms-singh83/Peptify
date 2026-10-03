import type { Vial } from '@/types/domain';

import { daysUntilExpiry, dosesLeft, remainingFraction, vialWarnings } from '../vials';

const vial = (o: Partial<Vial> = {}): Vial => ({
  id: 'v',
  peptideSlug: 'bpc-157',
  customName: null,
  totalMg: 5,
  waterMl: 2,
  reconstitutedAt: '2026-10-01',
  expiresAt: '2026-10-29',
  remainingMcg: 5000,
  status: 'active',
  createdAt: '2026-10-01T00:00:00',
  ...o,
});

const now = new Date(2026, 9, 5, 12);

describe('vial helpers', () => {
  it('remaining fraction is clamped', () => {
    expect(remainingFraction(vial({ remainingMcg: 2500 }))).toBe(0.5);
    expect(remainingFraction(vial({ remainingMcg: -10 }))).toBe(0);
    expect(remainingFraction(vial({ remainingMcg: 9000 }))).toBe(1);
  });

  it('doses left floors and tolerates float noise', () => {
    expect(dosesLeft(vial({ remainingMcg: 750 }), 250)).toBe(3);
    expect(dosesLeft(vial({ remainingMcg: 749 }), 250)).toBe(2);
    expect(dosesLeft(vial({ remainingMcg: 0.3 * 3 * 1000 }), 300)).toBe(3);
    expect(dosesLeft(vial(), null)).toBeNull();
  });

  it('days until expiry uses calendar days', () => {
    expect(daysUntilExpiry(vial({ expiresAt: '2026-10-08' }), now)).toBe(3);
    expect(daysUntilExpiry(vial({ expiresAt: null }), now)).toBeNull();
  });
});

describe('vialWarnings', () => {
  it('no warnings for a healthy vial', () => {
    expect(vialWarnings(vial(), now, 250)).toEqual([]);
  });

  it('low stock under 3 doses', () => {
    expect(vialWarnings(vial({ remainingMcg: 500 }), now, 250)).toEqual(['low']);
  });

  it('empty beats low', () => {
    expect(vialWarnings(vial({ remainingMcg: 0, status: 'empty' }), now, 250)).toEqual(['empty']);
  });

  it('expiring within 3 days, expired after', () => {
    expect(vialWarnings(vial({ expiresAt: '2026-10-07' }), now, 250)).toEqual(['expiring']);
    expect(vialWarnings(vial({ expiresAt: '2026-10-05' }), now, 250)).toEqual(['expiring']);
    expect(vialWarnings(vial({ expiresAt: '2026-10-04' }), now, 250)).toEqual(['expired']);
  });
});
