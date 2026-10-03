import { addDays, endOfMonth, getISODay, startOfMonth } from 'date-fns';

import type { ISODate } from '@/types/domain';

import { toISODate } from './dates';

/** Month as weeks (Mon–Sun). Cells outside the month are null. */
export function monthGrid(month: Date): (ISODate | null)[][] {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const cells: (ISODate | null)[] = Array(getISODay(first) - 1).fill(null);
  for (let d = first; d <= last; d = addDays(d, 1)) cells.push(toISODate(d));
  while (cells.length % 7) cells.push(null);
  const weeks: (ISODate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
