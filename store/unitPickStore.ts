import { create } from 'zustand';

interface UnitPickState {
  /** Unit key the picker modal selected; consumed by the board form. */
  picked: string | null;
  setPicked: (unit: string | null) => void;
}

/** One-way handoff from the unit-picker sheet back to the board form. */
export const unitPickStore = create<UnitPickState>()((set) => ({
  picked: null,
  setPicked: (unit) => set({ picked: unit }),
}));