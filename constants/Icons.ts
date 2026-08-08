/**
 * The board icon picker options (design doc §6.5).
 *
 * Icons render in the board's own color; they are the one icon category that is
 * allowed to be colored. Glyph names map to MaterialCommunityIcons (via
 * `@expo/vector-icons`), which ships consistent glyphs on iOS and Android. Keys
 * are stable identifiers persisted on boards — never rename or repurpose a key.
 */
import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type BoardIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface BoardIconOption {
  key: string;
  label: string;
  icon: BoardIconName;
  category: string;
}

export const BOARD_ICONS: BoardIconOption[] = [
  // Fitness & activity
  { key: 'run', label: 'Run', icon: 'run', category: 'fitness' },
  { key: 'run-fast', label: 'Sprint', icon: 'run-fast', category: 'fitness' },
  { key: 'walk', label: 'Walk', icon: 'walk', category: 'fitness' },
  { key: 'hiking', label: 'Hike', icon: 'hiking', category: 'fitness' },
  { key: 'bike', label: 'Cycle', icon: 'bike', category: 'fitness' },
  { key: 'bike-fast', label: 'Bike fast', icon: 'bike-fast', category: 'fitness' },
  { key: 'bike-mountain', label: 'MTB', icon: 'bike-pedal-mountain', category: 'fitness' },
  { key: 'dumbbell', label: 'Lift weights', icon: 'dumbbell', category: 'fitness' },
  { key: 'kettlebell', label: 'Kettlebell', icon: 'kettlebell', category: 'fitness' },
  { key: 'weight-lifter', label: 'Weightlift', icon: 'weight-lifter', category: 'fitness' },
  { key: 'weight', label: 'Lose weight', icon: 'scale-bathroom', category: 'fitness' },
  { key: 'yoga', label: 'Yoga', icon: 'yoga', category: 'fitness' },
  { key: 'swim', label: 'Swim', icon: 'swim', category: 'fitness' },
  { key: 'surf', label: 'Surf', icon: 'surfing', category: 'fitness' },
  { key: 'kayak', label: 'Kayak', icon: 'kayaking', category: 'fitness' },
  { key: 'skateboard', label: 'Skate', icon: 'skateboard', category: 'fitness' },
  { key: 'snowboard', label: 'Snowboard', icon: 'snowboard', category: 'fitness' },

  // Sports
  { key: 'basketball', label: 'Basketball', icon: 'basketball', category: 'sports' },
  { key: 'soccer', label: 'Soccer', icon: 'soccer', category: 'sports' },
  { key: 'baseball', label: 'Baseball', icon: 'baseball', category: 'sports' },
  { key: 'tennis', label: 'Tennis', icon: 'tennis', category: 'sports' },
  { key: 'golf', label: 'Golf', icon: 'golf', category: 'sports' },
  { key: 'volleyball', label: 'Volleyball', icon: 'volleyball', category: 'sports' },

  // Food & drink
  { key: 'water', label: 'Drink water', icon: 'water', category: 'food' },
  { key: 'coffee', label: 'Coffee', icon: 'coffee', category: 'food' },
  { key: 'tea', label: 'Tea', icon: 'tea', category: 'food' },
  { key: 'smoothie', label: 'Smoothie', icon: 'glass-cocktail', category: 'food' },
  { key: 'beer', label: 'No beer', icon: 'beer-outline', category: 'food' },
  { key: 'wine', label: 'No wine', icon: 'glass-wine', category: 'food' },
  { key: 'apple', label: 'Eat fruit', icon: 'food-apple', category: 'food' },
  { key: 'cherries', label: 'Berries', icon: 'fruit-cherries', category: 'food' },
  { key: 'citrus', label: 'Citrus', icon: 'fruit-citrus', category: 'food' },
  { key: 'veggie', label: 'Eat veg', icon: 'carrot', category: 'food' },
  { key: 'food', label: 'Cook', icon: 'chef-hat', category: 'food' },
  { key: 'fresh-meal', label: 'No junk food', icon: 'food-off', category: 'food' },
  { key: 'meat', label: 'Protein', icon: 'food-drumstick', category: 'food' },
  { key: 'fastfood', label: 'Fast food', icon: 'hamburger', category: 'food' },
  { key: 'pizza', label: 'Pizza', icon: 'pizza', category: 'food' },

  // Mind & rest
  { key: 'meditation', label: 'Meditate', icon: 'meditation', category: 'mind' },
  { key: 'sleep', label: 'Sleep', icon: 'sleep', category: 'mind' },
  { key: 'gratitude', label: 'Gratitude', icon: 'book-open-page-variant', category: 'mind' },
  { key: 'journal', label: 'Journal', icon: 'notebook-outline', category: 'mind' },
  { key: 'deep-breath', label: 'Breathe', icon: 'lungs', category: 'mind' },
  { key: 'unplug', label: 'Unplug', icon: 'cellphone-off', category: 'mind' },
  { key: 'calm', label: 'Stay calm', icon: 'weather-sunset', category: 'mind' },

  // Health & wellness
  { key: 'heart', label: 'Heart health', icon: 'heart-pulse', category: 'health' },
  { key: 'brain', label: 'Brain training', icon: 'brain', category: 'health' },
  { key: 'tooth', label: 'Brush teeth', icon: 'tooth', category: 'health' },
  { key: 'smile', label: 'Be happy', icon: 'emoticon-happy', category: 'health' },
  { key: 'vitamins', label: 'Vitamins', icon: 'pill-multiple', category: 'health' },
  { key: 'medicine', label: 'Medicate', icon: 'pill', category: 'health' },
  { key: 'doctor', label: 'Doctor', icon: 'medical-bag', category: 'health' },
  { key: 'stretch', label: 'Stretch', icon: 'human', category: 'health' },

  // Nature
  { key: 'leaf', label: 'Nature', icon: 'leaf', category: 'nature' },
  { key: 'sprout', label: 'Grow', icon: 'sprout', category: 'nature' },
  { key: 'plant', label: 'Water plants', icon: 'flower-tulip', category: 'nature' },
  { key: 'tree-day', label: 'Plant a tree', icon: 'tree', category: 'nature' },
  { key: 'outside', label: 'Go outside', icon: 'weather-sunny', category: 'nature' },
  { key: 'beach-day', label: 'Beach', icon: 'beach', category: 'nature' },
  { key: 'camp', label: 'Camping', icon: 'campfire', category: 'nature' },
  { key: 'bird', label: 'Bird watch', icon: 'bird', category: 'nature' },

  // Pets
  { key: 'paw', label: 'Pets', icon: 'paw', category: 'pets' },
  { key: 'dog', label: 'Dog', icon: 'dog-side', category: 'pets' },
  { key: 'cat', label: 'Cat', icon: 'cat', category: 'pets' },
  { key: 'horse', label: 'Horse', icon: 'horse', category: 'pets' },
  { key: 'fish-pot', label: 'Fish', icon: 'fish', category: 'pets' },

  // Money
  { key: 'cash', label: 'Save money', icon: 'cash-multiple', category: 'money' },
  { key: 'budget', label: 'Budget', icon: 'wallet', category: 'money' },
  { key: 'invest', label: 'Invest', icon: 'trending-up', category: 'money' },
  { key: 'no-spend', label: 'No spend', icon: 'cash-off', category: 'money' },

  // Creative & learning
  { key: 'code', label: 'Code', icon: 'code-braces', category: 'creative' },
  { key: 'brush', label: 'Art', icon: 'brush', category: 'creative' },
  { key: 'palette', label: 'Design', icon: 'palette', category: 'creative' },
  { key: 'write-novel', label: 'Write', icon: 'pen', category: 'creative' },
  { key: 'music', label: 'Practice music', icon: 'music', category: 'creative' },
  { key: 'guitar', label: 'Guitar', icon: 'guitar-electric', category: 'creative' },
  { key: 'piano', label: 'Piano', icon: 'piano', category: 'creative' },
  { key: 'sing', label: 'Sing', icon: 'microphone-outline', category: 'creative' },
  { key: 'study', label: 'Study', icon: 'book-open-variant', category: 'creative' },
  { key: 'learn-language', label: 'Learn language', icon: 'alphabetical', category: 'creative' },
  { key: 'science', label: 'Science', icon: 'atom', category: 'creative' },

  // Home & chores
  { key: 'home', label: 'Home', icon: 'home-variant', category: 'home' },
  { key: 'clean', label: 'Clean', icon: 'spray-bottle', category: 'home' },
  { key: 'laundry', label: 'Laundry', icon: 'washing-machine', category: 'home' },
  { key: 'dishes', label: 'Dishes', icon: 'silverware', category: 'home' },
  { key: 'groceries', label: 'Groceries', icon: 'cart', category: 'home' },
  { key: 'organize', label: 'Declutter', icon: 'clipboard-outline', category: 'home' },
  { key: 'repair', label: 'Fix it', icon: 'wrench', category: 'home' },

  // Tech & habits
  { key: 'laptop', label: 'Work', icon: 'laptop', category: 'tech' },
  { key: 'no-phone', label: 'No phone', icon: 'cellphone-off', category: 'tech' },
  { key: 'no-social', label: 'No social', icon: 'message-off', category: 'tech' },
  { key: 'gaming', label: 'Game', icon: 'gamepad-variant', category: 'tech' },
  { key: 'learn-tech', label: 'Learn tech', icon: 'server', category: 'tech' },

  // Lifestyle
  { key: 'fire', label: 'Streak', icon: 'fire', category: 'lifestyle' },
  { key: 'trophy', label: 'Goal', icon: 'trophy', category: 'lifestyle' },
  { key: 'star', label: 'Focus', icon: 'star', category: 'lifestyle' },
  { key: 'gift', label: 'Give', icon: 'gift-outline', category: 'lifestyle' },
  { key: 'travel', label: 'Travel', icon: 'airplane', category: 'lifestyle' },
  { key: 'road-trip', label: 'Road trip', icon: 'car', category: 'lifestyle' },
  { key: 'no-alcohol', label: 'No alcohol', icon: 'glass-wine', category: 'lifestyle' },
  { key: 'early-rise', label: 'Early rise', icon: 'weather-sunset-up', category: 'lifestyle' },
  { key: 'lightbulb', label: 'Idea', icon: 'lightbulb-on', category: 'lifestyle' },
  { key: 'focus', label: 'Focus time', icon: 'timer-outline', category: 'lifestyle' },
  { key: 'floss', label: 'Floss', icon: 'tooth', category: 'lifestyle' },
  { key: 'no-sugar', label: 'No sugar', icon: 'candy', category: 'lifestyle' },
  { key: 'water-plant-day', label: 'Water plant', icon: 'flower', category: 'lifestyle' },
  { key: 'craft', label: 'Crafts', icon: 'scissors-cutting', category: 'lifestyle' },
  { key: 'volunteer', label: 'Volunteer', icon: 'hand-heart', category: 'lifestyle' },
  { key: 'phone-off-night', label: 'Screen off', icon: 'sleep', category: 'lifestyle' },
];

export function getBoardIcon(key: string): BoardIconOption {
  return BOARD_ICONS.find((icon) => icon.key === key) ?? BOARD_ICONS[0];
}