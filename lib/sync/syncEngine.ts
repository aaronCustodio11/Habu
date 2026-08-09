import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  fetchBoards,
  fetchCompletions,
  fetchWidgetConfigs,
  upsertBoards,
  upsertCompletions,
  upsertWidgetConfigs,
  updateBoardPatches,
  deleteBoards,
  deleteCompletions,
  deleteWidgetConfigs,
} from '@/lib/supabase/queries';
import type { BoardRow } from '@/lib/supabase/queries/boards';
import { boardsRepo, type BoardLocalRow } from '@/lib/db/repositories/boardsRepo';
import { completionsRepo, type CompletionLocalRow } from '@/lib/db/repositories/completionsRepo';
import { widgetConfigsRepo, type WidgetConfigLocalRow } from '@/lib/db/repositories/widgetConfigsRepo';
import { isOnline, subscribeToConnectivity } from '@/lib/sync/netinfo';

export interface SyncResult {
  ok: boolean;
  pushed: number;
  deleted: number;
  pulled: number;
  error?: string;
}

/** Full cloud row, used to INSERT boards that were never pushed before. */
function toServerInsertBoard(row: BoardLocalRow) {
  const {
    pending_sync: _p,
    pending_delete: _d,
    server_exists: _s,
    pending_changes: _c,
    ...server
  } = row;
  return {
    ...server,
    layout: server.layout as BoardRow['layout'],
    track_amounts: row.track_amounts === 1,
    use_default_amount: row.use_default_amount === 1,
    allow_exceeding: row.allow_exceeding === 1,
    reminder_enabled: row.reminder_enabled === 1,
    archived: row.archived === 1,
  };
}

/**
 * PATCH payload for a board already on the cloud: only the columns recorded in
 * `pending_changes` are sent (plus `updated_at`, which we own). Booleans are
 * converted to real `true`/`false` for the API.
 */
function buildBoardPatch(row: BoardLocalRow): Partial<BoardRow> {
  const fields: string[] = row.pending_changes ? JSON.parse(row.pending_changes) : [];
  const patch: Partial<BoardRow> = { updated_at: row.updated_at };
  for (const field of fields) {
    switch (field) {
      case 'track_amounts':
        patch.track_amounts = row.track_amounts === 1;
        break;
      case 'use_default_amount':
        patch.use_default_amount = row.use_default_amount === 1;
        break;
      case 'allow_exceeding':
        patch.allow_exceeding = row.allow_exceeding === 1;
        break;
      case 'reminder_enabled':
        patch.reminder_enabled = row.reminder_enabled === 1;
        break;
      case 'archived':
        patch.archived = row.archived === 1;
        break;
      default:
        (patch as Record<string, unknown>)[field] = row[field as keyof BoardLocalRow];
        break;
    }
  }
  return patch;
}

function toServerCompletion(row: CompletionLocalRow) {
  const { pending_sync: _p, pending_delete: _d, ...server } = row;
  return server;
}

function toServerWidgetConfig(row: WidgetConfigLocalRow) {
  const { pending_sync: _p, pending_delete: _d, ...server } = row;
  return server;
}

/**
 * One full sync pass for a user: push local changes, then pull the cloud
 * state back and reconcile with last-write-wins merging. Safe to call any
 * time; when offline (or unconfigured) it becomes a no-op returning ok=false.
 *
 * Single-flight: concurrent callers (launch hydration, reconnect watcher,
 * pull-to-refresh, debounced mutation sync) share one in-flight pass instead
 * of piling up overlapping full pulls that race on `markSynced`.
 */
let syncInFlight: Promise<SyncResult> | null = null;

export function syncNow(userId: string): Promise<SyncResult> {
  if (syncInFlight) return syncInFlight;
  const run = doSync(userId);
  syncInFlight = run;
  return run.finally(() => {
    if (syncInFlight === run) syncInFlight = null;
  });
}

