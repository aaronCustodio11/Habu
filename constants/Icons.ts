/**
 * The board icon picker options (design doc §6.5).
 *
 * Icons render in the board's own color; they are the one icon category that is
 * allowed to be colored. Glyph names map to lucide icons (`lucide-react-native`),
 * which ships consistent stroke glyphs on iOS and Android. Keys are stable
 * identifiers persisted on boards — never rename or repurpose a key.
 */
import type { LucideIconName } from '@/components/ui/LucideIcon';

export type BoardIconName = LucideIconName;

export interface BoardIconOption {
  key: string;
  label: string;
  icon: BoardIconName;
  category: string;
}

export const BOARD_ICONS: BoardIconOption[] = [
  // Fitness & activity
  { key: 'run', label: 'Run', icon: 'Footprints', category: 'fitness' },
  { key: 'run-fast', label: 'Sprint', icon: 'Zap', category: 'fitness' },
  { key: 'walk', label: 'Walk', icon: 'Footprints', category: 'fitness' },
  { key: 'hiking', label: 'Hike', icon: 'Mountain', category: 'fitness' },
  { key: 'bike', label: 'Cycle', icon: 'Bike', category: 'fitness' },
  { key: 'bike-fast', label: 'Bike fast', icon: 'Bike', category: 'fitness' },
  { key: 'bike-mountain', label: 'MTB', icon: 'Bike', category: 'fitness' },
  { key: 'dumbbell', label: 'Lift weights', icon: 'Dumbbell', category: 'fitness' },
  { key: 'kettlebell', label: 'Kettlebell', icon: 'Weight', category: 'fitness' },
  { key: 'weight-lifter', label: 'Weightlift', icon: 'PersonStanding', category: 'fitness' },
  { key: 'weight', label: 'Lose weight', icon: 'Scale', category: 'fitness' },
  { key: 'yoga', label: 'Yoga', icon: 'PersonStanding', category: 'fitness' },
  { key: 'swim', label: 'Swim', icon: 'Waves', category: 'fitness' },
  { key: 'surf', label: 'Surf', icon: 'Waves', category: 'fitness' },
  { key: 'kayak', label: 'Kayak', icon: 'Kayak', category: 'fitness' },
  { key: 'skateboard', label: 'Skate', icon: 'SportShoe', category: 'fitness' },
  { key: 'snowboard', label: 'Snowboard', icon: 'Snowflake', category: 'fitness' },

  // Sports
  { key: 'basketball', label: 'Basketball', icon: 'Target', category: 'sports' },
  { key: 'soccer', label: 'Soccer', icon: 'Goal', category: 'sports' },
  { key: 'baseball', label: 'Baseball', icon: 'Medal', category: 'sports' },
  { key: 'tennis', label: 'Tennis', icon: 'CircleDot', category: 'sports' },
  { key: 'golf', label: 'Golf', icon: 'Flag', category: 'sports' },
  { key: 'volleyball', label: 'Volleyball', icon: 'Volleyball', category: 'sports' },

  // Food & drink
  { key: 'water', label: 'Drink water', icon: 'GlassWater', category: 'food' },
  { key: 'coffee', label: 'Coffee', icon: 'Coffee', category: 'food' },
  { key: 'tea', label: 'Tea', icon: 'Coffee', category: 'food' },
  { key: 'smoothie', label: 'Smoothie', icon: 'Martini', category: 'food' },
  { key: 'beer', label: 'No beer', icon: 'Beer', category: 'food' },
  { key: 'wine', label: 'No wine', icon: 'Wine', category: 'food' },
  { key: 'apple', label: 'Eat fruit', icon: 'Apple', category: 'food' },
  { key: 'cherries', label: 'Berries', icon: 'Cherry', category: 'food' },
  { key: 'citrus', label: 'Citrus', icon: 'Citrus', category: 'food' },
  { key: 'veggie', label: 'Eat veg', icon: 'Carrot', category: 'food' },
  { key: 'food', label: 'Cook', icon: 'ChefHat', category: 'food' },
  { key: 'fresh-meal', label: 'No junk food', icon: 'Salad', category: 'food' },
  { key: 'meat', label: 'Protein', icon: 'Drumstick', category: 'food' },
  { key: 'fastfood', label: 'Fast food', icon: 'Hamburger', category: 'food' },
  { key: 'pizza', label: 'Pizza', icon: 'Pizza', category: 'food' },

  // Mind & rest
  { key: 'meditation', label: 'Meditate', icon: 'PersonStanding', category: 'mind' },
  { key: 'sleep', label: 'Sleep', icon: 'Moon', category: 'mind' },
  { key: 'gratitude', label: 'Gratitude', icon: 'BookHeart', category: 'mind' },
  { key: 'journal', label: 'Journal', icon: 'Notebook', category: 'mind' },
  { key: 'deep-breath', label: 'Breathe', icon: 'Wind', category: 'mind' },
  { key: 'unplug', label: 'Unplug', icon: 'Unplug', category: 'mind' },
  { key: 'calm', label: 'Stay calm', icon: 'Sunset', category: 'mind' },

  // Health & wellness
  { key: 'heart', label: 'Heart health', icon: 'HeartPulse', category: 'health' },
  { key: 'brain', label: 'Brain training', icon: 'Brain', category: 'health' },
  { key: 'tooth', label: 'Brush teeth', icon: 'Sparkles', category: 'health' },
  { key: 'smile', label: 'Be happy', icon: 'Smile', category: 'health' },
  { key: 'vitamins', label: 'Vitamins', icon: 'Pill', category: 'health' },
  { key: 'medicine', label: 'Medicate', icon: 'Syringe', category: 'health' },
  { key: 'doctor', label: 'Doctor', icon: 'BriefcaseMedical', category: 'health' },
  { key: 'stretch', label: 'Stretch', icon: 'PersonStanding', category: 'health' },

  // Nature
  { key: 'leaf', label: 'Nature', icon: 'Leaf', category: 'nature' },
  { key: 'sprout', label: 'Grow', icon: 'Sprout', category: 'nature' },
  { key: 'plant', label: 'Water plants', icon: 'Flower2', category: 'nature' },
  { key: 'tree-day', label: 'Plant a tree', icon: 'TreePine', category: 'nature' },
  { key: 'outside', label: 'Go outside', icon: 'Sun', category: 'nature' },
  { key: 'beach-day', label: 'Beach', icon: 'Palmtree', category: 'nature' },
  { key: 'camp', label: 'Camping', icon: 'Tent', category: 'nature' },
  { key: 'bird', label: 'Bird watch', icon: 'Bird', category: 'nature' },

  // Pets
  { key: 'paw', label: 'Pets', icon: 'PawPrint', category: 'pets' },
  { key: 'dog', label: 'Dog', icon: 'Dog', category: 'pets' },
  { key: 'cat', label: 'Cat', icon: 'Cat', category: 'pets' },
  { key: 'horse', label: 'Horse', icon: 'Rabbit', category: 'pets' },
  { key: 'fish-pot', label: 'Fish', icon: 'Fish', category: 'pets' },

  // Money
  { key: 'cash', label: 'Save money', icon: 'Banknote', category: 'money' },
  { key: 'budget', label: 'Budget', icon: 'Wallet', category: 'money' },
  { key: 'invest', label: 'Invest', icon: 'TrendingUp', category: 'money' },
  { key: 'no-spend', label: 'No spend', icon: 'BanknoteX', category: 'money' },

  // Creative & learning
  { key: 'code', label: 'Code', icon: 'Code', category: 'creative' },
  { key: 'brush', label: 'Art', icon: 'Brush', category: 'creative' },
  { key: 'palette', label: 'Design', icon: 'Palette', category: 'creative' },
  { key: 'write-novel', label: 'Write', icon: 'Pen', category: 'creative' },
  { key: 'music', label: 'Practice music', icon: 'Music', category: 'creative' },
  { key: 'guitar', label: 'Guitar', icon: 'Guitar', category: 'creative' },
  { key: 'piano', label: 'Piano', icon: 'Piano', category: 'creative' },
  { key: 'sing', label: 'Sing', icon: 'Mic', category: 'creative' },
  { key: 'study', label: 'Study', icon: 'GraduationCap', category: 'creative' },
  { key: 'learn-language', label: 'Learn language', icon: 'Languages', category: 'creative' },
  { key: 'science', label: 'Science', icon: 'Atom', category: 'creative' },

  // Home & chores
  { key: 'home', label: 'Home', icon: 'Home', category: 'home' },
  { key: 'clean', label: 'Clean', icon: 'SprayCan', category: 'home' },
  { key: 'laundry', label: 'Laundry', icon: 'WashingMachine', category: 'home' },
  { key: 'dishes', label: 'Dishes', icon: 'Utensils', category: 'home' },
  { key: 'groceries', label: 'Groceries', icon: 'ShoppingCart', category: 'home' },
  { key: 'organize', label: 'Declutter', icon: 'Clipboard', category: 'home' },
  { key: 'repair', label: 'Fix it', icon: 'Wrench', category: 'home' },

  // Tech & habits
  { key: 'laptop', label: 'Work', icon: 'Laptop', category: 'tech' },
  { key: 'no-phone', label: 'No phone', icon: 'PhoneOff', category: 'tech' },
  { key: 'no-social', label: 'No social', icon: 'MessageSquareOff', category: 'tech' },
  { key: 'gaming', label: 'Game', icon: 'Gamepad2', category: 'tech' },
  { key: 'learn-tech', label: 'Learn tech', icon: 'Server', category: 'tech' },

  // Lifestyle
  { key: 'fire', label: 'Streak', icon: 'Flame', category: 'lifestyle' },
  { key: 'trophy', label: 'Goal', icon: 'Trophy', category: 'lifestyle' },
  { key: 'star', label: 'Focus', icon: 'Star', category: 'lifestyle' },
  { key: 'gift', label: 'Give', icon: 'Gift', category: 'lifestyle' },
  { key: 'travel', label: 'Travel', icon: 'Plane', category: 'lifestyle' },
  { key: 'road-trip', label: 'Road trip', icon: 'Car', category: 'lifestyle' },
  { key: 'no-alcohol', label: 'No alcohol', icon: 'WineOff', category: 'lifestyle' },
  { key: 'early-rise', label: 'Early rise', icon: 'Sunrise', category: 'lifestyle' },
  { key: 'lightbulb', label: 'Idea', icon: 'Lightbulb', category: 'lifestyle' },
  { key: 'focus', label: 'Focus time', icon: 'Timer', category: 'lifestyle' },
  { key: 'floss', label: 'Floss', icon: 'Sparkles', category: 'lifestyle' },
  { key: 'no-sugar', label: 'No sugar', icon: 'CandyOff', category: 'lifestyle' },
  { key: 'water-plant-day', label: 'Water plant', icon: 'Flower', category: 'lifestyle' },
  { key: 'craft', label: 'Crafts', icon: 'Scissors', category: 'lifestyle' },
  { key: 'volunteer', label: 'Volunteer', icon: 'HandHeart', category: 'lifestyle' },
  { key: 'phone-off-night', label: 'Screen off', icon: 'Moon', category: 'lifestyle' },
];

export function getBoardIcon(key: string): BoardIconOption {
  return BOARD_ICONS.find((icon) => icon.key === key) ?? BOARD_ICONS[0];
}
