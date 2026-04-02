import { createClient } from '@/lib/supabase/server'
import { markSeen } from '@/lib/supabase/data'
import { MACETES } from '@/lib/macetes'
import { notFound } from 'next/navigation'
import MaceteClient from './MaceteClient'

interface Props {
  params: Promise<{ num: string }>
}

export default async function MacetePage({ params }: Props) {
  const { num: numStr } = await params
  const num = parseInt(numStr, 10)
  const macete = MACETES.find(m => m.num === num)
  if (!macete) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) await markSeen(supabase, user.id, num)

  return <MaceteClient macete={macete} />
}

// Pre-generate all macete routes at build time
export function generateStaticParams() {
  return MACETES.map(m => ({ num: String(m.num) }))
}
