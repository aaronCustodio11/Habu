/** The shape of a board (camelCase, domain-facing). */
export interface Board {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
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
  reminderEnabled: boolean;
  reminderTime: string | null;
};
