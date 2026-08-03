import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SecureStorage } from '@/lib/secureStorage';
import {
  getAuthStatus,
  onAuthChange,
  signInWithPassword,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
} from '@/lib/supabase/auth';
import { syncNow } from '@/lib/sync/syncEngine';

export type AuthPhase = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  phase: AuthPhase;
  userId: string | null;
  email: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

let authSubscriptionInstalled = false;

/**
 * App-wide auth state. `phase` is runtime-only; the persisted slice keeps the
 * last known session so the app can render immediately on relaunch before
 * Supabase rehydrates.
 */
export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      phase: 'loading',
      userId: null,
      email: null,

      initialize: async () => {
        if (!authSubscriptionInstalled) {
          authSubscriptionInstalled = true;
          onAuthChange(({ user }) => {
            if (user) {
              set({ phase: 'authenticated', userId: user.id, email: user.email ?? null });
              syncNow(user.id);
            } else {
              set({ phase: 'unauthenticated', userId: null, email: null });
            }
          });
        }

        const status = await getAuthStatus();
        if (status.state === 'authenticated') {
          set({
            phase: 'authenticated',
            userId: status.user.id,
            email: status.user.email ?? null,
          });
          syncNow(status.user.id);
        } else {
          set({ phase: 'unauthenticated', userId: null, email: null });
        }
      },

      signIn: async (email, password) => {
        const { userId } = get();
        await signInWithPassword(email, password);
        const nextId = userId;
        if (nextId) syncNow(nextId);
      },

      signUp: async (email, password, username) => {
        const data = await supabaseSignUp(email, password, username);
        return Boolean(data.session);
      },

      signOut: async () => {
        await supabaseSignOut();
        set({ phase: 'unauthenticated', userId: null, email: null });
      },
    }),
    {
      name: 'habu-auth',
      storage: createJSONStorage(() => SecureStorage),
      partialize: (state) => ({ userId: state.userId, email: state.email }),
    },
  ),
);
