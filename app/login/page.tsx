'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        setError('Verifique seu e-mail para confirmar o cadastro.')
        setLoading(false)
        return
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
      }
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      if (msg.includes('Invalid login')) setError('E-mail ou senha incorretos.')
      else if (msg.includes('already registered')) setError('E-mail já cadastrado. Faça login.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-7">
        {/* Logo */}
        <div className="w-13 h-13 bg-brand rounded-2xl flex items-center justify-center mb-5">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M5 8h16M5 13h16M5 18h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">199 Macetes OAB</h1>
        <p className="text-sm text-gray-400 mb-6 text-center leading-relaxed">
          {mode === 'register'
            ? 'Crie sua conta para salvar seu progresso em qualquer dispositivo'
            : 'Entre com suas credenciais para continuar'}
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          {error && (
            <div className="text-xs text-error bg-error-light rounded-lg px-3 py-2 text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <div className="text-xs text-gray-500 mb-1 font-semibold">E-mail</div>
            <input
              className="login-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1 font-semibold">Senha</div>
            <input
              className="login-input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          <button className="login-btn mt-1" type="submit" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'register' ? 'Criar conta' : 'Entrar'}
          </button>

          <p className="text-xs text-gray-400 text-center mt-2">
            {mode === 'register' ? 'Já tem conta? ' : 'Não tem conta? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-brand underline font-semibold"
            >
              {mode === 'register' ? 'Entrar' : 'Criar conta'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
