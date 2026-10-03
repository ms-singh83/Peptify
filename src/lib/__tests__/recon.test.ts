import { reconstitute } from '../recon';

describe('reconstitute', () => {
  it('5 mg vial + 2 mL water, 250 mcg dose → 10 units', () => {
    const r = reconstitute({ vialMg: 5, waterMl: 2, dose: 250, doseUnit: 'mcg' });
    expect(r).not.toBeNull();
    expect(r!.concentrationMcgPerMl).toBe(2500);
    expect(r!.drawMl).toBeCloseTo(0.1, 10);
    expect(r!.drawUnits).toBeCloseTo(10, 10);
    expect(r!.dosesPerVial).toBe(20);
    expect(r!.exceedsSyringe).toBe(false);
  });

  it('accepts the dose in mg', () => {
    const r = reconstitute({ vialMg: 10, waterMl: 2, dose: 0.5, doseUnit: 'mg' })!;
    expect(r.drawUnits).toBeCloseTo(10, 10);
    expect(r.dosesPerVial).toBe(20);
  });

  it('handles awkward decimals without floating-point drift in doses per vial', () => {
    // 0.3 mg of 0.9 mg is exactly 3 doses even though 900/300 floats oddly in some paths
    const r = reconstitute({ vialMg: 0.9, waterMl: 1, dose: 0.3, doseUnit: 'mg' })!;
    expect(r.dosesPerVial).toBe(3);
  });

  it('flags a draw bigger than the syringe', () => {
    const r = reconstitute({ vialMg: 2, waterMl: 3, dose: 1, doseUnit: 'mg', syringeUnits: 100 })!;
    expect(r.drawUnits).toBeCloseTo(150, 10);
    expect(r.exceedsSyringe).toBe(true);
  });

  it('supports other syringe scales (U-40)', () => {
    const r = reconstitute({ vialMg: 5, waterMl: 2, dose: 250, doseUnit: 'mcg', unitsPerMl: 40 })!;
    expect(r.drawUnits).toBeCloseTo(4, 10);
  });

  it('returns null for invalid input', () => {
    const base = { vialMg: 5, waterMl: 2, dose: 250, doseUnit: 'mcg' as const };
    expect(reconstitute({ ...base, vialMg: 0 })).toBeNull();
    expect(reconstitute({ ...base, waterMl: -1 })).toBeNull();
    expect(reconstitute({ ...base, dose: NaN })).toBeNull();
    expect(reconstitute({ ...base, dose: Infinity })).toBeNull();
    expect(reconstitute({ ...base, doseUnit: 'iu' })).toBeNull();
  });

  it('allows a dose equal to the whole vial despite float noise', () => {
    const r = reconstitute({ vialMg: 1.005, waterMl: 1, dose: 1005, doseUnit: 'mcg' });
    expect(r).not.toBeNull();
    expect(r!.dosesPerVial).toBe(1);
  });

  it('returns null when the dose is larger than the whole vial', () => {
    expect(reconstitute({ vialMg: 1, waterMl: 1, dose: 2, doseUnit: 'mg' })).toBeNull();
  });
});
