import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { Macete } from '@/lib/types'

// Rate limit em memória simples (por IP).
// Em produção, considere usar Upstash Redis ou Vercel KV.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const window = 60_000 // 1 minuto
  const limit = 10      // máx 10 questões/minuto por IP

  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  // Verificar autenticação via Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Rate limit por IP
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Muitas requisições. Aguarde um minuto.' }, { status: 429 })
  }

  let macete: Macete
  let revisao = false
  try {
    const body = await req.json()
    macete = body.macete
    revisao = body.revisao ?? false
    if (!macete?.num || !macete?.title) throw new Error('Macete inválido')
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const prompt = revisao
    ? `Você é especialista em OAB criando questões no estilo da FGV para revisão.
MACETE: "${macete.title}"
EXPLICAÇÃO: "${macete.exp}"
PEGADINHA: "${macete.peg}"
Crie uma questão DIFERENTE das anteriores.
Responda SOMENTE com JSON válido, sem markdown, sem texto extra:
{"enunciado":"caso prático FGV 3-4 linhas","alternativas":[{"letra":"A","texto":"..."},{"letra":"B","texto":"..."},{"letra":"C","texto":"..."},{"letra":"D","texto":"..."}],"correta":"A","gabarito":"explicação completa ligando ao macete"}`
    : `Você é especialista em OAB criando questões no estilo da FGV.
MACETE: "${macete.title}"
EXPLICAÇÃO: "${macete.exp}"
EXEMPLO: "${macete.ex}"
PEGADINHA: "${macete.peg}"
Responda SOMENTE com JSON válido, sem markdown, sem texto extra:
{"enunciado":"caso prático FGV 3-4 linhas","alternativas":[{"letra":"A","texto":"..."},{"letra":"B","texto":"..."},{"letra":"C","texto":"..."},{"letra":"D","texto":"..."}],"correta":"A","gabarito":"explicação completa ligando ao macete"}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    // Extrai JSON mesmo que venha dentro de bloco markdown
    const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const questao = JSON.parse(jsonStr)

    // Validação mínima
    if (!questao.enunciado || !Array.isArray(questao.alternativas) || !questao.correta) {
      throw new Error('Resposta inválida da IA')
    }

    return NextResponse.json(questao)
  } catch (err) {
    console.error('[gerar-questao]', err)
    return NextResponse.json({ error: 'Erro ao gerar questão.' }, { status: 500 })
  }
}
