import Storage from 'expo-sqlite/kv-store';

/**
 * Drop-in AsyncStorage adapter backed by the on-device SQLite database
 * (expo-sqlite's kv-store). Saves a dependency and keeps every byte of Habu's
 * persistence in one place. Exposes the `getItem`/`setItem`/`removeItem`
 * contract expected by zustand's persist middleware and Supabase's auth
 * storage.
 */
export const AsyncStorage = {
  getItem: (key: string): Promise<string | null> => Storage.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> => Storage.setItemAsync(key, value),
  removeItem: async (key: string): Promise<void> => {
    await Storage.removeItemAsync(key);
  },
};
