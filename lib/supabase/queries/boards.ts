import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type BoardRow = Database['public']['Tables']['boards']['Row'];
export type BoardInsert = Database['public']['Tables']['boards']['Insert'];

export async function fetchBoards(userId: string): Promise<BoardRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

/**
 * Cloud-first write used when creating a board: one single-row insert that
 * returns the row in the same round trip, so callers can stamp the local row
 * with the server's `created_at`/`updated_at`.
 */
export async function insertBoard(row: BoardInsert): Promise<BoardRow> {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('boards').insert(row).select('*').single();
  if (error) throw error;
  return data;
}

export async function upsertBoards(rows: BoardRow[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase || rows.length === 0) return;
  const { error } = await supabase.from('boards').upsert(rows, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });
  if (error) throw error;
}

/**
 * Partial updates for boards that already exist on the cloud: only the columns
 * that actually changed on device are sent, so a field edited on another
 * device is never clobbered by a stale full-row push. Throws on failure so the
 * sync pass keeps the row pending and retries next time.
 */
export async function updateBoardPatches(
  patches: Array<{ id: string; patch: Partial<BoardRow> }>,
): Promise<void> {
  if (!isSupabaseConfigured || !supabase || patches.length === 0) return;
  for (const { id, patch } of patches) {
    const { error } = await supabase.from('boards').update(patch).eq('id', id);
    if (error) throw error;
  }
}

export async function deleteBoards(ids: string[], userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || ids.length === 0) return;
  const { error } = await supabase
    .from('boards')
    .delete()
    .in('id', ids)
    .eq('user_id', userId);
  if (error) throw error;
}
