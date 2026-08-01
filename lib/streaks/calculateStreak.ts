import { addDays, todayISO } from '@/lib/dates';

export interface StreakInfo {
  /** Consecutive days up to the anchor (alive if today or yesterday is checked in). */
  current: number;
  /** Longest run ever recorded. */
  best: number;
}

/**
 * Streak math for a set of completed dates.
 *
 * - `current`: counts back from the anchor day. If the anchor day itself isn't
 *   completed, the day before it still keeps the streak alive.
 * - `best`: longest consecutive run anywhere in the data.
 */
export function calculateStreak(
  completedDates: Iterable<string>,
  anchor: string = todayISO(),
): StreakInfo {
  const completed = new Set(completedDates);
  return {
    current: calculateCurrentStreak(completed, anchor),
    best: calculateBestStreak(completed),
  };
}

function calculateCurrentStreak(completed: Set<string>, anchor: string): number {
  let cursor = anchor;
  if (!completed.has(cursor)) {
    cursor = addDays(cursor, -1);
    if (!completed.has(cursor)) return 0;
  }
  let streak = 0;
  while (completed.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function calculateBestStreak(completed: Set<string>): number {
  const sorted = [...completed].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    run = prev !== null && addDays(prev, 1) === day ? run + 1 : 1;
    if (run > best) best = run;
    prev = day;
  }
  return best;
}
