import { useEffect } from 'react';
import { authStore } from '@/store/authStore';

/** "Who's logged in right now?" — also bootstraps the auth state on mount. */
export function useAuth() {
  const phase = authStore((state) => state.phase);
  const userId = authStore((state) => state.userId);
  const email = authStore((state) => state.email);
  const initialize = authStore((state) => state.initialize);
  const signIn = authStore((state) => state.signIn);
  const signUp = authStore((state) => state.signUp);
  const signOut = authStore((state) => state.signOut);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return { phase, userId, email, signIn, signUp, signOut };
}
