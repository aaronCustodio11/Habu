import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type BoardRow = Database['public']['Tables']['boards']['Row'];

export async function fetchBoards(userId: string): Promise<BoardRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.warn('[sync] fetch boards failed:', error.message);
    return [];
  }
  return data ?? [];
}

export async function upsertBoards(rows: BoardRow[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase || rows.length === 0) return;
  const { error } = await supabase.from('boards').upsert(rows, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });
  if (error) console.warn('[sync] upsert boards failed:', error.message);
}

export async function deleteBoards(ids: string[], userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || ids.length === 0) return;
  const { error } = await supabase
    .from('boards')
    .delete()
    .in('id', ids)
    .eq('user_id', userId);
  if (error) console.warn('[sync] delete boards failed:', error.message);
}
