import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export type AuthStatus =
  | { state: 'loading' }
  | { state: 'unauthenticated' }
  | { state: 'authenticated'; user: User };

/**
 * Current auth state. When Supabase isn't configured the app is always
 * "unauthenticated" but fully usable offline.
 */
export async function getAuthStatus(): Promise<AuthStatus> {
  if (!isSupabaseConfigured || !supabase) {
    return { state: 'unauthenticated' };
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) return { state: 'unauthenticated' };
  if (data.session?.user) {
    return { state: 'authenticated', user: data.session.user };
  }
  return { state: 'unauthenticated' };
}

/** Subscribe to auth state changes. Returns an unsubscribe function. */
export function onAuthChange(
  callback: (session: { user: User | null }) => void,
): () => void {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback({ user: session?.user ?? null });
  });
  return () => subscription.unsubscribe();
}

export async function signInWithPassword(email: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, username?: string) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: username ? { username } : undefined,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Whether an email already has an account. Supabase deliberately hides this
 * behind a boolean RPC (it has no built-in lookup) so signup can warn early.
 */
export async function isEmailRegistered(email: string): Promise<boolean | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.rpc('is_email_registered', {
    target: email.trim(),
  });
  if (error) return null;
  return Boolean(data);
}

export async function signOut() {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}

export async function sendPasswordResetEmail(email: string) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
