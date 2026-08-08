/**
 * The unit options offered when a board tracks amounts. `key` is what gets
 * stored on the board; `label` is the short display name and `abbr` the unit
 * abbreviation shown in the picker. `category` groups them in the picker UI.
 * The first entry ("No Unit") is the default when a board starts tracking
 * amounts.
 */
export type UnitCategoryKey =
  | 'none'
  | 'percent'
  | 'time'
  | 'distance'
  | 'volume'
  | 'weight'
  | 'energy';

export interface UnitCategory {
  key: UnitCategoryKey;
  label: string;
}

export interface UnitOption {
  key: string;
  label: string;
  abbr: string;
  category: UnitCategoryKey;
}

/** Display order of the picker's category sections. */
export const UNIT_CATEGORIES: UnitCategory[] = [
  { key: 'none', label: 'No unit' },
  { key: 'percent', label: 'Percentage' },
  { key: 'time', label: 'Time' },
  { key: 'distance', label: 'Distance' },
  { key: 'volume', label: 'Volume' },
  { key: 'weight', label: 'Weight' },
  { key: 'energy', label: 'Energy' },
];

export const BOARD_UNITS: UnitOption[] = [
  { key: 'count', label: 'No Unit', abbr: '', category: 'none' },
  { key: 'percent', label: 'Percents', abbr: '%', category: 'percent' },
  { key: 'hours', label: 'Hours', abbr: 'hr', category: 'time' },
  { key: 'minutes', label: 'Minutes', abbr: 'min', category: 'time' },
  { key: 'kilometers', label: 'Kilometers', abbr: 'km', category: 'distance' },
  { key: 'meters', label: 'Meters', abbr: 'm', category: 'distance' },
  { key: 'miles', label: 'Miles', abbr: 'mi', category: 'distance' },
  { key: 'feet', label: 'Feet', abbr: 'ft', category: 'distance' },
  { key: 'yards', label: 'Yards', abbr: 'yd', category: 'distance' },
  { key: 'liters', label: 'Liter', abbr: 'L', category: 'volume' },
  { key: 'milliliters', label: 'Milliliters', abbr: 'mL', category: 'volume' },
  { key: 'gallons', label: 'Gallons', abbr: 'gal', category: 'volume' },
  { key: 'fluid-ounces', label: 'Fluid Ounces', abbr: 'fl oz', category: 'volume' },
  { key: 'kilograms', label: 'Kilograms', abbr: 'kg', category: 'weight' },
  { key: 'grams', label: 'Grams', abbr: 'g', category: 'weight' },
  { key: 'milligrams', label: 'Milligrams', abbr: 'mg', category: 'weight' },
  { key: 'pounds', label: 'Pounds', abbr: 'lb', category: 'weight' },
  { key: 'ounces', label: 'Ounces', abbr: 'oz', category: 'weight' },
  { key: 'calories', label: 'Calories', abbr: 'cal', category: 'energy' },
];

export function getUnitLabel(key: string): string {
  return BOARD_UNITS.find((unit) => unit.key === key)?.label ?? 'No Unit';
}

export function getUnitAbbr(key: string): string {
  return BOARD_UNITS.find((unit) => unit.key === key)?.abbr ?? '';
}