import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  fetchBoards,
  fetchCompletions,
  fetchWidgetConfigs,
  upsertBoards,
  upsertCompletions,
  upsertWidgetConfigs,
  deleteBoards,
  deleteCompletions,
  deleteWidgetConfigs,
} from '@/lib/supabase/queries';
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

function toServerBoard(row: BoardLocalRow) {
  const { pending_sync: _p, pending_delete: _d, ...server } = row;
  return {
    ...server,
    track_amounts: row.track_amounts === 1,
    use_default_amount: row.use_default_amount === 1,
    reminder_enabled: row.reminder_enabled === 1,
    archived: row.archived === 1,
  };
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
 */
export async function syncNow(userId: string): Promise<SyncResult> {
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
    await upsertBoards(boardsToPush.map(toServerBoard));
    await upsertCompletions(completionsToPush.map(toServerCompletion));
    await upsertWidgetConfigs(widgetsToPush.map(toServerWidgetConfig));

    await Promise.all(boardsToPush.map((row) => boardsRepo.markSynced(row.id)));
    await Promise.all(completionsToPush.map((row) => completionsRepo.markSynced(row.id)));
    await Promise.all(widgetsToPush.map((row) => widgetConfigsRepo.markSynced(row.id)));
    result.pushed += boardsToPush.length + completionsToPush.length + widgetsToPush.length;

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