async function doSync(userId: string): Promise<SyncResult> {
  const result: SyncResult = { ok: false, pushed: 0, deleted: 0, pulled: 0 };

  if (!isSupabaseConfigured || !(await isOnline())) {
    return result;
  }

  try {
    // 1. Push local deletes, then delete them for real.
    const [pendingBoards, pendingCompletions, pendingWidgets] = await Promise.all([
      boardsRepo.getPending(),
      completionsRepo.getPending(),
      widgetConfigsRepo.getPending(),
    ]);

    // Local board ids: reusing these avoids a redundant `boards.select(id)`
    // round-trip inside the completions delete/pull helpers.
    const localBoardIds = (await boardsRepo.getAll(userId)).map((row) => row.id);

    const boardsToDelete = pendingBoards.filter((row) => row.pending_delete === 1);
    const boardsToPush = pendingBoards.filter((row) => row.pending_delete === 0);
    const completionsToDelete = pendingCompletions.filter((row) => row.pending_delete === 1);
    const completionsToPush = pendingCompletions.filter((row) => row.pending_delete === 0);
    const widgetsToDelete = pendingWidgets.filter((row) => row.pending_delete === 1);
    const widgetsToPush = pendingWidgets.filter((row) => row.pending_delete === 0);

    await deleteBoards(
      boardsToDelete.map((row) => row.id),
      userId,
    );
    await deleteCompletions(
      completionsToDelete.map((row) => row.id),
      localBoardIds,
    );
    await deleteWidgetConfigs(
      widgetsToDelete.map((row) => row.id),
      userId,
    );

    await Promise.all(boardsToDelete.map((row) => boardsRepo.deleteRowLocally(row.id)));
    await Promise.all(completionsToDelete.map((row) => completionsRepo.deleteRowLocally(row.id)));
    await Promise.all(widgetsToDelete.map((row) => widgetConfigsRepo.deleteRowLocally(row.id)));
    result.deleted += boardsToDelete.length + completionsToDelete.length + widgetsToDelete.length;

    // 2. Push local changes.
    // Boards: newly-created rows get a full INSERT (batch upsert); rows already
    // on the cloud get a per-row PATCH of only the columns that changed. Rows
    // marked dirty without any recorded change need no push at all.
    const boardsToInsert = boardsToPush.filter((row) => row.server_exists === 0);
    const boardsToPatch = boardsToPush.filter((row) => row.server_exists === 1 && row.pending_changes);
    const boardsToSkip = boardsToPush.filter((row) => row.server_exists === 1 && !row.pending_changes);

    await upsertBoards(boardsToInsert.map(toServerInsertBoard));
    await updateBoardPatches(boardsToPatch.map((row) => ({ id: row.id, patch: buildBoardPatch(row) })));
    await upsertCompletions(completionsToPush.map(toServerCompletion));
    await upsertWidgetConfigs(widgetsToPush.map(toServerWidgetConfig));

    await Promise.all(boardsToPush.map((row) => boardsRepo.markSynced(row.id)));
    await Promise.all(completionsToPush.map((row) => completionsRepo.markSynced(row.id)));
    await Promise.all(widgetsToPush.map((row) => widgetConfigsRepo.markSynced(row.id)));
    result.pushed += boardsToInsert.length + boardsToPatch.length + completionsToPush.length + widgetsToPush.length;

    // 3. Pull the cloud state and reconcile locally.
    const cloudBoards = await fetchBoards(userId);
    const [cloudCompletions, cloudWidgets] = await Promise.all([
      fetchCompletions(cloudBoards.map((row) => row.id)),
      fetchWidgetConfigs(userId),
    ]);

    for (const row of cloudBoards) {
      await boardsRepo.upsertFromCloud({
        ...row,
        track_amounts: row.track_amounts ? 1 : 0,
        use_default_amount: row.use_default_amount ? 1 : 0,
        allow_exceeding: row.allow_exceeding ? 1 : 0,
        reminder_enabled: row.reminder_enabled ? 1 : 0,
        archived: row.archived ? 1 : 0,
      });
    }
    for (const row of cloudCompletions) {
      await completionsRepo.upsertFromCloud(row);
    }
    for (const row of cloudWidgets) {
      await widgetConfigsRepo.upsertFromCloud(row);
    }

    await boardsRepo.deleteRowsNotIn(cloudBoards.map((row) => row.id));
    await completionsRepo.deleteRowsNotIn(cloudCompletions.map((row) => row.id));
    await widgetConfigsRepo.deleteRowsNotIn(cloudWidgets.map((row) => row.id));
    result.pulled += cloudBoards.length + cloudCompletions.length + cloudWidgets.length;

    result.ok = true;
    return result;
  } catch (error) {
    result.ok = false;
    result.error = error instanceof Error ? error.message : String(error);
    console.warn('[sync] sync pass failed:', result.error);
    return result;
  }
}

let connectivityUnsubscribe: (() => void) | null = null;

let pendingSyncUserId: string | null = null;
let pendingSyncTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced sync: coalesces bursts of mutation-driven syncs (rapid check-ins,
 * widget reorders, board edits) into a single pass ~2s after the last change.
 * Safe — locally-changed rows stay marked `pending_sync` until the pass runs,
 * so if the app is killed first the next launch/reconnect still pushes them.
 * Use this for fire-and-forget mutation syncs; keep `syncNow` for callers that
 * need the result immediately (launch hydration, pull-to-refresh, reconnect).
 */
export function scheduleSync(userId: string): void {
  pendingSyncUserId = userId;
  if (pendingSyncTimer) clearTimeout(pendingSyncTimer);
  pendingSyncTimer = setTimeout(() => {
    pendingSyncTimer = null;
    const id = pendingSyncUserId;
    pendingSyncUserId = null;
    if (id) void syncNow(id);
  }, 2000);
}

/**
 * Watches connectivity and runs a sync pass automatically whenever the device
 * comes back online. Calling it more than once replaces the previous watcher.
 */
export function startAutoSync(onSync?: (result: SyncResult) => void): void {
  if (connectivityUnsubscribe) {
    connectivityUnsubscribe();
  }
  let wasOnline = false;
  connectivityUnsubscribe = subscribeToConnectivity((online) => {
    if (online && !wasOnline) {
      getActiveUserId().then((userId) => {
        if (userId) {
          syncNow(userId).then((result) => onSync?.(result));
        }
      });
    }
    wasOnline = online;
  });
}

async function getActiveUserId(): Promise<string | null> {
  const { authStore } = await import('@/store/authStore');
  return authStore.getState().userId;
}

export function stopAutoSync(): void {
  connectivityUnsubscribe?.();
  connectivityUnsubscribe = null;
}
