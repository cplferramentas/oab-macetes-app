export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { fetchSeen, fetchCaderno } from '@/lib/supabase/data'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [seen, caderno] = await Promise.all([
    fetchSeen(supabase, user.id),
    fetchCaderno(supabase, user.id),
  ])

  const urgentCount = caderno.filter(
    e => e.status !== 'resolvido' && new Date(e.proxima_revisao) <= new Date()
  ).length

  return (
    <AnalyticsClient
      userEmail={user.email ?? ''}
      seen={seen}
      caderno={caderno}
      urgentCount={urgentCount}
    />
  )
}
