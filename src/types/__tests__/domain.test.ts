import { protocolInputSchema } from '../domain';

const valid = {
  peptideSlug: 'bpc-157',
  customName: null,
  doseAmount: 250,
  doseUnit: 'mcg',
  schedule: { type: 'weekdays', weekdays: [1, 3, 5] },
  times: ['08:00'],
  startDate: '2026-10-05',
  endDate: null,
  vialId: null,
  notes: null,
};

describe('protocolInputSchema', () => {
  it('accepts a valid protocol', () => {
    expect(protocolInputSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a peptide or a custom name', () => {
    const r = protocolInputSchema.safeParse({ ...valid, peptideSlug: null });
    expect(r.success).toBe(false);
  });

  it('rejects bad times, empty weekdays and end before start', () => {
    expect(protocolInputSchema.safeParse({ ...valid, times: ['8am'] }).success).toBe(false);
    expect(
      protocolInputSchema.safeParse({ ...valid, schedule: { type: 'weekdays', weekdays: [] } }).success,
    ).toBe(false);
    expect(protocolInputSchema.safeParse({ ...valid, endDate: '2026-10-01' }).success).toBe(false);
  });
});
