import type { Protocol } from '@/types/domain';

import { emptyForm, fromProtocol, toProtocolInput, type ProtocolFormState } from '../form-state';

const base = (o: Partial<ProtocolFormState> = {}): ProtocolFormState => ({
  ...emptyForm('2026-10-05'),
  peptideSlug: 'bpc-157',
  dose: '250',
  ...o,
});

describe('toProtocolInput', () => {
  it('builds a valid daily protocol', () => {
    const r = toProtocolInput(base());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.input).toMatchObject({
        peptideSlug: 'bpc-157',
        customName: null,
        doseAmount: 250,
        doseUnit: 'mcg',
        schedule: { type: 'daily' },
        times: ['08:00'],
        endDate: null,
      });
    }
  });

  it('accepts comma decimals and de-duplicates/sorts times', () => {
    const r = toProtocolInput(base({ dose: '0,5', doseUnit: 'mg', times: ['20:00', '08:00', '20:00'] }));
    expect(r.ok && r.input.doseAmount).toBe(0.5);
    expect(r.ok && r.input.times).toEqual(['08:00', '20:00']);
  });

  it('uses the custom name only when no library peptide is chosen', () => {
    const r = toProtocolInput(base({ peptideSlug: null, customName: '  My blend ' }));
    expect(r.ok && r.input.customName).toBe('My blend');
    const r2 = toProtocolInput(base({ customName: 'ignored' }));
    expect(r2.ok && r2.input.customName).toBeNull();
  });

  it('builds each schedule type', () => {
    const wd = toProtocolInput(base({ scheduleType: 'weekdays', weekdays: [2, 4] }));
    expect(wd.ok && wd.input.schedule).toEqual({ type: 'weekdays', weekdays: [2, 4] });
    const iv = toProtocolInput(base({ scheduleType: 'interval', intervalDays: '3' }));
    expect(iv.ok && iv.input.schedule).toEqual({ type: 'interval', intervalDays: 3 });
    const cy = toProtocolInput(base({ scheduleType: 'cycle', onDays: '5', offDays: '2' }));
    expect(cy.ok && cy.input.schedule).toEqual({ type: 'cycle', onDays: 5, offDays: 2 });
  });

  it('reports field errors', () => {
    const r = toProtocolInput(base({ peptideSlug: null, customName: '', dose: '', times: [] }));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.name).toBe('Choose a peptide or enter a name');
      expect(r.errors.dose).toBe('Enter a dose greater than 0');
      expect(r.errors.times).toBe('Add at least one time');
    }
  });

  it('rejects bad schedule numbers and empty weekdays', () => {
    const iv = toProtocolInput(base({ scheduleType: 'interval', intervalDays: '1.5' }));
    expect(!iv.ok && iv.errors.schedule).toBeTruthy();
    const wd = toProtocolInput(base({ scheduleType: 'weekdays', weekdays: [] }));
    expect(!wd.ok && wd.errors.schedule).toBe('Pick at least one day');
  });

  it('rejects end date before start date only when an end date is set', () => {
    expect(toProtocolInput(base({ hasEndDate: false, endDate: '2026-01-01' })).ok).toBe(true);
    const r = toProtocolInput(base({ hasEndDate: true, endDate: '2026-10-01' }));
    expect(!r.ok && r.errors.endDate).toBe('End date must be after start date');
  });
});

describe('fromProtocol', () => {
  it('round-trips through the form', () => {
    const p: Protocol = {
      id: 'x',
      peptideSlug: null,
      customName: 'Custom',
      doseAmount: 2,
      doseUnit: 'iu',
      schedule: { type: 'cycle', onDays: 5, offDays: 2 },
      times: ['07:30', '19:30'],
      startDate: '2026-10-05',
      endDate: '2026-12-31',
      status: 'active',
      vialId: null,
      notes: 'note',
      createdAt: '2026-10-05T00:00:00',
    };
    const r = toProtocolInput(fromProtocol(p));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.input).toEqual({
        peptideSlug: null,
        customName: 'Custom',
        doseAmount: 2,
        doseUnit: 'iu',
        schedule: { type: 'cycle', onDays: 5, offDays: 2 },
        times: ['07:30', '19:30'],
        startDate: '2026-10-05',
        endDate: '2026-12-31',
        vialId: null,
        notes: 'note',
      });
    }
  });
});
