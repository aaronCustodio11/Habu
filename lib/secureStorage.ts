import * as SecureStore from 'expo-secure-store';
import { AsyncStorage } from '@/lib/storage';

/**
 * Secure-first key-value storage. Values are written to the OS Keychain /
 * Keystore via expo-secure-store; the on-device SQLite kv-store is the fallback
 * for payloads the platform refuses (SecureStore has no hard limit, but iOS
 * historically rejects values above ~2048 bytes — a full Supabase session can
 * exceed that). Only one copy is ever kept: a successful secure write deletes
 * the plaintext fallback, and a rejected secure write clears the stale
 * keychain item so reads never surface an outdated value.
 */
export const SecureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value != null) return value;
    } catch {
      // Keychain item missing or invalidated — fall through to the fallback.
    }
    return AsyncStorage.getItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
      await AsyncStorage.removeItem(key).catch(() => {});
      return;
    } catch {
      // Payload too large for the platform keychain — keep only the plaintext copy.
      await SecureStore.deleteItemAsync(key).catch(() => {});
    }
    await AsyncStorage.setItem(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key).catch(() => {});
    await AsyncStorage.removeItem(key);
  },
};
