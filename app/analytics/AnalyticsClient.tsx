'use client'

import Link from 'next/link'
import { MACETES, DISCS, DISC_CHART_COLORS } from '@/lib/macetes'
import type { EntradaCaderno } from '@/lib/types'
import BottomNav from '@/components/BottomNav'

interface Props {
  userEmail: string
  seen: Record<number, string>
  caderno: EntradaCaderno[]
  urgentCount: number
}

export default function AnalyticsClient({ userEmail, seen, caderno, urgentCount }: Props) {
  const totalVistos = Object.keys(seen).length
  const totalErros = caderno.filter(e => e.status !== 'resolvido').length
  const totalResolvidos = caderno.filter(e => e.status === 'resolvido').length
  const taxaAcerto = caderno.length > 0 ? Math.round((totalResolvidos / caderno.length) * 100) : 0

  // Erros por disciplina
  const errosPorDisc: Record<string, number> = {}
  const questoesPorDisc: Record<string, number> = {}
  caderno.forEach(e => {
    const d = e.macete_disc || 'Outros'
    errosPorDisc[d] = (errosPorDisc[d] || 0)
    questoesPorDisc[d] = (questoesPorDisc[d] || 0) + 1
    if (e.status !== 'resolvido') errosPorDisc[d]++
  })

  const discOrdenadas = Object.keys(errosPorDisc).sort((a, b) => errosPorDisc[b] - errosPorDisc[a])
  const maxErros = discOrdenadas.length > 0 ? Math.max(...discOrdenadas.map(d => errosPorDisc[d])) : 1
  const alertaDisc = discOrdenadas.find(d => errosPorDisc[d] > 0) ?? null

  // Vistos por disciplina
  const vistosDisc: Record<string, number> = {}
  MACETES.forEach(m => { if (seen[m.num]) vistosDisc[m.disc] = (vistosDisc[m.disc] || 0) + 1 })
  const maxVistos = Math.max(1, ...DISCS.map(d => vistosDisc[d] || 0))

  const name = userEmail.split('@')[0]

  return (
    <div className="app-shell">
      <div className="hdr">
        <div className="hdr-row">
          <Link href="/" className="back-btn">← macetes</Link>
          <div>
            <div className="htitle">Painel de desempenho</div>
            <div className="hsub">{name}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { val: totalVistos, lbl: 'macetes vistos', color: '' },
            { val: `${taxaAcerto}%`, lbl: 'taxa de acerto', color: 'text-brand-dark' },
            { val: totalErros, lbl: 'erros pendentes', color: 'text-error' },
            { val: totalResolvidos, lbl: 'questões resolvidas', color: 'text-brand' },
          ].map(s => (
            <div key={s.lbl} className="bg-gray-50 rounded-lg p-2.5 text-center">
              <div className={`text-xl font-bold text-gray-900 ${s.color}`}>{s.val}</div>
              <div className="text-[11px] text-gray-400 mt-px">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Alert */}
        {alertaDisc && (
          <div className="bg-warn-light border border-warn-border rounded-xl px-3.5 py-3">
            <div className="text-[11px] text-warn uppercase tracking-wider mb-1 font-bold">⚠ Disciplina com mais erros</div>
            <div className="text-[15px] font-bold text-error-dark">{alertaDisc}</div>
            <div className="text-xs text-warn mt-1">{errosPorDisc[alertaDisc]} erro{errosPorDisc[alertaDisc] !== 1 ? 's' : ''} pendente{errosPorDisc[alertaDisc] !== 1 ? 's' : ''} · Foque aqui!</div>
          </div>
        )}

        {/* Errors per discipline */}
        {discOrdenadas.filter(d => errosPorDisc[d] > 0).length > 0 ? (
          <div className="card">
            <div className="text-sm font-bold text-gray-900 mb-3">Erros pendentes por disciplina</div>
            {discOrdenadas.filter(d => errosPorDisc[d] > 0).map((d, i) => (
              <div key={d} className="flex items-center gap-2 py-1.5 border-b border-black/[0.04] last:border-0">
                <div className="text-xs text-gray-500 min-w-[90px] max-w-[90px] truncate">{d}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((errosPorDisc[d] / maxErros) * 100)}%`,
                      background: DISC_CHART_COLORS[i % DISC_CHART_COLORS.length],
                    }}
                  />
                </div>
                <div className="text-xs font-bold text-gray-900 min-w-[20px] text-right">{errosPorDisc[d]}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-6">
            <div className="text-sm font-semibold text-gray-600">Nenhum erro registrado ainda</div>
            <div className="text-xs text-gray-400 mt-1.5 leading-relaxed">Gere questões nos macetes para ver seu desempenho aqui</div>
          </div>
        )}

        {/* Seen per discipline */}
        <div className="card">
          <div className="text-sm font-bold text-gray-900 mb-3">Macetes vistos por disciplina</div>
          {DISCS.filter(d => vistosDisc[d]).sort((a, b) => (vistosDisc[b] || 0) - (vistosDisc[a] || 0)).map(d => (
            <div key={d} className="flex items-center gap-2 py-1.5 border-b border-black/[0.04] last:border-0">
              <div className="text-xs text-gray-500 min-w-[90px] max-w-[90px] truncate">{d}</div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-light-border"
                  style={{ width: `${Math.round(((vistosDisc[d] || 0) / maxVistos) * 100)}%` }}
                />
              </div>
              <div className="text-xs font-bold text-gray-900 min-w-[20px] text-right">{vistosDisc[d] || 0}</div>
            </div>
          ))}
          {DISCS.every(d => !vistosDisc[d]) && (
            <div className="text-xs text-gray-400 text-center py-3">Nenhum macete visto ainda</div>
          )}
        </div>

        <div className="text-[11px] text-gray-300 text-center pb-1">Dados sincronizados para {name}</div>
      </div>

      <BottomNav urgentCount={urgentCount} />
    </div>
  )
}
