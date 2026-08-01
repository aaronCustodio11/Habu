import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type CompletionRow = Database['public']['Tables']['completions']['Row'];

export async function fetchCompletions(userId: string): Promise<CompletionRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data: boards } = await supabase.from('boards').select('id').eq('user_id', userId);
  const boardIds = (boards ?? []).map((row) => row.id);
  if (boardIds.length === 0) return [];
  const { data, error } = await supabase
    .from('completions')
    .select('*')
    .in('board_id', boardIds);
  if (error) {
    console.warn('[sync] fetch completions failed:', error.message);
    return [];
  }
  return data ?? [];
}

export async function upsertCompletions(rows: CompletionRow[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase || rows.length === 0) return;
  const { error } = await supabase.from('completions').upsert(rows, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });
  if (error) console.warn('[sync] upsert completions failed:', error.message);
}

export async function deleteCompletions(ids: string[], userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || ids.length === 0) return;
  const { data: boards } = await supabase.from('boards').select('id').eq('user_id', userId);
  const boardIds = (boards ?? []).map((row) => row.id);
  if (boardIds.length === 0) return;
  const { error } = await supabase
    .from('completions')
    .delete()
    .in('id', ids)
    .in('board_id', boardIds);
  if (error) console.warn('[sync] delete completions failed:', error.message);
}
