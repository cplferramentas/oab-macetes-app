export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { fetchCaderno } from '@/lib/supabase/data'
import CadernoClient from './CadernoClient'

export default async function CadernoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const caderno = await fetchCaderno(supabase, user.id)
  const urgentCount = caderno.filter(
    e => e.status !== 'resolvido' && new Date(e.proxima_revisao) <= new Date()
  ).length

  return <CadernoClient userId={user.id} initialCaderno={caderno} urgentCount={urgentCount} />
}
