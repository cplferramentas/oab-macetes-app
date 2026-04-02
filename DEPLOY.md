# Deploy — 199 Macetes OAB

## 1. Supabase

1. Acesse https://supabase.com e crie um projeto.
2. No **SQL Editor**, execute o arquivo `supabase/migrations/001_initial.sql`.
3. Copie a **Project URL** e a **anon key** (Settings → API).
4. Em Authentication → Email, habilite **Confirm email** como preferir.

## 2. Vercel

1. Faça fork/push deste repositório para o GitHub.
2. Importe o projeto na Vercel: https://vercel.com/new
3. Adicione as variáveis de ambiente:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key do Supabase |
| `ANTHROPIC_API_KEY` | Chave gerada em https://console.anthropic.com |

4. Clique em **Deploy**. A Vercel roda `npm install && next build` automaticamente.

## 3. Desenvolvimento local

```bash
cp .env.local.example .env.local
# preencha .env.local com seus valores

npm install
npm run dev
```

## Arquitetura

```
app/
  login/            # Autenticação Supabase (email+senha)
  (app)/            # Rota protegida por middleware
    page.tsx        # Home — lista de disciplinas
    HomeClient.tsx  # Client component com busca
  disciplina/[disc] # Macetes por disciplina
  macete/[num]/     # Detalhe + gerador de questões
  caderno/          # Caderno de erros + revisão espaçada
  analytics/        # Painel de desempenho
  api/
    gerar-questao/  # ← Anthropic API (server-only, chave segura)
lib/
  supabase/         # client.ts, server.ts, data.ts
  macetes.ts        # 199 macetes completos
  types.ts          # Interfaces TypeScript
middleware.ts       # Proteção de rotas via Supabase SSR
supabase/
  migrations/       # SQL para criação das tabelas
```
