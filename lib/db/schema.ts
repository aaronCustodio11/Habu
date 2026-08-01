import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'habu.db';

/** Bump this whenever a migration below is added. */
export const DATABASE_VERSION = 1;

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  reminder_enabled INTEGER NOT NULL DEFAULT 0,
  reminder_time TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  pending_sync INTEGER NOT NULL DEFAULT 1,
  pending_delete INTEGER NOT NULL DEFAULT 0
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

  // future: if (currentVersion === 1) { ... }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
}
