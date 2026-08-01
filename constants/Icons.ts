/**
 * The board icon picker options (design doc §6.5).
 *
 * Icons render in the board's own color; they are the one icon category that is
 * allowed to be colored. Glyph names map to MaterialCommunityIcons (via
 * `@expo/vector-icons`), which ships consistent glyphs on iOS and Android.
 */
import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type BoardIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface BoardIconOption {
  key: string;
  label: string;
  icon: BoardIconName;
}

export const BOARD_ICONS: BoardIconOption[] = [
  { key: 'run', label: 'Run', icon: 'run' },
  { key: 'walk', label: 'Walk', icon: 'walk' },
  { key: 'bike', label: 'Bike', icon: 'bike' },
  { key: 'dumbbell', label: 'Workout', icon: 'dumbbell' },
  { key: 'water', label: 'Water', icon: 'water' },
  { key: 'coffee', label: 'Coffee', icon: 'coffee' },
  { key: 'book', label: 'Read', icon: 'book-open-variant' },
  { key: 'notebook', label: 'Journal', icon: 'notebook-outline' },
  { key: 'code', label: 'Code', icon: 'code-braces' },
  { key: 'brush', label: 'Art', icon: 'brush' },
  { key: 'palette', label: 'Design', icon: 'palette' },
  { key: 'music', label: 'Music', icon: 'music' },
  { key: 'guitar', label: 'Guitar', icon: 'guitar-electric' },
  { key: 'sleep', label: 'Sleep', icon: 'sleep' },
  { key: 'meditation', label: 'Meditate', icon: 'meditation' },
  { key: 'heart', label: 'Health', icon: 'heart-pulse' },
  { key: 'leaf', label: 'Nature', icon: 'leaf' },
  { key: 'sprout', label: 'Grow', icon: 'sprout' },
  { key: 'apple', label: 'Eat', icon: 'food-apple' },
  { key: 'food', label: 'Cook', icon: 'silverware-fork-knife' },
  { key: 'cash', label: 'Save', icon: 'cash' },
  { key: 'pill', label: 'Medicate', icon: 'pill' },
  { key: 'paw', label: 'Pets', icon: 'paw' },
  { key: 'fire', label: 'Streak', icon: 'fire' },
  { key: 'trophy', label: 'Goal', icon: 'trophy' },
  { key: 'star', label: 'Focus', icon: 'star' },
  { key: 'car', label: 'Drive', icon: 'car' },
  { key: 'home', label: 'Home', icon: 'home-variant' },
  { key: 'lightbulb', label: 'Idea', icon: 'lightbulb-on' },
  { key: 'laptop', label: 'Work', icon: 'laptop' },
];

export function getBoardIcon(key: string): BoardIconOption {
  return BOARD_ICONS.find((icon) => icon.key === key) ?? BOARD_ICONS[0];
}
