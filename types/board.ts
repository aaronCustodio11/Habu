import type { BoardLayout } from '@/constants/BoardLayouts';

/** The shape of a board (camelCase, domain-facing). */
export interface Board {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  /** How the board's history is visualized on the detail screen. */
  layout: BoardLayout;
  /** When true the board records an amount (with `unit`) on each check-in. */
  trackAmounts: boolean;
  /** Unit label used when `trackAmounts` is on (e.g. count, minutes, km). */
  unit: string;
  /** When true a check-in pre-fills the amount with `defaultAmount`. */
  useDefaultAmount: boolean;
  /** Default amount applied to a check-in when `useDefaultAmount` is on. */
  defaultAmount: number | null;
  /** Daily target amount shown to the user as a goal. */
  dailyTargetAmount: number | null;
  /** When true logged amounts may go above the daily target. */
  allowExceeding: boolean;
  reminderEnabled: boolean;
  reminderTime: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Everything needed to create a new board. */
export type BoardDraft = {
  name: string;
  icon: string;
  color: string;
  layout: BoardLayout;
  trackAmounts: boolean;
  unit: string;
  useDefaultAmount: boolean;
  defaultAmount: number | null;
  dailyTargetAmount: number | null;
  allowExceeding: boolean;
  reminderEnabled: boolean;
  reminderTime: string | null;
};
