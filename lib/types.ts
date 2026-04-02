export interface Macete {
  num: number
  disc: string
  title: string
  kw: string
  exp: string
  ex: string
  peg: string
}

export interface Alternativa {
  letra: string
  texto: string
}

export interface Questao {
  enunciado: string
  alternativas: Alternativa[]
  correta: string
  gabarito: string
}

export interface EntradaCaderno {
  id: string
  user_id: string
  macete_num: number
  macete_titulo: string
  macete_kw: string
  macete_disc: string
  questao: Questao | null
  data_erro: string
  proxima_revisao: string
  tentativas: number
  status: 'pendente' | 'resolvido'
  acertos: number
  data_resolucao: string | null
}

export interface SeenMacete {
  user_id: string
  macete_num: number
  seen_at: string
}
