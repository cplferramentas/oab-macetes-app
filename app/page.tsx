export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'
import { fetchSeen, fetchCaderno } from '@/lib/supabase/data'

export default async function HomePage() {
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
    <HomeClient
      userId={user.id}
      userEmail={user.email ?? ''}
      initialSeen={seen}
      initialUrgentCount={urgentCount}
    />
  )
}
