/**
 * The unit options offered when a board tracks amounts. `key` is what gets
 * stored on the board; `label` is the short display string shown in the picker.
 * The first entry is the default when a board starts tracking amounts.
 */
export interface UnitOption {
  key: string;
  label: string;
}

export const BOARD_UNITS: UnitOption[] = [
  { key: 'count', label: 'Count' },
  { key: 'times', label: 'Times' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'hours', label: 'Hours' },
  { key: 'distance', label: 'Distance' },
];

export function getUnitLabel(key: string): string {
  return BOARD_UNITS.find((unit) => unit.key === key)?.label ?? 'Count';
}