'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { generateClassCode } from '@/lib/utils'

interface CreateClassModalProps {
  professorId: string
  onClose: () => void
  onCreated: () => void
}

const LEVELS = ['A1 — Beginner', 'A2 — Elementary', 'B1 — Intermediate', 'B2 — Upper Intermediate', 'C1 — Advanced']
const PERSONALITIES = [
  'Friendly & encouraging',
  'Strict & precise',
  'Playful & humorous',
  'Socratic (asks questions back)',
]

const narrow = "'Arial Narrow', Arial, sans-serif"

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: narrow,
  fontWeight: 400,
  fontSize: '0.6rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#999',
  marginBottom: '0.35rem',
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #000',
  background: '#fff',
  color: '#000',
  fontFamily: narrow,
  fontSize: '0.85rem',
  padding: '0.6rem 0.75rem',
  outline: 'none',
  borderRadius: 0,
}

export default function CreateClassModal({ professorId, onClose, onCreated }: CreateClassModalProps) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState(LEVELS[0])
  const [robotName, setRobotName] = useState('Klaus')
  const [personality, setPersonality] = useState(PERSONALITIES[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('classes').insert({
      professor_id: professorId,
      name,
      level,
      robot_name: robotName,
      personality,
      code: generateClassCode(),
    })
    if (error) { setError(error.message); setLoading(false); return }
    onCreated()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ background: '#fff', border: '1px solid #000', width: '100%', maxWidth: '26rem', padding: '2rem' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontFamily: narrow, fontSize: '0.55rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              FORMULAR LHR-KL-001
            </p>
            <h2 style={{ fontFamily: narrow, fontWeight: 400, fontSize: '1.2rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', margin: 0 }}>
              NEUE KLASSE
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#000', lineHeight: 1, padding: '0 0.25rem' }}>
            &times;
          </button>
        </div>

        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Bezeichnung der Klasse</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} placeholder="Deutsch 101 — Montag" />
          </div>
          <div>
            <label style={labelStyle}>Sprachniveau</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ ...fieldStyle, appearance: 'none', cursor: 'pointer' }}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Name des Roboters</label>
            <input required value={robotName} onChange={(e) => setRobotName(e.target.value)} style={fieldStyle} placeholder="Klaus" />
          </div>
          <div>
            <label style={labelStyle}>Persönlichkeit</label>
            <select value={personality} onChange={(e) => setPersonality(e.target.value)} style={{ ...fieldStyle, appearance: 'none', cursor: 'pointer' }}>
              {PERSONALITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          {error && (
            <p style={{ fontFamily: narrow, fontSize: '0.75rem', color: '#c00', border: '1px solid #c00', padding: '0.5rem 0.75rem' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, fontFamily: narrow, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', background: '#fff', color: '#000', border: '1px solid #000', padding: '0.75rem', cursor: 'pointer' }}
            >
              ABBRECHEN
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, fontFamily: narrow, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', background: '#000', color: '#fff', border: '1px solid #000', padding: '0.75rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? 'WIRD ERSTELLT...' : 'KLASSE ANLEGEN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
