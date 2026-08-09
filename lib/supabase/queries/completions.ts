import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type CompletionRow = Database['public']['Tables']['completions']['Row'];

export async function fetchCompletions(boardIds: string[]): Promise<CompletionRow[]> {
  if (!isSupabaseConfigured || !supabase || boardIds.length === 0) return [];
  const { data, error } = await supabase
    .from('completions')
    .select('*')
    .in('board_id', boardIds);
  if (error) throw error;
  return data ?? [];
}

export async function upsertCompletions(rows: CompletionRow[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase || rows.length === 0) return;
  const { error } = await supabase.from('completions').upsert(rows, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });
  if (error) throw error;
}

export async function deleteCompletions(
  ids: string[],
  boardIds: string[],
): Promise<void> {
  if (!isSupabaseConfigured || !supabase || ids.length === 0 || boardIds.length === 0) return;
  const { error } = await supabase
    .from('completions')
    .delete()
    .in('id', ids)
    .in('board_id', boardIds);
  if (error) throw error;
}
