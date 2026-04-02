import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '199 Macetes OAB',
  description: 'Prepare-se para a prova da OAB com 199 macetes, questões geradas por IA e caderno de erros inteligente.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-surface flex items-start justify-center p-4 min-h-screen">
        {children}
      </body>
    </html>
  )
}
