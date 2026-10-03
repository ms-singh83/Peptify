import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'peptify.db';

/**
 * Append-only. Never edit a migration that has shipped — add a new one.
 * Index i migrates the schema from user_version i to i + 1.
 */
export const MIGRATIONS: string[] = [
  `
  CREATE TABLE vials (
    id TEXT PRIMARY KEY NOT NULL,
    peptide_slug TEXT,
    custom_name TEXT,
    total_mg REAL NOT NULL,
    water_ml REAL,
    reconstituted_at TEXT,
    expires_at TEXT,
    remaining_mcg REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL
  );

  CREATE TABLE protocols (
    id TEXT PRIMARY KEY NOT NULL,
    peptide_slug TEXT,
    custom_name TEXT,
    dose_amount REAL NOT NULL,
    dose_unit TEXT NOT NULL,
    schedule_type TEXT NOT NULL,
    weekdays TEXT,
    interval_days INTEGER,
    cycle_on_days INTEGER,
    cycle_off_days INTEGER,
    times TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    vial_id TEXT REFERENCES vials(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE doses (
    id TEXT PRIMARY KEY NOT NULL,
    protocol_id TEXT REFERENCES protocols(id) ON DELETE SET NULL,
    scheduled_for TEXT,
    taken_at TEXT,
    status TEXT NOT NULL,
    amount REAL,
    unit TEXT,
    site TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    UNIQUE (protocol_id, scheduled_for)
  );

  CREATE INDEX idx_doses_taken_at ON doses(taken_at);
  CREATE INDEX idx_doses_scheduled_for ON doses(scheduled_for);
  `,
];

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version >= MIGRATIONS.length) return;

  while (version < MIGRATIONS.length) {
    const sql = MIGRATIONS[version];
    // withTransactionAsync (not the Exclusive variant): the exclusive one opens a separate
    // connection where the PRAGMAs above are not set. Same rule for logDose in T-301.
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
    version += 1;
  }
}
