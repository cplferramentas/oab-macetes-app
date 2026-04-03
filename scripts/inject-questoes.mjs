/**
 * inject-questoes.mjs
 * Re-injeta o campo questoes[] do macetes_banco_questoes.json em lib/macetes.ts.
 * Use depois de substituir o JSON corrigido.
 *
 * Uso:
 *   node scripts/inject-questoes.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dir, '..')

const banco = JSON.parse(readFileSync(resolve(rootDir, 'macetes_banco_questoes.json'), 'utf-8'))
const questoesMap = Object.fromEntries(banco.map(m => [m.num, m.questoes]))

let src = readFileSync(resolve(rootDir, 'lib/macetes.ts'), 'utf-8')

// Replace existing questoes:[...] for each macete num
let count = 0
src = src.replace(/(\{num:(\d+),.*?),questoes:\[.*?\](\},?)/gs, (match, before, numStr, after) => {
  const num = parseInt(numStr, 10)
  const questoes = questoesMap[num]
  if (!questoes) return match
  count++
  return `${before},questoes:${JSON.stringify(questoes)}${after}`
})

writeFileSync(resolve(rootDir, 'lib/macetes.ts'), src, 'utf-8')
console.log(`inject-questoes: ${count} macetes atualizados em lib/macetes.ts`)
