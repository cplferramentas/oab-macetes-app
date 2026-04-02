import { createClient } from '@/lib/supabase/server'
import { fetchSeen } from '@/lib/supabase/data'
import { MACETES } from '@/lib/macetes'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

interface Props {
  params: Promise<{ disc: string }>
}

export default async function DisciplinaPage({ params }: Props) {
  const { disc: discEncoded } = await params
  const disc = decodeURIComponent(discEncoded)

  const macetes = MACETES.filter(m => m.disc === disc)
  if (macetes.length === 0) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const seen = user ? await fetchSeen(supabase, user.id) : {}

  return (
    <div className="app-shell">
      <div className="hdr">
        <div className="hdr-row">
          <Link href="/" className="back-btn">← voltar</Link>
          <div>
            <div className="htitle">{disc}</div>
            <div className="hsub">{macetes.length} macetes</div>
          </div>
        </div>
      </div>

      <div className="scrollable">
        {macetes.map(m => (
          <Link
            key={m.num}
            href={`/macete/${m.num}`}
            className="border border-black/10 rounded-lg px-3 py-2.5 flex items-start gap-2 transition-colors hover:bg-gray-50 no-underline"
          >
            <span className="text-xs text-gray-300 min-w-[26px] pt-px">#{m.num}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 mb-1">{m.title}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="kw-pill">{m.kw}</span>
                {seen[m.num] && (
                  <span className="text-[10px] text-brand font-semibold">✓ visto</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
