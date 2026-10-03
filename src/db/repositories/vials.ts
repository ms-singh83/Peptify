import type { SQLiteDatabase } from 'expo-sqlite';

import { newId } from '@/db/ids';
import { vialFromRow, type VialRow } from '@/db/mappers';
import { nowISO } from '@/lib/dates';
import type { Vial, VialInput, VialStatus } from '@/types/domain';

export async function listVials(db: SQLiteDatabase, status: VialStatus = 'active'): Promise<Vial[]> {
  const rows = await db.getAllAsync<VialRow>('SELECT * FROM vials WHERE status = ? ORDER BY created_at DESC', status);
  return rows.map(vialFromRow);
}

export async function getVial(db: SQLiteDatabase, id: string): Promise<Vial | null> {
  const row = await db.getFirstAsync<VialRow>('SELECT * FROM vials WHERE id = ?', id);
  return row ? vialFromRow(row) : null;
}

export async function createVial(db: SQLiteDatabase, input: VialInput): Promise<string> {
  const id = newId();
  await db.runAsync(
    `INSERT INTO vials (id, peptide_slug, custom_name, total_mg, water_ml, reconstituted_at, expires_at,
       remaining_mcg, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
    id,
    input.peptideSlug,
    input.customName,
    input.totalMg,
    input.waterMl,
    input.reconstitutedAt,
    input.expiresAt,
    input.totalMg * 1000,
    nowISO(),
  );
  return id;
}

export async function setVialStatus(db: SQLiteDatabase, id: string, status: VialStatus): Promise<void> {
  await db.runAsync('UPDATE vials SET status = ? WHERE id = ?', status, id);
}

export async function listAllVials(db: SQLiteDatabase): Promise<Vial[]> {
  const rows = await db.getAllAsync<VialRow>(
    "SELECT * FROM vials ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'empty' THEN 1 ELSE 2 END, created_at DESC",
  );
  return rows.map(vialFromRow);
}

/** Edit vial details. Changing the total resets what's left to the new total minus what was already drawn. */
export async function updateVial(db: SQLiteDatabase, id: string, input: VialInput): Promise<void> {
  await db.runAsync(
    `UPDATE vials SET peptide_slug = ?, custom_name = ?,
       remaining_mcg = MAX(? * 1000 - (total_mg * 1000 - remaining_mcg), 0),
       total_mg = ?, water_ml = ?, reconstituted_at = ?, expires_at = ?
     WHERE id = ?`,
    input.peptideSlug,
    input.customName,
    input.totalMg,
    input.totalMg,
    input.waterMl,
    input.reconstitutedAt,
    input.expiresAt,
    id,
  );
}

/** Link (or unlink with null) a vial to a protocol so logged doses draw from it. */
export async function linkVial(db: SQLiteDatabase, protocolId: string, vialId: string | null): Promise<void> {
  await db.runAsync('UPDATE protocols SET vial_id = ? WHERE id = ?', vialId, protocolId);
}

/** Protocols currently drawing from this vial. */
export async function protocolIdsForVial(db: SQLiteDatabase, vialId: string): Promise<string[]> {
  const rows = await db.getAllAsync<{ id: string }>('SELECT id FROM protocols WHERE vial_id = ?', vialId);
  return rows.map((r) => r.id);
}
