import { getDb } from '../client';
import { nowISO } from '@/lib/dates';
import { generateId } from '@/lib/uuid';
import { WIDGET_TYPES, type WidgetTypeKey } from '@/constants/WidgetTypes';
import type { WidgetConfig, WidgetConfigDraft, WidgetScope } from '@/types/widgetConfig';

export interface WidgetConfigLocalRow {
  id: string;
  user_id: string;
  board_id: string | null;
  scope: WidgetScope;
  widget_type: string;
  position: number;
  created_at: string;
  updated_at: string;
  pending_sync: number;
  pending_delete: number;
}

function mapRow(row: WidgetConfigLocalRow): WidgetConfig {
  return {
    id: row.id,
    userId: row.user_id,
    boardId: row.board_id,
    scope: row.scope,
    widgetType: row.widget_type as WidgetTypeKey,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const DEFAULT_WIDGETS: Record<WidgetScope, WidgetTypeKey[]> = {
  home: ['streak_counter', 'weekly_bar_chart', 'monthly_completion_pct'],
  board: ['heatmap', 'streak_counter', 'weekly_bar_chart', 'best_streak_badge'],
};

export const widgetConfigsRepo = {
  /** Populates a dashboard with its default widgets the first time it renders. */
  async ensureDefaults(
    userId: string,
    scope: WidgetScope,
    boardId: string | null,
  ): Promise<WidgetConfig[]> {
    const existing = await this.getAll(userId, scope, boardId);
    if (existing.length > 0) {
      return existing;
    }
    const defaults = DEFAULT_WIDGETS[scope];
    for (let i = 0; i < defaults.length; i += 1) {
      await this.create(userId, {
        boardId,
        scope,
        widgetType: defaults[i],
        position: i,
      });
    }
    return this.getAll(userId, scope, boardId);
  },

  async getAll(userId: string, scope: WidgetScope, boardId: string | null): Promise<WidgetConfig[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<WidgetConfigLocalRow>(
      'SELECT * FROM widget_configs WHERE user_id = ? AND scope = ? AND board_id IS ? AND pending_delete = 0 ORDER BY position ASC',
      userId,
      scope,
      boardId,
    );
    return rows.map(mapRow);
  },

  async create(userId: string, draft: WidgetConfigDraft): Promise<WidgetConfig> {
    const db = await getDb();
    const now = nowISO();
    const config: WidgetConfig = {
      id: generateId('wcfg_'),
      userId,
      boardId: draft.boardId,
      scope: draft.scope,
      widgetType: draft.widgetType,
      position: draft.position,
      createdAt: now,
      updatedAt: now,
    };
    await db.runAsync(
      `INSERT INTO widget_configs
        (id, user_id, board_id, scope, widget_type, position, created_at, updated_at, pending_sync, pending_delete)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
      config.id,
      config.userId,
      config.boardId,
      config.scope,
      config.widgetType,
      config.position,
      config.createdAt,
      config.updatedAt,
    );
    return config;
  },

  async update(id: string, changes: Partial<WidgetConfig>): Promise<void> {
    const db = await getDb();
    const existing = await db.getFirstAsync<WidgetConfigLocalRow>(
      'SELECT * FROM widget_configs WHERE id = ?',
      id,
    );
    if (!existing) return;

    const next = mapRow(existing);
    const merged: WidgetConfig = { ...next, ...changes, id, updatedAt: nowISO() };
    await db.runAsync(
      `UPDATE widget_configs SET board_id = ?, widget_type = ?, position = ?, updated_at = ?, pending_sync = 1
       WHERE id = ?`,
      merged.boardId,
      merged.widgetType,
      merged.position,
      merged.updatedAt,
      id,
    );
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE widget_configs SET pending_delete = 1, pending_sync = 1, updated_at = ? WHERE id = ?',
      nowISO(),
      id,
    );
  },

  /** Persists a new ordering. `configs` should be in the desired order. */
  async reorder(configs: WidgetConfig[]): Promise<void> {
    const db = await getDb();
    for (let i = 0; i < configs.length; i += 1) {
      await db.runAsync(
        'UPDATE widget_configs SET position = ?, updated_at = ?, pending_sync = 1 WHERE id = ?',
        i,
        nowISO(),
        configs[i].id,
      );
    }
  },

  async getPending(): Promise<WidgetConfigLocalRow[]> {
    const db = await getDb();
    return db.getAllAsync<WidgetConfigLocalRow>('SELECT * FROM widget_configs WHERE pending_sync = 1');
  },

  async markSynced(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE widget_configs SET pending_sync = 0 WHERE id = ?', id);
  },

  async deleteRowLocally(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM widget_configs WHERE id = ?', id);
  },

  async upsertFromCloud(
    cloud: Omit<WidgetConfigLocalRow, 'pending_sync' | 'pending_delete'>,
  ): Promise<void> {
    const db = await getDb();
    const local = await db.getFirstAsync<WidgetConfigLocalRow>(
      'SELECT * FROM widget_configs WHERE id = ?',
      cloud.id,
    );
    if (local && local.pending_sync === 1) {
      return;
    }
    await db.runAsync(
      `INSERT INTO widget_configs
        (id, user_id, board_id, scope, widget_type, position, created_at, updated_at, pending_sync, pending_delete)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
       ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        board_id = excluded.board_id,
        scope = excluded.scope,
        widget_type = excluded.widget_type,
        position = excluded.position,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at,
        pending_sync = 0,
        pending_delete = 0`,
      cloud.id,
      cloud.user_id,
      cloud.board_id,
      cloud.scope,
      cloud.widget_type,
      cloud.position,
      cloud.created_at,
      cloud.updated_at,
    );
  },

  async deleteRowsNotIn(ids: string[]): Promise<void> {
    const db = await getDb();
    const placeholders = ids.map(() => '?').join(', ');
    const where = placeholders ? ` AND id NOT IN (${placeholders})` : '';
    await db.runAsync(
      `UPDATE widget_configs SET pending_delete = 1, pending_sync = 0 WHERE pending_sync = 0 AND pending_delete = 0${where}`,
      ...ids,
    );
  },
};

export { WIDGET_TYPES };
