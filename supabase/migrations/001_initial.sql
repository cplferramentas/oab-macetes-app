-- Habilita RLS em todas as tabelas de usuário
-- Executar no SQL Editor do Supabase

-- Tabela: macetes vistos
CREATE TABLE IF NOT EXISTS public.seen_macetes (
  user_id  UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  macete_num INTEGER NOT NULL,
  seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, macete_num)
);

ALTER TABLE public.seen_macetes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own seen_macetes"
  ON public.seen_macetes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabela: caderno de erros
CREATE TABLE IF NOT EXISTS public.caderno (
  id               TEXT        PRIMARY KEY,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  macete_num       INTEGER     NOT NULL,
  macete_titulo    TEXT        NOT NULL,
  macete_kw        TEXT        NOT NULL DEFAULT '',
  macete_disc      TEXT        NOT NULL,
  questao          JSONB,
  data_erro        TIMESTAMPTZ NOT NULL DEFAULT now(),
  proxima_revisao  TIMESTAMPTZ NOT NULL DEFAULT now(),
  tentativas       INTEGER     NOT NULL DEFAULT 1,
  status           TEXT        NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','resolvido')),
  acertos          INTEGER     NOT NULL DEFAULT 0,
  data_resolucao   TIMESTAMPTZ
);

ALTER TABLE public.caderno ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own caderno"
  ON public.caderno FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS caderno_user_idx ON public.caderno(user_id);
CREATE INDEX IF NOT EXISTS caderno_revisao_idx ON public.caderno(user_id, proxima_revisao);
