'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NavBar() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b-2 border-white/20 bg-black/70 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
        <img src="/robot.png" alt="Lehrer" style={{ width: '40px', objectFit: 'contain' }} />
        <span style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.15em', color: '#fff' }}>
          LEHRER.LIVE
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="btn" style={{ fontSize: '0.6rem', padding: '0.4rem 0.9rem' }}>
          DASHBOARD
        </Link>
        <button onClick={handleSignOut} className="btn btn-filled" style={{ fontSize: '0.6rem', padding: '0.4rem 0.9rem' }}>
          ABMELDEN
        </button>
      </div>
    </nav>
  )
}
