'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const fieldStyle = {
  width: '100%',
  border: '1px solid #000',
  background: '#fff',
  color: '#000',
  fontFamily: 'Arial, sans-serif',
  fontSize: '0.85rem',
  padding: '0.6rem 0.75rem',
  outline: 'none',
  borderRadius: 0,
}

const labelStyle = {
  display: 'block',
  fontFamily: "'Arial Black', Arial, sans-serif",
  fontWeight: 900,
  fontSize: '0.6rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: '#000',
  marginBottom: '0.35rem',
}

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('professors').insert({ id: data.user.id, email, name })
    }
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <main style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '28rem', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.1em', color: '#000', textDecoration: 'none' }}>
            ← ZURÜCK
          </Link>
          <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}>
            REGISTRIERUNG
          </span>
        </div>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <h1 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '1.5rem', letterSpacing: '0.08em', color: '#000', marginBottom: '0.75rem' }}>
            E-MAIL BESTÄTIGEN
          </h1>
          <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.85rem', color: '#444', lineHeight: 1.6, fontWeight: 400, textTransform: 'none' }}>
            Eine Bestätigungsmail wurde an <strong>{email}</strong> gesendet.
            Klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren und zum Dashboard weitergeleitet zu werden.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>

      {/* Nav strip */}
      <div style={{ width: '100%', maxWidth: '28rem', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.1em', color: '#000', textDecoration: 'none' }}>
          ← ZURÜCK
        </Link>
        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}>
          REGISTRIERUNG
        </span>
      </div>

      {/* Form */}
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <h1 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '1.5rem', letterSpacing: '0.08em', color: '#000', marginBottom: '0.25rem' }}>
          KONTO ERSTELLEN
        </h1>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.75rem', color: '#666', marginBottom: '2rem', textTransform: 'none', fontWeight: 400 }}>
          Zugang fur Lehrkrafte
        </p>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} placeholder="Frau Muller" />
          </div>
          <div>
            <label style={labelStyle}>E-Mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} placeholder="name@schule.de" />
          </div>
          <div>
            <label style={labelStyle}>Kennwort (min. 8 Zeichen)</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={fieldStyle} placeholder="••••••••" />
          </div>

          {error && (
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.75rem', color: '#c00', border: '1px solid #c00', padding: '0.5rem 0.75rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: '#000', color: '#fff', border: '1px solid #000', fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.15em', padding: '0.85rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, textTransform: 'uppercase' as const }}
          >
            {loading ? 'WIRD VERARBEITET...' : 'REGISTRIEREN'}
          </button>
        </form>

        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.7rem', color: '#666', marginTop: '1.5rem', textTransform: 'none' }}>
          Bereits registriert?{' '}
          <Link href="/auth/login" style={{ color: '#000', fontWeight: 900, textTransform: 'uppercase', fontFamily: "'Arial Black', Arial, sans-serif", fontSize: '0.65rem', letterSpacing: '0.08em' }}>
            Anmelden
          </Link>
        </p>
      </div>
    </main>
  )
}
