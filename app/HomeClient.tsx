'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MACETES, DISCS, DISC_ICONS, DISC_COLORS } from '@/lib/macetes'
import BottomNav from '@/components/BottomNav'
import LogoutButton from '@/components/LogoutButton'
import { createClient } from '@/lib/supabase/client'
import { markSeen } from '@/lib/supabase/data'

interface Props {
  userId: string
  userEmail: string
  initialSeen: Record<number, string>
  initialUrgentCount: number
}

export default function HomeClient({ userId, userEmail, initialSeen, initialUrgentCount }: Props) {
  const [seen, setSeen] = useState(initialSeen)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const seenCount = Object.keys(seen).length
  const progress = Math.round((seenCount / 199) * 100)
  const name = userEmail.split('@')[0]

  async function handleMarkSeen(num: number) {
    if (seen[num]) return
    const newSeen = { ...seen, [num]: new Date().toISOString() }
    setSeen(newSeen)
    await markSeen(supabase, userId, num)
  }

  const fl = search.toLowerCase().trim()
  const filtered = fl
    ? MACETES.filter(
        m =>
          m.title.toLowerCase().includes(fl) ||
          m.kw.toLowerCase().includes(fl) ||
          m.disc.toLowerCase().includes(fl)
      )
    : null

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="hdr">
        <div className="hdr-row mb-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M3 4.5h11M3 8.5h11M3 12.5h7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="htitle">199 Macetes OAB</div>
            <div className="hsub">Olá, {name} 👋</div>
          </div>
          <LogoutButton />
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-black/10">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4" stroke="#bbb" strokeWidth="1.4" />
            <path d="M9.5 9.5l2 2" stroke="#bbb" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar macete..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-gray-900 flex-1 placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-3 py-2 flex-shrink-0 border-b border-black/8 flex items-center gap-2">
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{seenCount} de 199 vistos</span>
      </div>

      {/* List */}
      <div className="scrollable">
        {filtered ? (
          filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 p-9 text-center gap-2">
              <div className="text-sm font-semibold text-gray-600">Nenhum macete encontrado</div>
            </div>
          ) : (
            filtered.map(m => (
              <Link
                key={m.num}
                href={`/macete/${m.num}`}
                onClick={() => handleMarkSeen(m.num)}
                className="border border-black/10 rounded-lg px-3 py-2.5 flex items-start gap-2 transition-colors hover:bg-gray-50 no-underline"
              >
                <span className="text-xs text-gray-300 min-w-[26px] pt-px">#{m.num}</span>
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">{m.title}</div>
                  <span className="kw-pill">{m.kw}</span>
                </div>
              </Link>
            ))
          )
        ) : (
          DISCS.map(d => {
            const ms = MACETES.filter(m => m.disc === d)
            const done = ms.filter(m => seen[m.num]).length
            return (
              <Link
                key={d}
                href={`/disciplina/${encodeURIComponent(d)}`}
                className="border border-black/10 rounded-lg px-3 py-2.5 flex items-center gap-2 transition-colors hover:bg-gray-50 no-underline"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: DISC_COLORS[d] ?? '#E1F5EE' }}
                >
                  {DISC_ICONS[d] ?? '📌'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{d}</div>
                  <div className="text-xs text-gray-400 mt-px">{ms.length} macetes · {done} vistos</div>
                </div>
                <span className="text-gray-300 text-base">›</span>
              </Link>
            )
          })
        )}
      </div>

      <BottomNav urgentCount={initialUrgentCount} />
    </div>
  )
}
