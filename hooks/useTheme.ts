import { useThemePreference } from '@/store/themeStore';
import { getColors, type ThemeColors, type ThemeName } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface Theme {
  name: ThemeName;
  isDark: boolean;
  colors: ThemeColors;
}

/** Resolves the effective light/dark palette from the user's preference. */
export function useTheme(): Theme {
  const preference = useThemePreference();
  const systemScheme = useColorScheme();
  const name: ThemeName = preference === 'system' ? systemScheme : preference;
  return { name, isDark: name === 'dark', colors: getColors(name) };
}
