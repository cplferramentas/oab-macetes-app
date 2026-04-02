'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs px-2 py-1 cursor-pointer border border-black/12 rounded-[7px] bg-transparent text-gray-400 font-[inherit] hover:bg-surface"
    >
      sair
    </button>
  )
}
