import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { DATABASE_NAME, migrateDbIfNeeded } from './schema';

let dbPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Returns the one shared on-device database, opening + migrating it lazily on
 * first use. All repositories go through this, so there is exactly one
 * connection for the whole app (including the sync engine).
 */
export function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DATABASE_NAME).then(async (db) => {
      await migrateDbIfNeeded(db);
      return db;
    });
  }
  return dbPromise;
}

/** Idempotent startup hook — call early (root layout) so reads are fast later. */
export async function initDatabase(): Promise<void> {
  await getDb();
}

/** Wipes every local table (delete-account flow / sign-out cleanup). */
export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM completions');
    await db.execAsync('DELETE FROM widget_configs');
    await db.execAsync('DELETE FROM boards');
    await db.execAsync('DELETE FROM sync_meta');
  });
}
