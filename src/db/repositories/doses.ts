import type { SQLiteDatabase } from 'expo-sqlite';

import { doseFromRow, type DoseRow } from '@/db/mappers';
import type { Dose, ISODateTime } from '@/types/domain';

/** Doses whose scheduled slot or taken time falls in [from, to). */
export async function listDosesBetween(db: SQLiteDatabase, from: ISODateTime, to: ISODateTime): Promise<Dose[]> {
  const rows = await db.getAllAsync<DoseRow>(
    `SELECT * FROM doses
     WHERE COALESCE(scheduled_for, taken_at) >= ? AND COALESCE(scheduled_for, taken_at) < ?
     ORDER BY COALESCE(scheduled_for, taken_at)`,
    from,
    to,
  );
  return rows.map(doseFromRow);
}

// logDose (with vial decrement in one transaction) is implemented in T-301.
