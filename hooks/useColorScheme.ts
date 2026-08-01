import { useColorScheme as useRnColorScheme, type ColorSchemeName } from 'react-native';

export type { ColorSchemeName };

/**
 * Wrapper over RN's useColorScheme that never returns `'unspecified'`,
 * defaulting to light when the OS doesn't report a scheme.
 */
export function useColorScheme(): 'light' | 'dark' {
  return useRnColorScheme() === 'dark' ? 'dark' : 'light';
}
