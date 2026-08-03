import { create } from 'zustand';

interface UiState {
  notice: string | null;
  setNotice: (message: string | null) => void;
}

/** Transient, non-persisted UI flags. Used to carry a one-shot notice
 *  (e.g. "account created — check your email") between auth screens. */
export const uiStore = create<UiState>((set) => ({
  notice: null,
  setNotice: (notice) => set({ notice }),
}));
