import { format } from 'date-fns';

import type { ISODate, ISODateTime } from '@/types/domain';

/** Local date as `YYYY-MM-DD`. */
export const toISODate = (d: Date): ISODate => format(d, 'yyyy-MM-dd');

/** Local datetime as `YYYY-MM-DDTHH:mm:ss` (no timezone suffix, by design). */
export const toISODateTime = (d: Date): ISODateTime => format(d, "yyyy-MM-dd'T'HH:mm:ss");

export const nowISO = (): ISODateTime => toISODateTime(new Date());
