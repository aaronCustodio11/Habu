/** A single completed check-in for a board on a given day. */
export interface Completion {
  id: string;
  boardId: string;
  /** Local date key in YYYY-MM-DD form. */
  completedOn: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CompletionDraft = {
  boardId: string;
  completedOn: string;
  note?: string | null;
};
