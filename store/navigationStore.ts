import { create } from 'zustand';

interface NavigationState {
  /** True while the create-board sheet is focused, regardless of which tab it
   * was opened from. Lets the floating navbar hide reliably without guessing
   * at nested navigator state (which is absent for not-yet-mounted tabs). */
  isCreateBoardFocused: boolean;
  setCreateBoardFocused: (focused: boolean) => void;
}

export const navigationStore = create<NavigationState>()((set) => ({
  isCreateBoardFocused: false,
  setCreateBoardFocused: (focused) => set({ isCreateBoardFocused: focused }),
}));