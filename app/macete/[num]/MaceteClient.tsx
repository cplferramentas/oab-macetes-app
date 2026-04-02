'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Macete, Questao } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { upsertCaderno } from '@/lib/supabase/data'
import BottomNav from '@/components/BottomNav'

interface Props { macete: Macete }

export default function MaceteClient({ macete }: Props) {
  const [questao, setQuestao] = useState<Questao | null>(null)
  const [loading, setLoading] = useState(false)
  const [respondido, setRespondido] = useState(false)
  const [escolha, setEscolha] = useState<string | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function gerarQuestao() {
    setLoading(true)
    setQuestao(null)
    setRespondido(false)
    setEscolha(null)
    setError('')
    try {
      const res = await fetch('/api/gerar-questao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ macete }),
      })
      if (!res.ok) throw new Error('Falha na geração')
      const data: Questao = await res.json()
      setQuestao(data)
    } catch {
      setError('Erro ao gerar questão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function responder(letra: string) {
    if (respondido || !questao) return
    setRespondido(true)
    setEscolha(letra)
    const acertou = letra === questao.correta
    if (!acertou) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await upsertCaderno(supabase, {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          user_id: user.id,
          macete_num: macete.num,
          macete_titulo: macete.title,
          macete_kw: macete.kw,
          macete_disc: macete.disc,
          questao,
          data_erro: new Date().toISOString(),
          proxima_revisao: new Date(Date.now() + 2 * 86400000).toISOString(),
          tentativas: 1,
          status: 'pendente',
          acertos: 0,
          data_resolucao: null,
        })
      }
    }
  }

  const disc = encodeURIComponent(macete.disc)

  return (
    <div className="app-shell">
      <div className="hdr">
        <div className="hdr-row">
          <Link href={`/disciplina/${disc}`} className="back-btn">← voltar</Link>
          <div className="hsub">{macete.disc} · #{macete.num}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
        {/* Title */}
        <h1 className="text-[17px] font-bold text-gray-900 leading-snug">{macete.title}</h1>

        {/* Explanation */}
        <div className="border border-black/10 rounded-lg p-3">
          <div className="text-[11px] text-gray-300 uppercase tracking-wider mb-1 font-semibold">Explicação</div>
          <p className="text-sm text-gray-600 leading-relaxed">{macete.exp}</p>
        </div>

        {/* Example */}
        <div className="border border-black/10 rounded-lg p-3">
          <div className="text-[11px] text-gray-300 uppercase tracking-wider mb-1 font-semibold">Exemplo prático</div>
          <p className="text-sm text-gray-600 leading-relaxed">{macete.ex}</p>
        </div>

        {/* Keyword */}
        <div>
          <div className="text-[11px] text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">Palavra-chave</div>
          <span className="text-sm font-bold text-brand-dark bg-brand-light px-3.5 py-2 rounded-lg inline-block">
            {macete.kw}
          </span>
        </div>

        {/* Pegadinha */}
        <div className="border border-warn-border bg-warn-light rounded-lg p-3">
          <div className="text-[11px] text-warn uppercase tracking-wider mb-1 font-semibold">⚠ Pegadinha FGV</div>
          <p className="text-sm text-warn leading-relaxed">{macete.peg}</p>
        </div>

        {/* Question section */}
        {!questao && !loading && (
          <button onClick={gerarQuestao} className="gerar-btn">
            ✦ Gerar questão estilo OAB
          </button>
        )}

        {loading && (
          <div className="flex items-center gap-3 p-4">
            <div className="spinner" />
            <span className="text-sm text-gray-400">Criando questão no estilo FGV...</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-error-dark bg-error-bg border border-error-border rounded-lg p-3">
            {error}
          </div>
        )}

        {questao && (
          <div className="flex flex-col gap-3">
            <div className="bg-gray-50 border border-black/10 rounded-lg p-3 text-sm text-gray-700 leading-relaxed">
              {questao.enunciado}
            </div>

            <div className="flex flex-col gap-1.5">
              {questao.alternativas.map(a => {
                let cls = 'alt-btn'
                if (respondido) {
                  if (a.letra === questao.correta) cls += ' correct'
                  else if (a.letra === escolha) cls += ' wrong'
                }
                return (
                  <button
                    key={a.letra}
                    className={cls}
                    disabled={respondido}
                    onClick={() => responder(a.letra)}
                  >
                    <span className="font-bold min-w-[18px]">{a.letra})</span>
                    <span>{a.texto}</span>
                  </button>
                )
              })}
            </div>

            {respondido && (
              <>
                <div className={`result-bar ${escolha === questao.correta ? 'ac' : 'er'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${escolha === questao.correta ? 'bg-brand-light-border' : 'bg-error-border'}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      {escolha === questao.correta
                        ? <path d="M3 7l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        : <path d="M4 4l6 6M10 4l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />}
                    </svg>
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${escolha === questao.correta ? 'text-[#085041]' : 'text-error-dark'}`}>
                      {escolha === questao.correta ? 'Acertou!' : 'Errou! Adicionado ao caderno.'}
                    </div>
                    <div className={`text-xs mt-px ${escolha === questao.correta ? 'text-brand-dark' : 'text-error-dark2'}`}>
                      {escolha === questao.correta ? 'Continue assim!' : 'Revisão agendada para 2 dias.'}
                    </div>
                  </div>
                </div>

                <div className="border border-black/10 rounded-lg p-3">
                  <div className="text-[11px] text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">Gabarito comentado</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{questao.gabarito}</p>
                </div>

                <div className="flex gap-2">
                  <Link href={`/disciplina/${disc}`} className="flex-1 py-2.5 text-xs text-center cursor-pointer border border-black/12 rounded-lg bg-transparent text-gray-500 font-[inherit] no-underline flex items-center justify-center">
                    ← ver disciplina
                  </Link>
                  <button
                    onClick={gerarQuestao}
                    className="flex-1 py-2.5 text-xs cursor-pointer border border-black/12 rounded-lg bg-transparent text-gray-500 font-[inherit]"
                  >
                    ↺ nova questão
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
