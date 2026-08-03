import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { SecureStorage } from '@/lib/secureStorage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True only when the app was configured with real Supabase credentials. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * The one shared Supabase connection. When the project isn't configured
 * (no .env), the client is `null` and the app runs fully offline/local-first.
 */
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: SecureStorage,
        storageKey: 'habu-supabase-auth',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
