/**
 * Curated lucide icon registry (tree-shakeable).
 *
 * Imports each icon from its individual `lucide-react-native/icons/*`
 * module instead of the package barrel, so the bundler only ships the
 * icons actually used. `LucideIcon` resolves dynamic icon strings
 * (board icons, widget icons, settings rows) through this map.
 *
 * Kept in sync with `constants/Icons.ts`, `constants/WidgetTypes.ts`,
 * `constants/BoardLayouts.ts` and every direct `lucide-react-native`
 * import in the app. New icons must be added here (and as subpath
 * imports at their call sites) or they will not render.
 */
import type { LucideIcon } from 'lucide-react-native';

import Apple from 'lucide-react-native/icons/apple';
import Archive from 'lucide-react-native/icons/archive';
import Atom from 'lucide-react-native/icons/atom';
import Banknote from 'lucide-react-native/icons/banknote';
import BanknoteX from 'lucide-react-native/icons/banknote-x';
import Beer from 'lucide-react-native/icons/beer';
import Bell from 'lucide-react-native/icons/bell';
import Bike from 'lucide-react-native/icons/bike';
import Bird from 'lucide-react-native/icons/bird';
import BookHeart from 'lucide-react-native/icons/book-heart';
import Brain from 'lucide-react-native/icons/brain';
import BriefcaseMedical from 'lucide-react-native/icons/briefcase-medical';
import Brush from 'lucide-react-native/icons/brush';
import Calendar from 'lucide-react-native/icons/calendar';
import CandyOff from 'lucide-react-native/icons/candy-off';
import Car from 'lucide-react-native/icons/car';
import Carrot from 'lucide-react-native/icons/carrot';
import Cat from 'lucide-react-native/icons/cat';
import ChartColumn from 'lucide-react-native/icons/chart-column';
import Check from 'lucide-react-native/icons/check';
import ChefHat from 'lucide-react-native/icons/chef-hat';
import Cherry from 'lucide-react-native/icons/cherry';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import ChevronUp from 'lucide-react-native/icons/chevron-up';
import Circle from 'lucide-react-native/icons/circle';
import CircleAlert from 'lucide-react-native/icons/circle-alert';
import CircleCheck from 'lucide-react-native/icons/circle-check';
import CircleDot from 'lucide-react-native/icons/circle-dot';
import CircleUser from 'lucide-react-native/icons/circle-user';
import Citrus from 'lucide-react-native/icons/citrus';
import Clipboard from 'lucide-react-native/icons/clipboard';
import CloudOff from 'lucide-react-native/icons/cloud-off';
import Code from 'lucide-react-native/icons/code';
import Coffee from 'lucide-react-native/icons/coffee';
import Contrast from 'lucide-react-native/icons/contrast';
import Dog from 'lucide-react-native/icons/dog';
import Drumstick from 'lucide-react-native/icons/drumstick';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import Fish from 'lucide-react-native/icons/fish';
import Flag from 'lucide-react-native/icons/flag';
import Flame from 'lucide-react-native/icons/flame';
import Flower from 'lucide-react-native/icons/flower';
import Flower2 from 'lucide-react-native/icons/flower-2';
import Footprints from 'lucide-react-native/icons/footprints';
import Gamepad2 from 'lucide-react-native/icons/gamepad-2';
import Gift from 'lucide-react-native/icons/gift';
import GlassWater from 'lucide-react-native/icons/glass-water';
import Goal from 'lucide-react-native/icons/goal';
import GraduationCap from 'lucide-react-native/icons/graduation-cap';
import Guitar from 'lucide-react-native/icons/guitar';
import Hamburger from 'lucide-react-native/icons/hamburger';
import HandHeart from 'lucide-react-native/icons/hand-heart';
import HeartPulse from 'lucide-react-native/icons/heart-pulse';
import Home from 'lucide-react-native/icons/house';
import Inbox from 'lucide-react-native/icons/inbox';
import Info from 'lucide-react-native/icons/info';
import Kayak from 'lucide-react-native/icons/kayak';
import Languages from 'lucide-react-native/icons/languages';
import Laptop from 'lucide-react-native/icons/laptop';
import LayoutGrid from 'lucide-react-native/icons/layout-grid';
import Leaf from 'lucide-react-native/icons/leaf';
import Lightbulb from 'lucide-react-native/icons/lightbulb';
import MailCheck from 'lucide-react-native/icons/mail-check';
import Martini from 'lucide-react-native/icons/martini';
import Medal from 'lucide-react-native/icons/medal';
import MessageSquareOff from 'lucide-react-native/icons/message-square-off';
import Mic from 'lucide-react-native/icons/mic';
import Minus from 'lucide-react-native/icons/minus';
import Moon from 'lucide-react-native/icons/moon';
import Mountain from 'lucide-react-native/icons/mountain';
import Music from 'lucide-react-native/icons/music';
import Notebook from 'lucide-react-native/icons/notebook';
import Palette from 'lucide-react-native/icons/palette';
import Palmtree from 'lucide-react-native/icons/tree-palm';
import PawPrint from 'lucide-react-native/icons/paw-print';
import Pen from 'lucide-react-native/icons/pen';
import Pencil from 'lucide-react-native/icons/pencil';
import PencilLine from 'lucide-react-native/icons/pencil-line';
import Percent from 'lucide-react-native/icons/percent';
import PersonStanding from 'lucide-react-native/icons/person-standing';
import PhoneOff from 'lucide-react-native/icons/phone-off';
import Piano from 'lucide-react-native/icons/piano';
import Pill from 'lucide-react-native/icons/pill';
import Pizza from 'lucide-react-native/icons/pizza';
import Plane from 'lucide-react-native/icons/plane';
import Plus from 'lucide-react-native/icons/plus';
import Pointer from 'lucide-react-native/icons/pointer';
import Rabbit from 'lucide-react-native/icons/rabbit';
import Rows3 from 'lucide-react-native/icons/rows-3';
import Salad from 'lucide-react-native/icons/salad';
import Scale from 'lucide-react-native/icons/scale';
import Scissors from 'lucide-react-native/icons/scissors';
import Search from 'lucide-react-native/icons/search';
import Server from 'lucide-react-native/icons/server';
import Settings from 'lucide-react-native/icons/settings';
import ShoppingCart from 'lucide-react-native/icons/shopping-cart';
import SlidersHorizontal from 'lucide-react-native/icons/sliders-horizontal';
import Smile from 'lucide-react-native/icons/face-slightly-smiling';
import Snowflake from 'lucide-react-native/icons/snowflake';
import Sparkles from 'lucide-react-native/icons/sparkles';
import SportShoe from 'lucide-react-native/icons/sport-shoe';
import SprayCan from 'lucide-react-native/icons/spray-can';
import Sprout from 'lucide-react-native/icons/sprout';
import Star from 'lucide-react-native/icons/star';
import Sun from 'lucide-react-native/icons/sun';
import Sunrise from 'lucide-react-native/icons/sunrise';
import Sunset from 'lucide-react-native/icons/sunset';
import Syringe from 'lucide-react-native/icons/syringe';
import Target from 'lucide-react-native/icons/target';
import Tent from 'lucide-react-native/icons/tent';
import Timer from 'lucide-react-native/icons/timer';
import Trash2 from 'lucide-react-native/icons/trash-2';
import TreePine from 'lucide-react-native/icons/tree-pine';
import TrendingUp from 'lucide-react-native/icons/trending-up';
import Trophy from 'lucide-react-native/icons/trophy';
import Unplug from 'lucide-react-native/icons/unplug';
import Utensils from 'lucide-react-native/icons/utensils';
import Volleyball from 'lucide-react-native/icons/volleyball';
import Wallet from 'lucide-react-native/icons/wallet';
import WashingMachine from 'lucide-react-native/icons/washing-machine';
import Waves from 'lucide-react-native/icons/waves-horizontal';
import Weight from 'lucide-react-native/icons/weight';
import Wind from 'lucide-react-native/icons/wind';
import Wine from 'lucide-react-native/icons/wine';
import WineOff from 'lucide-react-native/icons/wine-off';
import Wrench from 'lucide-react-native/icons/wrench';
import X from 'lucide-react-native/icons/x';
import Zap from 'lucide-react-native/icons/zap';

