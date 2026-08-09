import { getDb } from '../client';
import { nowISO } from '@/lib/dates';
import { generateId } from '@/lib/uuid';
import type { Board, BoardDraft } from '@/types/board';
import type { BoardRow } from '@/types/database.types';

export interface BoardLocalRow {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  layout: string;
  track_amounts: number;
  unit: string;
  use_default_amount: number;
  default_amount: number | null;
  daily_target_amount: number | null;
  allow_exceeding: number;
  reminder_enabled: number;
  reminder_time: string | null;
  archived: number;
  created_at: string;
  updated_at: string;
  pending_sync: number;
  pending_delete: number;
  /** 0 until the row has been pushed to the cloud; 1 afterwards. */
  server_exists: number;
  /** JSON array of column names that differ from the cloud while pending. */
  pending_changes: string | null;
}

function mapRow(row: BoardLocalRow): Board {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    layout: row.layout as Board['layout'],
    trackAmounts: row.track_amounts === 1,
    unit: row.unit,
    useDefaultAmount: row.use_default_amount === 1,
    defaultAmount: row.default_amount,
    dailyTargetAmount: row.daily_target_amount,
    allowExceeding: row.allow_exceeding === 1,
    reminderEnabled: row.reminder_enabled === 1,
    reminderTime: row.reminder_time,
    archived: row.archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toRow(
  board: Board,
): Omit<BoardLocalRow, 'pending_sync' | 'pending_delete' | 'server_exists' | 'pending_changes'> {
  return {
    id: board.id,
    user_id: board.userId,
    name: board.name,
    icon: board.icon,
    color: board.color,
    layout: board.layout,
    track_amounts: board.trackAmounts ? 1 : 0,
    unit: board.unit,
    use_default_amount: board.useDefaultAmount ? 1 : 0,
    default_amount: board.defaultAmount,
    daily_target_amount: board.dailyTargetAmount,
    allow_exceeding: board.allowExceeding ? 1 : 0,
    reminder_enabled: board.reminderEnabled ? 1 : 0,
    reminder_time: board.reminderTime,
    archived: board.archived ? 1 : 0,
    created_at: board.createdAt,
    updated_at: board.updatedAt,
  };
}

/** Cloud shape of a board (snake_case, real booleans) for direct inserts. */
export function toCloudRow(board: Board): BoardRow {
  return {
    id: board.id,
    user_id: board.userId,
    name: board.name,
    icon: board.icon,
    color: board.color,
    layout: board.layout,
    track_amounts: board.trackAmounts,
    unit: board.unit,
    use_default_amount: board.useDefaultAmount,
    default_amount: board.defaultAmount,
    daily_target_amount: board.dailyTargetAmount,
    allow_exceeding: board.allowExceeding,
    reminder_enabled: board.reminderEnabled,
    reminder_time: board.reminderTime,
    archived: board.archived,
    created_at: board.createdAt,
    updated_at: board.updatedAt,
  };
}

/** Assemble a new board (id + timestamps) from a draft, without persisting. */
export function buildBoard(userId: string, draft: BoardDraft): Board {
  const now = nowISO();
  return {
    id: generateId('board_'),
    userId,
    name: draft.name.trim(),
    icon: draft.icon,
    color: draft.color,
    layout: draft.layout ?? 'heatmap',
    trackAmounts: draft.trackAmounts,
    unit: draft.trackAmounts ? draft.unit : 'count',
    useDefaultAmount: draft.trackAmounts ? draft.useDefaultAmount : false,
    defaultAmount: draft.trackAmounts && draft.useDefaultAmount ? draft.defaultAmount : null,
    dailyTargetAmount: draft.trackAmounts ? draft.dailyTargetAmount : null,
    allowExceeding: draft.allowExceeding ?? false,
    reminderEnabled: draft.reminderEnabled,
    reminderTime: draft.reminderEnabled ? draft.reminderTime : null,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

/** Board fields → their local column names, used to diff what actually changed. */
const FIELD_COLUMNS: Array<[keyof Board, string]> = [
  ['name', 'name'],
  ['icon', 'icon'],
  ['color', 'color'],
  ['layout', 'layout'],
  ['trackAmounts', 'track_amounts'],
  ['unit', 'unit'],
  ['useDefaultAmount', 'use_default_amount'],
  ['defaultAmount', 'default_amount'],
  ['dailyTargetAmount', 'daily_target_amount'],
  ['allowExceeding', 'allow_exceeding'],
  ['reminderEnabled', 'reminder_enabled'],
  ['reminderTime', 'reminder_time'],
  ['archived', 'archived'],
];

function changedColumns(existing: Board, next: Board): string[] {
  return FIELD_COLUMNS.filter(([key]) => existing[key] !== next[key]).map(([, column]) => column);
}

/** Accumulate changed columns into the row's pending_changes (JSON array). */
async function appendChangedFields(id: string, columns: string[]): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<Pick<BoardLocalRow, 'pending_changes'>>(
    'SELECT pending_changes FROM boards WHERE id = ?',
    id,
  );
  const names: string[] = row?.pending_changes ? (JSON.parse(row.pending_changes) as string[]) : [];
  for (const column of columns) {
    if (!names.includes(column)) names.push(column);
  }
  await db.runAsync(
    'UPDATE boards SET pending_changes = ? WHERE id = ?',
    JSON.stringify(names),
    id,
  );
}

export const boardsRepo = {
  async create(userId: string, draft: BoardDraft): Promise<Board> {
    const board = buildBoard(userId, draft);
    await this.insertLocal(board, 1);
    return board;
  },

  /** Insert a board already written to the cloud, marked as synced (no re-push). */
  async createSynced(board: Board): Promise<void> {
    await this.insertLocal(board, 0, 1);
  },

  async insertLocal(board: Board, pendingSync: 0 | 1, serverExists: number = 0): Promise<void> {
    const db = await getDb();
    const row = toRow(board);
    await db.runAsync(
      `INSERT INTO boards
        (id, user_id, name, icon, color, layout, track_amounts, unit, use_default_amount, default_amount, daily_target_amount, allow_exceeding, reminder_enabled, reminder_time, archived, created_at, updated_at, pending_sync, server_exists)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      row.id,
      row.user_id,
      row.name,
      row.icon,
      row.color,
      row.layout,
      row.track_amounts,
      row.unit,
      row.use_default_amount,
      row.default_amount,
      row.daily_target_amount,
      row.allow_exceeding,
      row.reminder_enabled,
      row.reminder_time,
      row.archived,
      row.created_at,
      row.updated_at,
      pendingSync,
      serverExists,
    );
  },

  async getById(id: string): Promise<Board | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<BoardLocalRow>(
      'SELECT * FROM boards WHERE id = ? AND pending_delete = 0',
      id,
    );
    return row ? mapRow(row) : null;
  },

  async getAll(userId: string): Promise<Board[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<BoardLocalRow>(
      'SELECT * FROM boards WHERE user_id = ? AND pending_delete = 0 ORDER BY created_at ASC',
      userId,
    );
    return rows.map(mapRow);
  },

  async getActive(userId: string): Promise<Board[]> {
    const boards = await this.getAll(userId);
    return boards.filter((board) => !board.archived);
  },

  async getArchived(userId: string): Promise<Board[]> {
    const boards = await this.getAll(userId);
    return boards.filter((board) => board.archived);
  },

  async update(id: string, changes: Partial<Board>): Promise<Board | null> {
    const db = await getDb();
    const existing = await this.getById(id);
    if (!existing) return null;

    const next: Board = {
      ...existing,
      ...changes,
      id,
      updatedAt: nowISO(),
      trackAmounts: changes.trackAmounts ?? existing.trackAmounts,
      unit: changes.unit ?? existing.unit,
      useDefaultAmount: changes.useDefaultAmount ?? existing.useDefaultAmount,
      defaultAmount: changes.defaultAmount !== undefined ? changes.defaultAmount : existing.defaultAmount,
      dailyTargetAmount:
        changes.dailyTargetAmount !== undefined ? changes.dailyTargetAmount : existing.dailyTargetAmount,
      allowExceeding: changes.allowExceeding ?? existing.allowExceeding,
      reminderTime: changes.reminderEnabled ? (changes.reminderTime ?? existing.reminderTime) : null,
    };
    const row = toRow(next);
    const changed = changedColumns(existing, next);
    await db.runAsync(
      `UPDATE boards SET name = ?, icon = ?, color = ?, layout = ?, track_amounts = ?, unit = ?, use_default_amount = ?, default_amount = ?, daily_target_amount = ?, allow_exceeding = ?, reminder_enabled = ?, reminder_time = ?,
        archived = ?, updated_at = ?, pending_sync = 1
       WHERE id = ?`,
      row.name,
      row.icon,
      row.color,
      row.layout,
      row.track_amounts,
      row.unit,
      row.use_default_amount,
      row.default_amount,
      row.daily_target_amount,
      row.allow_exceeding,
      row.reminder_enabled,
      row.reminder_time,
      row.archived,
      row.updated_at,
      id,
    );
    if (changed.length > 0) {
      await appendChangedFields(id, changed);
    }
    return next;
  },

  async setArchived(id: string, archived: boolean): Promise<Board | null> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE boards SET archived = ?, updated_at = ?, pending_sync = 1 WHERE id = ?',
      archived ? 1 : 0,
      nowISO(),
      id,
    );
    await appendChangedFields(id, ['archived']);
    return this.getById(id);
  },

  /** Soft delete: row stays until the sync engine has pushed the delete. */
  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE boards SET pending_delete = 1, pending_sync = 1, updated_at = ? WHERE id = ?',
      nowISO(),
      id,
    );
  },

  async getPending(): Promise<BoardLocalRow[]> {
    const db = await getDb();
    return db.getAllAsync<BoardLocalRow>('SELECT * FROM boards WHERE pending_sync = 1');
  },

  async markSynced(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE boards SET pending_sync = 0, server_exists = 1, pending_changes = NULL WHERE id = ?',
      id,
    );
  },

  /** Called by the sync engine after the cloud delete succeeded. */
  async deleteRowLocally(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM boards WHERE id = ?', id);
  },

  /**
   * Last-write-wins merge used when pulling from the cloud. Local rows with
   * unsynced changes win, everything else takes the cloud's version.
   */
  async upsertFromCloud(
    cloud: Omit<BoardLocalRow, 'pending_sync' | 'pending_delete' | 'server_exists' | 'pending_changes'>,
  ): Promise<void> {
    const db = await getDb();
    const local = await db.getFirstAsync<BoardLocalRow>(
      'SELECT * FROM boards WHERE id = ?',
      cloud.id,
    );
    if (local && local.pending_sync === 1) {
      return;
    }
    await db.runAsync(
      `INSERT INTO boards
        (id, user_id, name, icon, color, layout, track_amounts, unit, use_default_amount, default_amount, daily_target_amount, allow_exceeding, reminder_enabled, reminder_time, archived, created_at, updated_at, pending_sync, pending_delete, server_exists)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1)
       ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        name = excluded.name,
        icon = excluded.icon,
        color = excluded.color,
        layout = excluded.layout,
        track_amounts = excluded.track_amounts,
        unit = excluded.unit,
        use_default_amount = excluded.use_default_amount,
        default_amount = excluded.default_amount,
        daily_target_amount = excluded.daily_target_amount,
        allow_exceeding = excluded.allow_exceeding,
        reminder_enabled = excluded.reminder_enabled,
        reminder_time = excluded.reminder_time,
        archived = excluded.archived,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        pending_sync = 0,
        pending_delete = 0,
        server_exists = 1,
        pending_changes = NULL`,
      cloud.id,
      cloud.user_id,
      cloud.name,
      cloud.icon,
      cloud.color,
      cloud.layout,
      cloud.track_amounts,
      cloud.unit,
      cloud.use_default_amount,
      cloud.default_amount,
      cloud.daily_target_amount,
      cloud.allow_exceeding,
      cloud.reminder_enabled,
      cloud.reminder_time,
      cloud.archived,
      cloud.created_at,
      cloud.updated_at,
    );
  },

  /**
   * Rows that exist locally but are not in the cloud pull — hard-delete them.
   * Only safe because this runs after a fully successful pull: any row with
   * `pending_sync = 0` is cloud-confirmed, so if it's absent from the snapshot
   * it was deleted elsewhere and is garbage here. Hard-deleting (instead of
   * zombie-marking `pending_delete = 1`) keeps the local table sized to live
   * data instead of accumulating dead rows forever.
   */
  async deleteRowsNotIn(ids: string[]): Promise<void> {
    const db = await getDb();
    const placeholders = ids.map(() => '?').join(', ');
    const where = placeholders
      ? ` AND id NOT IN (${placeholders})`
      : '';
    const params = ids.length > 0 ? ids : [];
    await db.runAsync(
      `DELETE FROM boards WHERE pending_sync = 0 AND pending_delete = 0${where}`,
      ...params,
    );
  },
};
