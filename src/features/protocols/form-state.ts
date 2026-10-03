import { parseDecimal } from '@/lib/number';
import {
  protocolInputSchema,
  type DoseUnit,
  type ISODate,
  type Protocol,
  type ProtocolInput,
  type Schedule,
  type ScheduleType,
  type TimeOfDay,
  type Weekday,
} from '@/types/domain';

/** Raw form values — strings for anything typed, so partial input is allowed. */
export type ProtocolFormState = {
  peptideSlug: string | null;
  customName: string;
  dose: string;
  doseUnit: DoseUnit;
  scheduleType: ScheduleType;
  weekdays: Weekday[];
  intervalDays: string;
  onDays: string;
  offDays: string;
  times: TimeOfDay[];
  startDate: ISODate;
  hasEndDate: boolean;
  endDate: ISODate;
  notes: string;
  vialId: string | null;
};

export type FormField = 'name' | 'dose' | 'schedule' | 'times' | 'startDate' | 'endDate' | 'notes' | 'general';
export type FormErrors = Partial<Record<FormField, string>>;

export function emptyForm(today: ISODate): ProtocolFormState {
  return {
    peptideSlug: null,
    customName: '',
    dose: '',
    doseUnit: 'mcg',
    scheduleType: 'daily',
    weekdays: [1, 3, 5],
    intervalDays: '2',
    onDays: '5',
    offDays: '2',
    times: ['08:00'],
    startDate: today,
    hasEndDate: false,
    endDate: today,
    notes: '',
    vialId: null,
  };
}

export function fromProtocol(p: Protocol): ProtocolFormState {
  const s = p.schedule;
  return {
    peptideSlug: p.peptideSlug,
    customName: p.customName ?? '',
    dose: String(p.doseAmount),
    doseUnit: p.doseUnit,
    scheduleType: s.type,
    weekdays: s.type === 'weekdays' ? s.weekdays : [1, 3, 5],
    intervalDays: s.type === 'interval' ? String(s.intervalDays) : '2',
    onDays: s.type === 'cycle' ? String(s.onDays) : '5',
    offDays: s.type === 'cycle' ? String(s.offDays) : '2',
    times: p.times,
    startDate: p.startDate,
    hasEndDate: !!p.endDate,
    endDate: p.endDate ?? p.startDate,
    notes: p.notes ?? '',
    vialId: p.vialId,
  };
}

const int = (v: string) => {
  const n = parseDecimal(v);
  return n !== null && Number.isInteger(n) ? n : NaN;
};

function buildSchedule(f: ProtocolFormState): Schedule {
  switch (f.scheduleType) {
    case 'daily':
      return { type: 'daily' };
    case 'weekdays':
      return { type: 'weekdays', weekdays: f.weekdays };
    case 'interval':
      return { type: 'interval', intervalDays: int(f.intervalDays) };
    case 'cycle':
      return { type: 'cycle', onDays: int(f.onDays), offDays: int(f.offDays) };
  }
}

const FIELD_FOR_PATH: Record<string, FormField> = {
  peptideSlug: 'name',
  customName: 'name',
  doseAmount: 'dose',
  doseUnit: 'dose',
  schedule: 'schedule',
  times: 'times',
  startDate: 'startDate',
  endDate: 'endDate',
  notes: 'notes',
};

const FRIENDLY: Partial<Record<FormField, string>> = {
  dose: 'Enter a dose greater than 0',
  schedule: 'Check the schedule numbers',
};

export function toProtocolInput(
  f: ProtocolFormState,
): { ok: true; input: ProtocolInput } | { ok: false; errors: FormErrors } {
  const custom = f.customName.trim();
  const candidate = {
    peptideSlug: f.peptideSlug,
    customName: f.peptideSlug ? null : custom || null,
    doseAmount: parseDecimal(f.dose) ?? NaN,
    doseUnit: f.doseUnit,
    schedule: buildSchedule(f),
    times: [...new Set(f.times)].sort(),
    startDate: f.startDate,
    endDate: f.hasEndDate ? f.endDate : null,
    vialId: f.vialId,
    notes: f.notes.trim() || null,
  };

  const parsed = protocolInputSchema.safeParse(candidate);
  if (parsed.success) return { ok: true, input: parsed.data };

  const errors: FormErrors = {};
  // zod skips object-level refinements while field errors exist, so check this directly.
  if (!candidate.peptideSlug && !candidate.customName) errors.name = 'Choose a peptide or enter a name';
  for (const issue of parsed.error.issues) {
    const field = FIELD_FOR_PATH[String(issue.path[0])];
    if (!field || errors[field]) continue;
    // zod's own message for custom refinements/regex; friendlier text for number type errors.
    const custom = issue.code === 'custom' || issue.message.startsWith('Pick') || issue.message.startsWith('Add');
    errors[field] = custom ? issue.message : (FRIENDLY[field] ?? issue.message);
  }
  // Never fail silently: if no field claimed the error, show a general one.
  if (!Object.keys(errors).length) errors.general = parsed.error.issues[0]?.message ?? 'Please check the form';
  return { ok: false, errors };
}
