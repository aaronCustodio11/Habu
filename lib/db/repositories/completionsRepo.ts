import { getDb } from '../client';
import { nowISO } from '@/lib/dates';
import { generateId } from '@/lib/uuid';
import type { Completion, CompletionDraft } from '@/types/completion';

export interface CompletionLocalRow {
  id: string;
  board_id: string;
  completed_on: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  pending_sync: number;
  pending_delete: number;
}

function mapRow(row: CompletionLocalRow): Completion {
  return {
    id: row.id,
    boardId: row.board_id,
    completedOn: row.completed_on,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const completionsRepo = {
  /** Insert, or update the note, of a check-in for a board on a date. */
  async upsertCompletion(draft: CompletionDraft): Promise<Completion> {
    const db = await getDb();
    const existing = await db.getFirstAsync<CompletionLocalRow>(
      'SELECT * FROM completions WHERE board_id = ? AND completed_on = ?',
      draft.boardId,
      draft.completedOn,
    );
    const now = nowISO();

    if (existing) {
      const next = mapRow(existing);
      next.note = draft.note ?? next.note;
      next.updatedAt = now;
      await db.runAsync(
        'UPDATE completions SET note = ?, updated_at = ?, pending_sync = 1, pending_delete = 0 WHERE id = ?',
        next.note,
        now,
        existing.id,
      );
      return next;
    }

    const completion: Completion = {
      id: generateId('comp_'),
      boardId: draft.boardId,
      completedOn: draft.completedOn,
      note: draft.note ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      `INSERT INTO completions
        (id, board_id, completed_on, note, created_at, updated_at, pending_sync, pending_delete)
       VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
      completion.id,
      completion.boardId,
      completion.completedOn,
      completion.note,
      completion.createdAt,
      completion.updatedAt,
    );
    return completion;
  },

  async getByBoard(boardId: string): Promise<Completion[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<CompletionLocalRow>(
      'SELECT * FROM completions WHERE board_id = ? AND pending_delete = 0 ORDER BY completed_on ASC',
      boardId,
    );
    return rows.map(mapRow);
  },

  async getByBoardAndDate(boardId: string, completedOn: string): Promise<Completion | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<CompletionLocalRow>(
      'SELECT * FROM completions WHERE board_id = ? AND completed_on = ? AND pending_delete = 0',
      boardId,
      completedOn,
    );
    return row ? mapRow(row) : null;
  },

  async getDatesForBoard(boardId: string): Promise<string[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ completed_on: string }>(
      'SELECT completed_on FROM completions WHERE board_id = ? AND pending_delete = 0',
      boardId,
    );
    return rows.map((row) => row.completed_on);
  },

  /** Undo a check-in for a date. */
  async removeForDate(boardId: string, completedOn: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE completions SET pending_delete = 1, pending_sync = 1, updated_at = ? WHERE board_id = ? AND completed_on = ?',
      nowISO(),
      boardId,
      completedOn,
    );
  },

  async getPending(): Promise<CompletionLocalRow[]> {
    const db = await getDb();
    return db.getAllAsync<CompletionLocalRow>('SELECT * FROM completions WHERE pending_sync = 1');
  },

  async markSynced(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE completions SET pending_sync = 0 WHERE id = ?', id);
  },

  async deleteRowLocally(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM completions WHERE id = ?', id);
  },

  async upsertFromCloud(
    cloud: Omit<CompletionLocalRow, 'pending_sync' | 'pending_delete'>,
  ): Promise<void> {
    const db = await getDb();
    const local = await db.getFirstAsync<CompletionLocalRow>(
      'SELECT * FROM completions WHERE id = ?',
      cloud.id,
    );
    if (local && local.pending_sync === 1) {
      return;
    }
    await db.runAsync(
      `INSERT INTO completions
        (id, board_id, completed_on, note, created_at, updated_at, pending_sync, pending_delete)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0)
       ON CONFLICT(id) DO UPDATE SET
        board_id = excluded.board_id,
        completed_on = excluded.completed_on,
        note = excluded.note,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        pending_sync = 0,
        pending_delete = 0`,
      cloud.id,
      cloud.board_id,
      cloud.completed_on,
      cloud.note,
      cloud.created_at,
      cloud.updated_at,
    );
  },

  async deleteRowsNotIn(ids: string[]): Promise<void> {
    const db = await getDb();
    const placeholders = ids.map(() => '?').join(', ');
    const where = placeholders ? ` AND id NOT IN (${placeholders})` : '';
    await db.runAsync(
      `UPDATE completions SET pending_delete = 1, pending_sync = 0 WHERE pending_sync = 0 AND pending_delete = 0${where}`,
      ...ids,
    );
  },
};
