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

/** Amount drawn from a vial in mcg; null when it can't be converted (IU) or wasn't taken. */
function vialDrawMcg(d: Pick<Dose, 'status' | 'amount' | 'unit'>): number | null {
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

    const vial = input.protocolId
      ? await db.getFirstAsync<{ vial_id: string | null }>('SELECT vial_id FROM protocols WHERE id = ?', input.protocolId)
      : null;
    const vialId = vial?.vial_id ?? null;

    await db.runAsync(
      `INSERT INTO doses (id, protocol_id, scheduled_for, taken_at, status, amount, unit, site, notes, vial_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      nowISO(),
    );

    const draw = vialDrawMcg(input);
    if (vialId && draw !== null) {
      await db.runAsync(
        `UPDATE vials SET remaining_mcg = MAX(remaining_mcg - ?, 0),
           status = CASE WHEN remaining_mcg - ? <= 0 THEN 'empty' ELSE status END
         WHERE id = ?`,
        draw,
        draw,
        vialId,
      );
    }
  });
  return id;
}

async function removeDoseRow(db: SQLiteDatabase, d: Dose): Promise<void> {
  const draw = vialDrawMcg(d);
  if (d.vialId && draw !== null) {
    await db.runAsync(
      `UPDATE vials SET remaining_mcg = MIN(remaining_mcg + ?, total_mg * 1000),
         status = CASE WHEN status = 'empty' THEN 'active' ELSE status END
       WHERE id = ?`,
      draw,
      d.vialId,
    );
  }
  await db.runAsync('DELETE FROM doses WHERE id = ?', d.id);
}

/** Undo a logged dose, restoring any vial amount it used. */
export async function deleteDose(db: SQLiteDatabase, id: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    const row = await db.getFirstAsync<DoseRow>('SELECT * FROM doses WHERE id = ?', id);
    if (row) await removeDoseRow(db, doseFromRow(row));
  });
}