export const LUCIDE_ICONS = {
  Apple,
  Archive,
  Atom,
  Banknote,
  BanknoteX,
  Beer,
  Bell,
  Bike,
  Bird,
  BookHeart,
  Brain,
  BriefcaseMedical,
  Brush,
  Calendar,
  CandyOff,
  Car,
  Carrot,
  Cat,
  ChartColumn,
  Check,
  ChefHat,
  Cherry,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDot,
  CircleUser,
  Citrus,
  Clipboard,
  CloudOff,
  Code,
  Coffee,
  Contrast,
  Dog,
  Drumstick,
  Dumbbell,
  Eye,
  EyeOff,
  Fish,
  Flag,
  Flame,
  Flower,
  Flower2,
  Footprints,
  Gamepad2,
  Gift,
  GlassWater,
  Goal,
  GraduationCap,
  Guitar,
  Hamburger,
  HandHeart,
  HeartPulse,
  Home,
  Inbox,
  Info,
  Kayak,
  Languages,
  Laptop,
  LayoutGrid,
  Leaf,
  Lightbulb,
  MailCheck,
  Martini,
  Medal,
  MessageSquareOff,
  Mic,
  Minus,
  Moon,
  Mountain,
  Music,
  Notebook,
  Palette,
  Palmtree,
  PawPrint,
  Pen,
  Pencil,
  PencilLine,
  Percent,
  PersonStanding,
  PhoneOff,
  Piano,
  Pill,
  Pizza,
  Plane,
  Plus,
  Pointer,
  Rabbit,
  Rows3,
  Salad,
  Scale,
  Scissors,
  Search,
  Server,
  Settings,

  ShoppingCart,
  SlidersHorizontal,
  Smile,
  Snowflake,
  Sparkles,
  SportShoe,
  SprayCan,
  Sprout,
  Star,
  Sun,
  Sunrise,
  Sunset,
  Syringe,
  Target,
  Tent,
  Timer,
  Trash2,
  TreePine,
  TrendingUp,
  Trophy,
  Unplug,
  Utensils,
  Volleyball,
  Wallet,
  WashingMachine,
  Waves,
  Weight,
  Wind,
  Wine,
  WineOff,
  Wrench,
  X,
  Zap,
} as const satisfies Record<string, LucideIcon>;

export type LucideIconName = keyof typeof LUCIDE_ICONS;
