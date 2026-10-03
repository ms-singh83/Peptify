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
