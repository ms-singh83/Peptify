import { z } from 'zod';

export const DOSE_UNITS = ['mcg', 'mg', 'iu'] as const;
export type DoseUnit = (typeof DOSE_UNITS)[number];

export const SCHEDULE_TYPES = ['daily', 'weekdays', 'interval', 'cycle'] as const;
export type ScheduleType = (typeof SCHEDULE_TYPES)[number];

export const PROTOCOL_STATUSES = ['active', 'paused', 'ended'] as const;
export type ProtocolStatus = (typeof PROTOCOL_STATUSES)[number];

export const DOSE_STATUSES = ['taken', 'skipped'] as const;
export type DoseStatus = (typeof DOSE_STATUSES)[number];

export const VIAL_STATUSES = ['active', 'empty', 'discarded'] as const;
export type VialStatus = (typeof VIAL_STATUSES)[number];

export const INJECTION_SITES = [
  'abdomen-upper-left',
  'abdomen-upper-right',
  'abdomen-lower-left',
  'abdomen-lower-right',
  'thigh-left',
  'thigh-right',
  'deltoid-left',
  'deltoid-right',
] as const;
export type InjectionSite = (typeof INJECTION_SITES)[number];

export const PEPTIDE_CATEGORIES = [
  'recovery',
  'gh-secretagogue',
  'metabolic',
  'cognitive',
  'skin-hair',
  'sleep',
  'other',
] as const;
export type PeptideCategory = (typeof PEPTIDE_CATEGORIES)[number];

/** ISO date `YYYY-MM-DD` (local). */
export type ISODate = string;
/** ISO local datetime `YYYY-MM-DDTHH:mm:ss`. */
export type ISODateTime = string;
/** 24h time `HH:mm`. */
export type TimeOfDay = string;

/** Weekday number, ISO style: 1 = Monday … 7 = Sunday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Schedule =
  | { type: 'daily' }
  | { type: 'weekdays'; weekdays: Weekday[] }
  | { type: 'interval'; intervalDays: number }
  | { type: 'cycle'; onDays: number; offDays: number };

export type Protocol = {
  id: string;
  peptideSlug: string | null;
  customName: string | null;
  doseAmount: number;
  doseUnit: DoseUnit;
  schedule: Schedule;
  times: TimeOfDay[];
  startDate: ISODate;
  endDate: ISODate | null;
  status: ProtocolStatus;
  vialId: string | null;
  notes: string | null;
  createdAt: ISODateTime;
};

export type Dose = {
  id: string;
  /** null = unscheduled dose */
  protocolId: string | null;
  scheduledFor: ISODateTime | null;
  takenAt: ISODateTime | null;
  status: DoseStatus;
  amount: number | null;
  unit: DoseUnit | null;
  site: InjectionSite | null;
  notes: string | null;
  /** Vial the amount was drawn from (set automatically from the protocol). */
  vialId: string | null;
  createdAt: ISODateTime;
};

export type Vial = {
  id: string;
  peptideSlug: string | null;
  customName: string | null;
  totalMg: number;
  /** null = not reconstituted yet */
  waterMl: number | null;
  reconstitutedAt: ISODate | null;
  expiresAt: ISODate | null;
  remainingMcg: number;
  status: VialStatus;
  createdAt: ISODateTime;
};

export type PeptideReference = { title: string; url: string };

export type Peptide = {
  slug: string;
  name: string;
  aliases: string[];
  category: PeptideCategory;
  free: boolean;
  summary: string;
  studiedFor: string[];
  halfLifeHours?: number;
  halfLifeNote?: string;
  storage?: string;
  researchStatus: 'approved-drug' | 'clinical-trials' | 'preclinical' | 'limited';
  references: PeptideReference[];
};

// ---------- zod schemas for form input ----------

const positive = z.number().finite().positive();
const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const scheduleSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('daily') }),
  z.object({
    type: z.literal('weekdays'),
    weekdays: z.array(z.literal([1, 2, 3, 4, 5, 6, 7])).min(1, 'Pick at least one day'),
  }),
  z.object({ type: z.literal('interval'), intervalDays: z.number().int().min(2).max(60) }),
  z.object({
    type: z.literal('cycle'),
    onDays: z.number().int().min(1).max(365),
    offDays: z.number().int().min(1).max(365),
  }),
]);

export const protocolInputSchema = z
  .object({
    peptideSlug: z.string().min(1).nullable(),
    customName: z.string().trim().min(1).max(60).nullable(),
    doseAmount: positive,
    doseUnit: z.enum(DOSE_UNITS),
    schedule: scheduleSchema,
    times: z.array(timeOfDay).min(1, 'Add at least one time').max(6),
    startDate: isoDate,
    endDate: isoDate.nullable(),
    vialId: z.string().nullable(),
    notes: z.string().max(500).nullable(),
  })
  .refine((p) => p.peptideSlug || p.customName, {
    message: 'Choose a peptide or enter a name',
    path: ['customName'],
  })
  .refine((p) => !p.endDate || p.endDate >= p.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });
export type ProtocolInput = z.infer<typeof protocolInputSchema>;

export const vialInputSchema = z
  .object({
    peptideSlug: z.string().min(1).nullable(),
    customName: z.string().trim().min(1).max(60).nullable(),
    totalMg: positive.max(1000),
    waterMl: positive.max(100).nullable(),
    reconstitutedAt: isoDate.nullable(),
    expiresAt: isoDate.nullable(),
  })
  .refine((v) => v.peptideSlug || v.customName, {
    message: 'Choose a peptide or enter a name',
    path: ['customName'],
  });
export type VialInput = z.infer<typeof vialInputSchema>;

export const doseInputSchema = z.object({
  protocolId: z.string().nullable(),
  scheduledFor: z.string().nullable(),
  takenAt: z.string().nullable(),
  status: z.enum(DOSE_STATUSES),
  amount: positive.nullable(),
  unit: z.enum(DOSE_UNITS).nullable(),
  site: z.enum(INJECTION_SITES).nullable(),
  notes: z.string().max(500).nullable(),
});
export type DoseInput = z.infer<typeof doseInputSchema>;
