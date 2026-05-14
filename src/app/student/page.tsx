'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

export default function StudentEntryPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    const trimmed = code.trim().toUpperCase()
    console.log('[student] raw input:', JSON.stringify(code))
    console.log('[student] trimmed+uppercased:', JSON.stringify(trimmed))

    // Diagnostic: fetch all classes visible to anon to check RLS + stored values
    const { data: allClasses, error: allError } = await supabase
      .from('classes')
      .select('id, code')
    console.log('[student] all visible classes:', allClasses, 'error:', allError)

    const { data: cls, error: dbError } = await supabase
      .from('classes')
      .select('id, code')
      .ilike('code', trimmed)
      .limit(1)
      .maybeSingle()

    console.log('[student] ilike result:', { cls, dbError })
    console.log('[student] dbError full:', JSON.stringify(dbError))

    if (dbError || !cls) {
      const msg = dbError
        ? `DB-Fehler: ${dbError.message} (code: ${dbError.code})`
        : 'Klasse nicht gefunden. Code überprüfen.'
      setError(msg)
      setLoading(false)
      return
    }

    router.push(`/student/${cls.id}?name=${encodeURIComponent(name.trim())}`)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>

      {/* Nav strip */}
      <div style={{ width: '100%', maxWidth: '28rem', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.1em', color: '#000', textDecoration: 'none' }}>
          ← ZURÜCK
        </Link>
        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase' }}>
          SCHULER-ZUGANG
        </span>
      </div>

      {/* Form */}
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <h1 style={{ fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '1.5rem', letterSpacing: '0.08em', color: '#000', marginBottom: '0.25rem' }}>
          KURS BETRETEN
        </h1>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.75rem', color: '#666', marginBottom: '2rem', fontWeight: 400 }}>
          Zugangscode von der Lehrkraft eingeben
        </p>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Vorname</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={fieldStyle}
              placeholder="Vorname"
            />
          </div>
          <div>
            <label style={labelStyle}>Zugangscode</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{ ...fieldStyle, fontSize: '1.4rem', letterSpacing: '0.3em', textAlign: 'center', fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900 }}
              placeholder="XXXXXX"
            />
          </div>

          {error && (
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '0.75rem', color: '#c00', border: '1px solid #c00', padding: '0.5rem 0.75rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 6 || !name.trim()}
            style={{ background: '#000', color: '#fff', border: '1px solid #000', fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.15em', padding: '0.85rem', cursor: (loading || code.length < 6 || !name.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || code.length < 6 || !name.trim()) ? 0.4 : 1, textTransform: 'uppercase' as const }}
          >
            {loading ? 'WIRD GEPRUFT...' : 'BETRETEN'}
          </button>
        </form>
      </div>
    </main>
  )
}
