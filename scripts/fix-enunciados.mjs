/**
 * fix-enunciados.mjs
 * Completa os enunciados truncados do banco de questões usando a API da Anthropic.
 *
 * Pré-requisito: ANTHROPIC_API_KEY em .env.local ou na variável de ambiente.
 *
 * Uso:
 *   node scripts/fix-enunciados.mjs
 *
 * Gera: macetes_banco_questoes_fixed.json (não sobrescreve o original até revisão)
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Load .env.local if present
const __dir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dir, '..')
const envPath = resolve(rootDir, '.env.local')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Erro: defina ANTHROPIC_API_KEY em .env.local ou como variável de ambiente.')
  process.exit(1)
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const BANCO_PATH = resolve(rootDir, 'macetes_banco_questoes.json')
const OUT_PATH = resolve(rootDir, 'macetes_banco_questoes_fixed.json')

const banco = JSON.parse(readFileSync(BANCO_PATH, 'utf-8'))

function truncado(enunciado) {
  return enunciado[0] === enunciado[0].toLowerCase()
}

async function completarEnunciado(macete, enunciadoTruncado) {
  const prompt = `Você é um especialista em questões estilo OAB (FGV).

Contexto do macete:
- Disciplina: ${macete.disc}
- Título: ${macete.title}
- Explicação: ${macete.exp}

A questão abaixo tem o INÍCIO CORTADO. Reescreva-a completa, adicionando apenas o início que está faltando (1 a 3 linhas de cenário/personagem). NÃO altere o texto após o trecho fornecido.

Trecho atual (início cortado): "${enunciadoTruncado}"

Responda SOMENTE com o enunciado completo, sem prefixos ou explicações.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })
  return msg.content[0].text.trim()
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  const fixed = JSON.parse(JSON.stringify(banco)) // deep clone
  let count = 0
  let skipped = 0

  for (let i = 0; i < fixed.length; i++) {
    const macete = fixed[i]
    for (let j = 0; j < macete.questoes.length; j++) {
      const q = macete.questoes[j]
      if (!truncado(q.enunciado)) {
        // Starts with uppercase — likely ok, but still check
        skipped++
        continue
      }

      process.stdout.write(`[${i + 1}/199] Macete #${macete.num} "${macete.title}"... `)
      try {
        const completo = await completarEnunciado(macete, q.enunciado)
        fixed[i].questoes[j].enunciado = completo
        count++
        console.log('✓')
      } catch (err) {
        console.log(`✗ (${err.message}) — mantendo original`)
      }

      // Throttle: ~40 req/min to stay within Haiku limits
      await sleep(1500)
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(fixed, null, 2), 'utf-8')
  console.log(`\nConcluído: ${count} completados, ${skipped} pulados.`)
  console.log(`Arquivo gerado: macetes_banco_questoes_fixed.json`)
  console.log(`\nRevise o arquivo e, se ok, substitua:`)
  console.log(`  cp macetes_banco_questoes_fixed.json macetes_banco_questoes.json`)
  console.log(`  node scripts/inject-questoes.mjs  # (opcional) re-injeta em lib/macetes.ts`)
}

main().catch(err => { console.error(err); process.exit(1) })
