import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type WidgetConfigRow = Database['public']['Tables']['widget_configs']['Row'];

export async function fetchWidgetConfigs(userId: string): Promise<WidgetConfigRow[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('widget_configs')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.warn('[sync] fetch widget configs failed:', error.message);
    return [];
  }
  return data ?? [];
}

export async function upsertWidgetConfigs(rows: WidgetConfigRow[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase || rows.length === 0) return;
  const { error } = await supabase.from('widget_configs').upsert(rows, {
    onConflict: 'id',
    ignoreDuplicates: false,
  });
  if (error) console.warn('[sync] upsert widget configs failed:', error.message);
}

export async function deleteWidgetConfigs(ids: string[], userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || ids.length === 0) return;
  const { error } = await supabase
    .from('widget_configs')
    .delete()
    .in('id', ids)
    .eq('user_id', userId);
  if (error) console.warn('[sync] delete widget configs failed:', error.message);
}
