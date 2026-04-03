// Server component wrapper — força renderização dinâmica (nunca estático)
export const dynamic = 'force-dynamic'

import LoginForm from './LoginForm'

export default function LoginPage() {
  return <LoginForm />
}
