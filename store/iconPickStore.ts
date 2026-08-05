import { create } from 'zustand';

interface IconPickState {
  /** Icon key the picker modal selected; consumed by the board form. */
  picked: string | null;
  setPicked: (icon: string | null) => void;
}

/** One-way handoff from the icon-picker sheet back to the board form. */
export const iconPickStore = create<IconPickState>()((set) => ({
  picked: null,
  setPicked: (icon) => set({ picked: icon }),
}));