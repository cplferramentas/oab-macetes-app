/**
 * Data access helpers — wrap Supabase calls for seen_macetes and caderno.
 * All functions accept a `supabase` client so they work in both Server and Client Components.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { EntradaCaderno } from '../types'

// ─── Seen macetes ────────────────────────────────────────────────────────────

export async function fetchSeen(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('seen_macetes')
    .select('macete_num, seen_at')
    .eq('user_id', userId)
  const map: Record<number, string> = {}
  ;(data ?? []).forEach((r: { macete_num: number; seen_at: string }) => {
    map[r.macete_num] = r.seen_at
  })
  return map
}

export async function markSeen(supabase: SupabaseClient, userId: string, maceteNum: number) {
  await supabase.from('seen_macetes').upsert(
    { user_id: userId, macete_num: maceteNum, seen_at: new Date().toISOString() },
    { onConflict: 'user_id,macete_num' }
  )
}

// ─── Caderno ─────────────────────────────────────────────────────────────────

export async function fetchCaderno(supabase: SupabaseClient, userId: string): Promise<EntradaCaderno[]> {
  const { data } = await supabase
    .from('caderno')
    .select('*')
    .eq('user_id', userId)
    .order('data_erro', { ascending: false })
  return (data ?? []) as EntradaCaderno[]
}

export async function upsertCaderno(supabase: SupabaseClient, entry: EntradaCaderno) {
  await supabase.from('caderno').upsert(entry, { onConflict: 'id' })
}

export async function updateCadernoStatus(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<EntradaCaderno>
) {
  await supabase.from('caderno').update(updates).eq('id', id)
}
