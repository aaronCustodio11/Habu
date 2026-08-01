import { useCallback, useEffect, useState } from 'react';
import { completionsRepo } from '@/lib/db/repositories/completionsRepo';
import { syncNow } from '@/lib/sync/syncEngine';
import { todayISO } from '@/lib/dates';
import type { Completion } from '@/types/completion';

export interface UseCompletionsResult {
  completions: Completion[];
  loading: boolean;
  dates: Set<string>;
  isCheckedInToday: boolean;
  reload: () => Promise<void>;
  checkIn: (note?: string) => Promise<void>;
  undoToday: () => Promise<void>;
}

/** All check-ins for one board, plus today-toggle helpers. */
export function useCompletions(boardId: string, userId: string | null): UseCompletionsResult {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const rows = await completionsRepo.getByBoard(boardId);
    setCompletions(rows);
    setLoading(false);
  }, [boardId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const dates = new Set(completions.map((c) => c.completedOn));
  const isCheckedInToday = dates.has(todayISO());

  const checkIn = useCallback(
    async (note?: string) => {
      await completionsRepo.upsertCompletion({ boardId, completedOn: todayISO(), note });
      if (userId) void syncNow(userId);
      await reload();
    },
    [boardId, userId, reload],
  );

  const undoToday = useCallback(async () => {
    await completionsRepo.removeForDate(boardId, todayISO());
    if (userId) void syncNow(userId);
    await reload();
  }, [boardId, userId, reload]);

  return { completions, loading, dates, isCheckedInToday, reload, checkIn, undoToday };
}
