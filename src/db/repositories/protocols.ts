import type { SQLiteDatabase } from 'expo-sqlite';

import { newId } from '@/db/ids';
import { protocolFromRow, scheduleToColumns, type ProtocolRow } from '@/db/mappers';
import { nowISO } from '@/lib/dates';
import type { Protocol, ProtocolInput, ProtocolStatus } from '@/types/domain';

export async function listProtocols(db: SQLiteDatabase, status?: ProtocolStatus): Promise<Protocol[]> {
  const rows = status
    ? await db.getAllAsync<ProtocolRow>('SELECT * FROM protocols WHERE status = ? ORDER BY created_at DESC', status)
    : await db.getAllAsync<ProtocolRow>('SELECT * FROM protocols ORDER BY created_at DESC');
  return rows.map(protocolFromRow);
}

export async function getProtocol(db: SQLiteDatabase, id: string): Promise<Protocol | null> {
  const row = await db.getFirstAsync<ProtocolRow>('SELECT * FROM protocols WHERE id = ?', id);
  return row ? protocolFromRow(row) : null;
}

export async function countActiveProtocols(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM protocols WHERE status = 'active'");
  return row?.n ?? 0;
}

function inputToParams(input: ProtocolInput) {
  const s = scheduleToColumns(input.schedule);
  return {
    $peptide_slug: input.peptideSlug,
    $custom_name: input.customName,
    $dose_amount: input.doseAmount,
    $dose_unit: input.doseUnit,
    $schedule_type: s.schedule_type,
    $weekdays: s.weekdays,
    $interval_days: s.interval_days,
    $cycle_on_days: s.cycle_on_days,
    $cycle_off_days: s.cycle_off_days,
    $times: JSON.stringify([...input.times].sort()),
    $start_date: input.startDate,
    $end_date: input.endDate,
    $vial_id: input.vialId,
    $notes: input.notes,
  };
}

export async function createProtocol(db: SQLiteDatabase, input: ProtocolInput): Promise<string> {
  const id = newId();
  await db.runAsync(
    `INSERT INTO protocols (id, peptide_slug, custom_name, dose_amount, dose_unit, schedule_type, weekdays,
       interval_days, cycle_on_days, cycle_off_days, times, start_date, end_date, status, vial_id, notes, created_at)
     VALUES ($id, $peptide_slug, $custom_name, $dose_amount, $dose_unit, $schedule_type, $weekdays,
       $interval_days, $cycle_on_days, $cycle_off_days, $times, $start_date, $end_date, 'active', $vial_id, $notes, $created_at)`,
    { ...inputToParams(input), $id: id, $created_at: nowISO() },
  );
  return id;
}

export async function updateProtocol(db: SQLiteDatabase, id: string, input: ProtocolInput): Promise<void> {
  await db.runAsync(
    `UPDATE protocols SET peptide_slug = $peptide_slug, custom_name = $custom_name, dose_amount = $dose_amount,
       dose_unit = $dose_unit, schedule_type = $schedule_type, weekdays = $weekdays, interval_days = $interval_days,
       cycle_on_days = $cycle_on_days, cycle_off_days = $cycle_off_days, times = $times, start_date = $start_date,
       end_date = $end_date, vial_id = $vial_id, notes = $notes
     WHERE id = $id`,
    { ...inputToParams(input), $id: id },
  );
}

export async function setProtocolStatus(db: SQLiteDatabase, id: string, status: ProtocolStatus): Promise<void> {
  await db.runAsync('UPDATE protocols SET status = ? WHERE id = ?', status, id);
}

export async function deleteProtocol(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM protocols WHERE id = ?', id);
}
