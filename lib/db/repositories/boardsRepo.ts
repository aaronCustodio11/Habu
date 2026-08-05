import { getDb } from '../client';
import { nowISO } from '@/lib/dates';
import { generateId } from '@/lib/uuid';
import type { Board, BoardDraft } from '@/types/board';

export interface BoardLocalRow {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  track_amounts: number;
  unit: string;
  use_default_amount: number;
  default_amount: number | null;
  reminder_enabled: number;
  reminder_time: string | null;
  archived: number;
  created_at: string;
  updated_at: string;
  pending_sync: number;
  pending_delete: number;
}

function mapRow(row: BoardLocalRow): Board {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    trackAmounts: row.track_amounts === 1,
    unit: row.unit,
    useDefaultAmount: row.use_default_amount === 1,
    defaultAmount: row.default_amount,
    reminderEnabled: row.reminder_enabled === 1,
    reminderTime: row.reminder_time,
    archived: row.archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toRow(board: Board): Omit<BoardLocalRow, 'pending_sync' | 'pending_delete'> {
  return {
    id: board.id,
    user_id: board.userId,
    name: board.name,
    icon: board.icon,
    color: board.color,
    track_amounts: board.trackAmounts ? 1 : 0,
    unit: board.unit,
    use_default_amount: board.useDefaultAmount ? 1 : 0,
    default_amount: board.defaultAmount,
    reminder_enabled: board.reminderEnabled ? 1 : 0,
    reminder_time: board.reminderTime,
    archived: board.archived ? 1 : 0,
    created_at: board.createdAt,
    updated_at: board.updatedAt,
  };
}

export const boardsRepo = {
  async create(userId: string, draft: BoardDraft): Promise<Board> {
    const db = await getDb();
    const now = nowISO();
    const board: Board = {
      id: generateId('board_'),
      userId,
      name: draft.name.trim(),
      icon: draft.icon,
      color: draft.color,
      trackAmounts: draft.trackAmounts,
      unit: draft.trackAmounts ? draft.unit : 'count',
      useDefaultAmount: draft.trackAmounts ? draft.useDefaultAmount : false,
      defaultAmount: draft.trackAmounts && draft.useDefaultAmount ? draft.defaultAmount : null,
      reminderEnabled: draft.reminderEnabled,
      reminderTime: draft.reminderEnabled ? draft.reminderTime : null,
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    const row = toRow(board);
    await db.runAsync(
      `INSERT INTO boards
        (id, user_id, name, icon, color, track_amounts, unit, use_default_amount, default_amount, reminder_enabled, reminder_time, archived, created_at, updated_at, pending_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      row.id,
      row.user_id,
      row.name,
      row.icon,
      row.color,
      row.track_amounts,
      row.unit,
      row.use_default_amount,
      row.default_amount,
      row.reminder_enabled,
      row.reminder_time,
      row.archived,
      row.created_at,
      row.updated_at,
    );
    return board;
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
      reminderTime: changes.reminderEnabled ? (changes.reminderTime ?? existing.reminderTime) : null,
    };
    const row = toRow(next);
    await db.runAsync(
      `UPDATE boards SET name = ?, icon = ?, color = ?, track_amounts = ?, unit = ?, use_default_amount = ?, default_amount = ?, reminder_enabled = ?, reminder_time = ?,
        archived = ?, updated_at = ?, pending_sync = 1
       WHERE id = ?`,
      row.name,
      row.icon,
      row.color,
      row.track_amounts,
      row.unit,
      row.use_default_amount,
      row.default_amount,
      row.reminder_enabled,
      row.reminder_time,
      row.archived,
      row.updated_at,
      id,
    );
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
    await db.runAsync('UPDATE boards SET pending_sync = 0 WHERE id = ?', id);
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
  async upsertFromCloud(cloud: Omit<BoardLocalRow, 'pending_sync' | 'pending_delete'>): Promise<void> {
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
        (id, user_id, name, icon, color, track_amounts, unit, use_default_amount, default_amount, reminder_enabled, reminder_time, archived, created_at, updated_at, pending_sync, pending_delete)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
       ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        name = excluded.name,
        icon = excluded.icon,
        color = excluded.color,
        track_amounts = excluded.track_amounts,
        unit = excluded.unit,
        use_default_amount = excluded.use_default_amount,
        default_amount = excluded.default_amount,
        reminder_enabled = excluded.reminder_enabled,
        reminder_time = excluded.reminder_time,
        archived = excluded.archived,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        pending_sync = 0,
        pending_delete = 0`,
      cloud.id,
      cloud.user_id,
      cloud.name,
      cloud.icon,
      cloud.color,
      cloud.track_amounts,
      cloud.unit,
      cloud.use_default_amount,
      cloud.default_amount,
      cloud.reminder_enabled,
      cloud.reminder_time,
      cloud.archived,
      cloud.created_at,
      cloud.updated_at,
    );
  },

  /** Rows that exist locally but are not in the cloud pull — soft-delete them. */
  async deleteRowsNotIn(ids: string[]): Promise<void> {
    const db = await getDb();
    const placeholders = ids.map(() => '?').join(', ');
    const where = placeholders
      ? ` AND id NOT IN (${placeholders})`
      : '';
    const params = ids.length > 0 ? ids : [];
    await db.runAsync(
      `UPDATE boards SET pending_delete = 1, pending_sync = 0 WHERE pending_sync = 0 AND pending_delete = 0${where}`,
      ...params,
    );
  },
};
