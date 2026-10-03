import type {
  Dose,
  DoseStatus,
  DoseUnit,
  InjectionSite,
  Protocol,
  ProtocolStatus,
  Schedule,
  ScheduleType,
  Vial,
  VialStatus,
  Weekday,
} from '@/types/domain';

// Row types mirror the SQL columns exactly (see migrations.ts).

export type ProtocolRow = {
  id: string;
  peptide_slug: string | null;
  custom_name: string | null;
  dose_amount: number;
  dose_unit: string;
  schedule_type: string;
  weekdays: string | null;
  interval_days: number | null;
  cycle_on_days: number | null;
  cycle_off_days: number | null;
  times: string;
  start_date: string;
  end_date: string | null;
  status: string;
  vial_id: string | null;
  notes: string | null;
  created_at: string;
};

export type DoseRow = {
  id: string;
  protocol_id: string | null;
  scheduled_for: string | null;
  taken_at: string | null;
  status: string;
  amount: number | null;
  unit: string | null;
  site: string | null;
  notes: string | null;
  created_at: string;
  vial_id: string | null;
};

export type VialRow = {
  id: string;
  peptide_slug: string | null;
  custom_name: string | null;
  total_mg: number;
  water_ml: number | null;
  reconstituted_at: string | null;
  expires_at: string | null;
  remaining_mcg: number;
  status: string;
  created_at: string;
};

/** Corrupt JSON must not crash list screens; fall back and keep going. */
function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function scheduleFromRow(r: ProtocolRow): Schedule {
  switch (r.schedule_type as ScheduleType) {
    case 'weekdays':
      return { type: 'weekdays', weekdays: parseJson<Weekday[]>(r.weekdays, []) };
    case 'interval':
      return { type: 'interval', intervalDays: r.interval_days ?? 2 };
    case 'cycle':
      return { type: 'cycle', onDays: r.cycle_on_days ?? 1, offDays: r.cycle_off_days ?? 1 };
    default:
      return { type: 'daily' };
  }
}

export function scheduleToColumns(s: Schedule) {
  return {
    schedule_type: s.type,
    weekdays: s.type === 'weekdays' ? JSON.stringify([...s.weekdays].sort()) : null,
    interval_days: s.type === 'interval' ? s.intervalDays : null,
    cycle_on_days: s.type === 'cycle' ? s.onDays : null,
    cycle_off_days: s.type === 'cycle' ? s.offDays : null,
  };
}

export function protocolFromRow(r: ProtocolRow): Protocol {
  return {
    id: r.id,
    peptideSlug: r.peptide_slug,
    customName: r.custom_name,
    doseAmount: r.dose_amount,
    doseUnit: r.dose_unit as DoseUnit,
    schedule: scheduleFromRow(r),
    times: parseJson<string[]>(r.times, []),
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status as ProtocolStatus,
    vialId: r.vial_id,
    notes: r.notes,
    createdAt: r.created_at,
  };
}

export function doseFromRow(r: DoseRow): Dose {
  return {
    id: r.id,
    protocolId: r.protocol_id,
    scheduledFor: r.scheduled_for,
    takenAt: r.taken_at,
    status: r.status as DoseStatus,
    amount: r.amount,
    unit: r.unit as DoseUnit | null,
    site: r.site as InjectionSite | null,
    notes: r.notes,
    vialId: r.vial_id,
    createdAt: r.created_at,
  };
}

export function vialFromRow(r: VialRow): Vial {
  return {
    id: r.id,
    peptideSlug: r.peptide_slug,
    customName: r.custom_name,
    totalMg: r.total_mg,
    waterMl: r.water_ml,
    reconstitutedAt: r.reconstituted_at,
    expiresAt: r.expires_at,
    remainingMcg: r.remaining_mcg,
    status: r.status as VialStatus,
    createdAt: r.created_at,
  };
}
