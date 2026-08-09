import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'habu.db';

/** Bump this whenever a migration below is added. */
export const DATABASE_VERSION = 6;

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  layout TEXT NOT NULL DEFAULT 'heatmap',
  track_amounts INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'count',
  use_default_amount INTEGER NOT NULL DEFAULT 0,
  default_amount REAL,
  daily_target_amount REAL,
  allow_exceeding INTEGER NOT NULL DEFAULT 0,
  reminder_enabled INTEGER NOT NULL DEFAULT 0,
  reminder_time TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  pending_sync INTEGER NOT NULL DEFAULT 1,
  pending_delete INTEGER NOT NULL DEFAULT 0,
  server_exists INTEGER NOT NULL DEFAULT 0,
  pending_changes TEXT
);

CREATE TABLE IF NOT EXISTS completions (
  id TEXT PRIMARY KEY NOT NULL,
  board_id TEXT NOT NULL,
  completed_on TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  pending_sync INTEGER NOT NULL DEFAULT 1,
  pending_delete INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_completions_board_date ON completions (board_id, completed_on);

CREATE TABLE IF NOT EXISTS widget_configs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  board_id TEXT,
  scope TEXT NOT NULL DEFAULT 'home',
  widget_type TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  pending_sync INTEGER NOT NULL DEFAULT 1,
  pending_delete INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_widget_configs_scope ON widget_configs (scope, board_id, position);

CREATE TABLE IF NOT EXISTS sync_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;

/**
 * Runs schema migrations. Uses `PRAGMA user_version` to track which migration
 * steps have already been applied, mirroring the pattern recommended by the
 * expo-sqlite docs.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`PRAGMA journal_mode = 'wal';`);
    await db.execAsync(CREATE_TABLES);
  }

  // v1 → v2: amount tracking on boards.
  if (currentVersion === 1) {
    await db.execAsync(`ALTER TABLE boards ADD COLUMN track_amounts INTEGER NOT NULL DEFAULT 0;`);
    await db.execAsync(`ALTER TABLE boards ADD COLUMN unit TEXT NOT NULL DEFAULT 'count';`);
    await db.execAsync(`ALTER TABLE boards ADD COLUMN use_default_amount INTEGER NOT NULL DEFAULT 0;`);
    await db.execAsync(`ALTER TABLE boards ADD COLUMN default_amount REAL;`);
  }

  // v2 → v3: board visualization layout.
  if (currentVersion === 2) {
    await db.execAsync(`ALTER TABLE boards ADD COLUMN layout TEXT NOT NULL DEFAULT 'heatmap';`);
  }

  // v3 → v4: daily target amount on boards (goal).
  if (currentVersion === 3) {
    await db.execAsync(`ALTER TABLE boards ADD COLUMN daily_target_amount REAL;`);
  }

  // v4 → v5: allow exceeding the daily target.
  if (currentVersion === 4) {
    await db.execAsync(`ALTER TABLE boards ADD COLUMN allow_exceeding INTEGER NOT NULL DEFAULT 0;`);
  }

  // v5 → v6: field-level sync. `server_exists` tells the sync engine whether a
  // dirty board needs a full INSERT (never pushed) or a partial PATCH (already
  // on the cloud). `pending_changes` is a JSON array of the columns that differ
  // from the cloud, accumulated across edits so offline bursts are not lost.
  if (currentVersion === 5) {
    await db.execAsync(`ALTER TABLE boards ADD COLUMN server_exists INTEGER NOT NULL DEFAULT 0;`);
    await db.execAsync(`ALTER TABLE boards ADD COLUMN pending_changes TEXT;`);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
}
