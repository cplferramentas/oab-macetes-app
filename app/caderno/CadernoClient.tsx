'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { EntradaCaderno, Questao } from '@/lib/types'
import { MACETES } from '@/lib/macetes'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { updateCadernoStatus, upsertCaderno } from '@/lib/supabase/data'

type Tab = 'rev' | 'pend' | 'ok'

interface Props {
  userId: string
  initialCaderno: EntradaCaderno[]
  urgentCount: number
}

export default function CadernoClient({ userId, initialCaderno, urgentCount }: Props) {
  const [caderno, setCaderno] = useState(initialCaderno)
  const [tab, setTab] = useState<Tab>('rev')
  const [revisando, setRevisando] = useState<EntradaCaderno | null>(null)
  const [questaoRev, setQuestaoRev] = useState<Questao | null>(null)
  const [loadingRev, setLoadingRev] = useState(false)
  const [respondidoRev, setRespondidoRev] = useState(false)
  const [escolhaRev, setEscolhaRev] = useState<string | null>(null)
  const supabase = createClient()

  const agora = new Date()
  const revisar = caderno.filter(e => e.status !== 'resolvido' && new Date(e.proxima_revisao) <= agora)
  const pendentes = caderno.filter(e => e.status !== 'resolvido' && new Date(e.proxima_revisao) > agora)
  const resolvidos = caderno.filter(e => e.status === 'resolvido')
  const items = tab === 'rev' ? revisar : tab === 'pend' ? pendentes : resolvidos

  const pct = caderno.length > 0 ? Math.round((resolvidos.length / caderno.length) * 100) : 0

  async function abrirRevisao(entry: EntradaCaderno) {
    setRevisando(entry)
    setRespondidoRev(false)
    setEscolhaRev(null)
    if (entry.questao) {
      setQuestaoRev(entry.questao)
      return
    }
    setLoadingRev(true)
    setQuestaoRev(null)
    const macete = MACETES.find(m => m.num === entry.macete_num)
    if (!macete) { setLoadingRev(false); return }
    try {
      const res = await fetch('/api/gerar-questao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ macete, revisao: true }),
      })
      const q: Questao = await res.json()
      setQuestaoRev(q)
      const updated = caderno.map(e => e.id === entry.id ? { ...e, questao: q } : e)
      setCaderno(updated)
      await upsertCaderno(supabase, { ...entry, questao: q })
    } catch { /* ignore */ }
    setLoadingRev(false)
  }

  async function responderRev(letra: string) {
    if (respondidoRev || !questaoRev || !revisando) return
    setRespondidoRev(true)
    setEscolhaRev(letra)
    const acertou = letra === questaoRev.correta
    const now = new Date()
    let updates: Partial<EntradaCaderno>
    if (acertou) {
      updates = { status: 'resolvido', data_resolucao: now.toISOString() }
    } else {
      const t = revisando.tentativas
      const days = t <= 1 ? 2 : t <= 2 ? 3 : 7
      updates = {
        proxima_revisao: new Date(Date.now() + days * 86400000).toISOString(),
        tentativas: t + 1,
      }
    }
    const updated = caderno.map(e => e.id === revisando.id ? { ...e, ...updates } : e)
    setCaderno(updated)
    await updateCadernoStatus(supabase, revisando.id, updates)
  }

  async function reabrirErro(id: string) {
    const updates: Partial<EntradaCaderno> = { status: 'pendente', proxima_revisao: new Date().toISOString() }
    const updated = caderno.map(e => e.id === id ? { ...e, ...updates } : e)
    setCaderno(updated)
    await updateCadernoStatus(supabase, id, updates)
  }

  if (revisando) {
    return (
      <div className="app-shell">
        <div className="hdr">
          <div className="hdr-row">
            <button onClick={() => setRevisando(null)} className="back-btn">← caderno</button>
            <div>
              <div className="htitle">Revisão</div>
              <div className="hsub">{revisando.macete_disc} · #{revisando.macete_num}</div>
            </div>
          </div>
        </div>
        <div className="scrollable">
          {loadingRev && (
            <div className="flex items-center gap-3 p-4">
              <div className="spinner" /><span className="text-sm text-gray-400">Gerando nova questão...</span>
            </div>
          )}
          {questaoRev && (
            <>
              <div className="bg-brand-light rounded-lg px-3 py-2.5">
                <div className="text-[11px] text-brand-dark uppercase tracking-wider mb-1 font-bold">Macete sendo revisado</div>
                <div className="text-sm font-semibold text-[#085041]">{revisando.macete_titulo}</div>
                <div className="text-xs text-brand mt-1">{revisando.macete_kw}</div>
              </div>
              <div className="bg-gray-50 border border-black/10 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
                {questaoRev.enunciado}
              </div>
              <div className="flex flex-col gap-1.5">
                {questaoRev.alternativas.map(a => {
                  let cls = 'alt-btn'
                  if (respondidoRev) {
                    if (a.letra === questaoRev.correta) cls += ' correct'
                    else if (a.letra === escolhaRev) cls += ' wrong'
                  }
                  return (
                    <button key={a.letra} className={cls} disabled={respondidoRev} onClick={() => responderRev(a.letra)}>
                      <span className="font-bold min-w-[18px]">{a.letra})</span>
                      <span>{a.texto}</span>
                    </button>
                  )
                })}
              </div>
              {respondidoRev && (
                <>
                  <div className={`result-bar ${escolhaRev === questaoRev.correta ? 'ac' : 'er'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${escolhaRev === questaoRev.correta ? 'bg-brand-light-border' : 'bg-error-border'}`}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        {escolhaRev === questaoRev.correta
                          ? <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          : <path d="M4 4l6 6M10 4l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />}
                      </svg>
                    </div>
                    <div className={`text-sm font-semibold ${escolhaRev === questaoRev.correta ? 'text-[#085041]' : 'text-error-dark'}`}>
                      {escolhaRev === questaoRev.correta ? 'Acertou! Removido do caderno.' : 'Errou. Reagendado.'}
                    </div>
                  </div>
                  <div className="border border-black/10 rounded-lg p-3">
                    <div className="text-[11px] text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">Gabarito comentado</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{questaoRev.gabarito}</p>
                  </div>
                  <button onClick={() => setRevisando(null)} className="w-full py-2.5 text-xs cursor-pointer border border-black/12 rounded-lg bg-transparent text-gray-500 font-[inherit]">
                    ← voltar ao caderno
                  </button>
                </>
              )}
            </>
          )}
        </div>
        <BottomNav urgentCount={urgentCount} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="hdr">
        <div className="hdr-row">
          <Link href="/" className="back-btn">← macetes</Link>
          <div>
            <div className="htitle">Caderno de erros</div>
            <div className="hsub">{caderno.length} questão{caderno.length !== 1 ? 'ões' : ''} no caderno</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5 p-2.5 flex-shrink-0 border-b border-black/8">
        {[
          { val: caderno.length, lbl: 'total', color: '' },
          { val: revisar.length, lbl: 'revisar agora', color: 'text-error' },
          { val: resolvidos.length, lbl: 'resolvidos', color: 'text-brand-dark' },
        ].map(s => (
          <div key={s.lbl} className="bg-gray-50 rounded-lg p-2.5 text-center">
            <div className={`text-xl font-bold text-gray-900 ${s.color}`}>{s.val}</div>
            <div className="text-[11px] text-gray-400 mt-px">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="px-3 py-2 flex-shrink-0 border-b border-black/8">
        <div className="text-xs text-gray-400 mb-1">{pct}% de aproveitamento</div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/8 flex-shrink-0">
        {([['rev', 'Revisar agora'], ['pend', 'Pendentes'], ['ok', 'Resolvidos']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors font-[inherit] bg-transparent ${tab === t ? 'text-brand border-brand' : 'text-gray-400 border-transparent'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="scrollable">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-9 text-center gap-2">
            <div className="text-sm font-semibold text-gray-600">
              {tab === 'rev' ? 'Nenhuma questão para revisar agora.' : tab === 'pend' ? 'Nenhuma questão agendada.' : 'Nenhuma questão resolvida ainda.'}
            </div>
            <div className="text-xs text-gray-400 leading-relaxed">Gere questões nos macetes para popular o caderno.</div>
          </div>
        ) : (
          items.map(e => {
            const diff = new Date(e.proxima_revisao).getTime() - agora.getTime()
            let badgeCls: string, badgeTxt: string
            if (e.status === 'resolvido') { badgeCls = 'badge-done'; badgeTxt = 'resolvido' }
            else if (diff <= 0) { badgeCls = 'badge-urg'; badgeTxt = 'revisar agora' }
            else if (diff < 86400000) { badgeCls = 'badge-soon'; badgeTxt = 'amanhã' }
            else { badgeCls = 'badge-ok'; badgeTxt = `em ${Math.ceil(diff / 86400000)} dias` }
            return (
              <div key={e.id} className="card">
                <div className="text-sm font-semibold text-gray-900 mb-1">{e.macete_titulo}</div>
                <div className="flex gap-1.5 flex-wrap">
                  <span className={`badge badge-disc`}>{e.macete_disc}</span>
                  <span className={`badge ${badgeCls}`}>{badgeTxt}</span>
                  {e.tentativas > 1 && <span className="badge badge-soon">{e.tentativas}ª tentativa</span>}
                </div>
                <div className="text-[11px] text-gray-300 mt-1">
                  Erro em {new Date(e.data_erro).toLocaleDateString('pt-BR')}
                </div>
                {tab !== 'ok' ? (
                  <button
                    onClick={() => abrirRevisao(e)}
                    className="mt-2 w-full py-2 text-xs font-semibold cursor-pointer border border-brand rounded-lg text-brand-dark bg-brand-light font-[inherit] hover:bg-[#d0ede3]"
                  >
                    Revisar agora
                  </button>
                ) : (
                  <button
                    onClick={() => reabrirErro(e.id)}
                    className="mt-2 w-full py-2 text-xs font-semibold cursor-pointer border border-black/12 rounded-lg text-gray-400 bg-transparent font-[inherit]"
                  >
                    Reabrir para revisão
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      <BottomNav urgentCount={urgentCount} />
    </div>
  )
}
