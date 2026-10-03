import type { SQLiteDatabase } from 'expo-sqlite';

import { newId } from '@/db/ids';
import { doseFromRow, type DoseRow } from '@/db/mappers';
import { nowISO } from '@/lib/dates';
import { toMcg } from '@/lib/units';
import type { Dose, DoseInput, ISODateTime } from '@/types/domain';

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

/** Amount a dose wants from a vial in mcg; null when it can't be converted (IU) or wasn't taken. */
function requestedMcg(d: Pick<DoseInput, 'status' | 'amount' | 'unit'>): number | null {
  if (d.status !== 'taken' || d.amount === null || d.unit === null) return null;
  return toMcg(d.amount, d.unit);
}

/**
 * Log a dose. If the slot is linked to a protocol with a vial, the vial's remaining
 * amount drops in the same transaction. Re-logging the same slot replaces the old entry
 * (and restores its vial draw first).
 */
export async function logDose(db: SQLiteDatabase, input: DoseInput): Promise<string> {
  const id = newId();
  // withTransactionAsync (not Exclusive): see note in migrations.ts about connections/PRAGMAs.
  await db.withTransactionAsync(async () => {
    if (input.protocolId && input.scheduledFor) {
      const existing = await db.getFirstAsync<DoseRow>(
        'SELECT * FROM doses WHERE protocol_id = ? AND scheduled_for = ?',
        input.protocolId,
        input.scheduledFor,
      );
      if (existing) await removeDoseRow(db, doseFromRow(existing));
    }

    const link = input.protocolId
      ? await db.getFirstAsync<{ vial_id: string | null; remaining_mcg: number | null }>(
          `SELECT p.vial_id, v.remaining_mcg FROM protocols p LEFT JOIN vials v ON v.id = p.vial_id WHERE p.id = ?`,
          input.protocolId,
        )
      : null;
    const vialId = link?.vial_id ?? null;
    const requested = requestedMcg(input);
    // Never draw more than is left; remember what was really drawn for undo.
    const drawn = vialId && requested !== null ? Math.min(requested, Math.max(link?.remaining_mcg ?? 0, 0)) : null;

    await db.runAsync(
      `INSERT INTO doses (id, protocol_id, scheduled_for, taken_at, status, amount, unit, site, notes,
         vial_id, vial_draw_mcg, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.protocolId,
      input.scheduledFor,
      input.takenAt,
      input.status,
      input.amount,
      input.unit,
      input.site,
      input.notes,
      vialId,
      drawn,
      nowISO(),
    );

    if (vialId && drawn !== null && drawn > 0) {
      await db.runAsync(
        `UPDATE vials SET remaining_mcg = remaining_mcg - ?,
           status = CASE WHEN status = 'active' AND remaining_mcg - ? <= 0 THEN 'empty' ELSE status END
         WHERE id = ?`,
        drawn,
        drawn,
        vialId,
      );
    }
  });
  return id;
}

async function removeDoseRow(db: SQLiteDatabase, d: Dose): Promise<void> {
  if (d.vialId && d.vialDrawMcg) {
    // Only an auto-emptied vial comes back to life; manually discarded ones stay discarded.
    await db.runAsync(
      `UPDATE vials SET remaining_mcg = remaining_mcg + ?,
         status = CASE WHEN status = 'empty' THEN 'active' ELSE status END
       WHERE id = ?`,
      d.vialDrawMcg,
      d.vialId,
    );
  }
  await db.runAsync('DELETE FROM doses WHERE id = ?', d.id);
}

/** Undo a logged dose, restoring exactly the vial amount it used. */
export async function deleteDose(db: SQLiteDatabase, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<DoseRow>('SELECT * FROM doses WHERE id = ?', id);
    if (row) await removeDoseRow(db, doseFromRow(row));
  });
}
