'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  urgentCount?: number
}

export default function BottomNav({ urgentCount = 0 }: Props) {
  const path = usePathname()

  const active = (href: string) =>
    (href === '/' ? path === '/' || path.startsWith('/disciplina') || path.startsWith('/macete')
      : path.startsWith(href))
      ? 'text-brand' : 'text-gray-400'

  return (
    <nav className="flex border-t border-black/8 flex-shrink-0 bg-white">
      <Link href="/" className={`flex-1 py-2.5 px-1 text-[11px] font-semibold text-center flex flex-col items-center gap-1 ${active('/')}`}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 9h8M5 6h8M5 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Macetes
      </Link>

      <Link href="/caderno" className={`flex-1 py-2.5 px-1 text-[11px] font-semibold text-center flex flex-col items-center gap-1 relative ${active('/caderno')}`}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6 7l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Caderno
        {urgentCount > 0 && (
          <span className="absolute top-2 right-4 bg-red-500 text-white rounded-full text-[10px] px-1.5 py-px font-bold leading-none">
            {urgentCount}
          </span>
        )}
      </Link>

      <Link href="/analytics" className={`flex-1 py-2.5 px-1 text-[11px] font-semibold text-center flex flex-col items-center gap-1 ${active('/analytics')}`}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="10" width="3" height="6" rx="1" fill="currentColor" />
          <rect x="7" y="6" width="3" height="10" rx="1" fill="currentColor" />
          <rect x="12" y="3" width="3" height="13" rx="1" fill="currentColor" />
        </svg>
        Analytics
      </Link>
    </nav>
  )
}
