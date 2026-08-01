/**
 * Habu design tokens.
 *
 * The shell of the app is strictly grayscale (see Habu-Design-Document.md §4.1).
 * The only color anywhere in the app comes from a user's per-board color, which
 * lives in `constants/BoardColors.ts` and is never referenced by chrome.
 */

export const palette = {
  white: '#FFFFFF',
  gray50: '#F5F5F5',
  gray100: '#EDEDED',
  gray200: '#E0E0E0',
  gray400: '#9A9A9A',
  gray500: '#6B6B6B',
  gray600: '#A3A3A3',
  gray700: '#4D4D4D',
  gray800: '#1E1E1E',
  gray850: '#161616',
  gray900: '#0A0A0A',
  black: '#000000',
} as const;

export interface ThemeColors {
  /** Screen background */
  bgBase: string;
  /** Cards, rows, non-glass chrome */
  bgSurface: string;
  /** Modals, elevated cards */
  bgSurfaceRaised: string;
  /** Card/row dividers */
  borderSubtle: string;
  /** Headlines, primary content */
  textPrimary: string;
  /** Metadata, timestamps, helper text */
  textSecondary: string;
  /** Placeholder, disabled */
  textTertiary: string;
  /** Non-board-specific icons */
  iconDefault: string;
  /** Modal backdrop */
  overlayScrim: string;
  /** Offline banner surface */
  stateOfflineBg: string;
  /** Rare tint used on glass for completed/active chrome (never a hue) */
  glassTint: string;
}

export const lightColors: ThemeColors = {
  bgBase: palette.white,
  bgSurface: palette.gray50,
  bgSurfaceRaised: palette.white,
  borderSubtle: palette.gray200,
  textPrimary: palette.gray900,
  textSecondary: palette.gray500,
  textTertiary: palette.gray600,
  iconDefault: '#1A1A1A',
  overlayScrim: 'rgba(0, 0, 0, 0.4)',
  stateOfflineBg: palette.gray100,
  glassTint: 'rgba(0, 0, 0, 0.06)',
};

export const darkColors: ThemeColors = {
  bgBase: palette.black,
  bgSurface: palette.gray850,
  bgSurfaceRaised: palette.gray800,
  borderSubtle: '#2A2A2A',
  textPrimary: palette.gray50,
  textSecondary: palette.gray400,
  textTertiary: palette.gray500,
  iconDefault: palette.gray100,
  overlayScrim: 'rgba(0, 0, 0, 0.6)',
  stateOfflineBg: palette.gray800,
  glassTint: 'rgba(255, 255, 255, 0.08)',
};

export type ThemeName = 'light' | 'dark';

export const themes: Record<ThemeName, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

export function getColors(theme: ThemeName): ThemeColors {
  return themes[theme];
}

/** 4pt-based spacing scale (design doc §3.3) */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Corner radius tokens (design doc §3.4) */
export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
} as const;

/** Type scale as roles (design doc §5.1) — rendered with system fonts */
export const typography = {
  display: 34,
  title: 28,
  heading: 20,
  body: 17,
  subtext: 15,
  caption: 12,
} as const;
