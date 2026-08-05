import { useCallback, useEffect, useState } from 'react';
import { boardsRepo } from '@/lib/db/repositories/boardsRepo';
import { completionsRepo } from '@/lib/db/repositories/completionsRepo';
import { scheduleSync } from '@/lib/sync/syncEngine';
import { scheduleDailyReminder, cancelDailyReminder } from '@/lib/notifications/scheduler';
import { ensureNotificationsPermission } from '@/lib/notifications/permissions';
import { todayISO } from '@/lib/dates';
import type { Board, BoardDraft } from '@/types/board';

export interface UseBoardsResult {
  boards: Board[];
  loading: boolean;
  reload: () => Promise<void>;
  createBoard: (draft: BoardDraft) => Promise<Board>;
  updateBoard: (id: string, changes: Partial<Board>) => Promise<void>;
  setArchived: (id: string, archived: boolean) => Promise<void>;
  removeBoard: (id: string) => Promise<void>;
  /** Toggles today's check-in; returns `true` when checked in. */
  toggleToday: (boardId: string) => Promise<boolean>;
}

async function applyReminder(board: Board) {
  try {
    if (board.reminderEnabled && board.reminderTime) {
      const granted = await ensureNotificationsPermission();
      if (!granted) return;
      const [hour, minute] = board.reminderTime.split(':').map(Number);
      await scheduleDailyReminder({
        identifier: board.id,
        title: board.name,
        body: 'Time to check in — keep the streak alive.',
        hour,
        minute,
        boardId: board.id,
      });
    } else {
      await cancelDailyReminder(board.id);
    }
  } catch (error) {
    console.warn('[notifications] reminder update failed:', error);
  }
}

/** Boards for a user, kept fresh after every mutation. */
export function useBoards(userId: string | null): UseBoardsResult {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      setBoards([]);
      return;
    }
    setLoading(true);
    const rows = await boardsRepo.getAll(userId);
    setBoards(rows);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createBoard = useCallback(
    async (draft: BoardDraft) => {
      if (!userId) throw new Error('Not signed in.');
      const board = await boardsRepo.create(userId, draft);
      await applyReminder(board);
      scheduleSync(userId);
      await reload();
      return board;
    },
    [userId, reload],
  );

  const updateBoard = useCallback(
    async (id: string, changes: Partial<Board>) => {
      if (!userId) return;
      const updated = await boardsRepo.update(id, changes);
      if (updated) {
        await applyReminder(updated);
        scheduleSync(userId);
        await reload();
      }
    },
    [userId, reload],
  );

  const setArchived = useCallback(
    async (id: string, archived: boolean) => {
      if (!userId) return;
      const updated = await boardsRepo.setArchived(id, archived);
      if (updated && archived) await cancelDailyReminder(id);
      scheduleSync(userId);
      await reload();
    },
    [userId, reload],
  );

  const removeBoard = useCallback(
    async (id: string) => {
      if (!userId) return;
      await cancelDailyReminder(id);
      await boardsRepo.remove(id);
      scheduleSync(userId);
      await reload();
    },
    [userId, reload],
  );

  const toggleToday = useCallback(
    async (boardId: string) => {
      if (!userId) return false;
      const today = todayISO();
      const existing = await completionsRepo.getByBoardAndDate(boardId, today);
      if (existing) {
        await completionsRepo.removeForDate(boardId, today);
        scheduleSync(userId);
        return false;
      }
      await completionsRepo.upsertCompletion({ boardId, completedOn: today });
      scheduleSync(userId);
      return true;
    },
    [userId],
  );

  return { boards, loading, reload, createBoard, updateBoard, setArchived, removeBoard, toggleToday };
}
