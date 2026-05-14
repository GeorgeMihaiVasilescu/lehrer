'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CreateClassModal from '@/components/CreateClassModal'
import { createClient } from '@/lib/supabase'
import { formatDuration } from '@/lib/utils'
import type { Professor, Class, Conversation } from '@/types'

interface ClassWithConversations extends Class {
  conversations: Conversation[]
}

interface DashboardClientProps {
  professor: Professor | null
  initialClasses: ClassWithConversations[]
}

const narrow = "'Arial Narrow', Arial, sans-serif"

export default function DashboardClient({ professor, initialClasses }: DashboardClientProps) {
  const router = useRouter()
  const [classes, setClasses] = useState(initialClasses)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassWithConversations | null>(null)

  const refresh = useCallback(async () => {
    if (!professor) return
    const supabase = createClient()
    const { data } = await supabase
      .from('classes')
      .select('*, conversations(*)')
      .eq('professor_id', professor.id)
      .order('created_at', { ascending: false })
    setClasses(data ?? [])
    setShowCreate(false)
  }, [professor?.id])

  if (!professor) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: narrow, fontSize: '0.75rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' }}>
          WIRD GELADEN...
        </p>
      </div>
    )
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDeleteClass(classId: string) {
    if (!confirm('Klasse und alle Sitzungsdaten löschen?')) return
    const supabase = createClient()
    await supabase.from('classes').delete().eq('id', classId)
    setSelectedClass(null)
    refresh()
  }

  const avgAccuracy = (convs: Conversation[]) => {
    if (!convs.length) return 0
    return Math.round(convs.reduce((s, c) => s + c.accuracy, 0) / convs.length)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', color: '#000' }}>

      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #000', padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <img src="/robot.png" alt="" style={{ width: '40px', objectFit: 'contain' }} />
          <span style={{ fontFamily: narrow, fontWeight: 400, fontSize: '0.85rem', letterSpacing: '0.18em', color: '#000', textTransform: 'uppercase' }}>
            LEHRER.LIVE
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontFamily: narrow, fontSize: '0.65rem', letterSpacing: '0.1em', color: '#999', textTransform: 'uppercase' }}>
            {professor.name}
          </span>
          <button
            onClick={handleSignOut}
            style={{ fontFamily: narrow, fontWeight: 400, fontSize: '0.7rem', letterSpacing: '0.12em', color: '#000', background: 'none', border: '1px solid #000', padding: '0.3rem 0.75rem', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            ABMELDEN
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* Sidebar */}
        <aside style={{ width: '220px', borderRight: '1px solid #000', display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase' }}>
              KLASSEN
            </span>
            <button
              onClick={() => setShowCreate(true)}
              style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.1em', background: '#000', color: '#fff', border: '1px solid #000', padding: '0.25rem 0.6rem', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              + NEU
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {classes.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <p style={{ fontFamily: narrow, fontSize: '0.6rem', color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  KEINE KLASSEN
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  style={{ fontFamily: narrow, fontSize: '0.65rem', letterSpacing: '0.1em', color: '#000', background: 'none', border: '1px solid #000', padding: '0.4rem 0.75rem', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  NEUE KLASSE ERSTELLEN
                </button>
              </div>
            ) : (
              classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #eee',
                    background: selectedClass?.id === cls.id ? '#000' : '#fff',
                    color: selectedClass?.id === cls.id ? '#fff' : '#000',
                    cursor: 'pointer',
                    display: 'block',
                    fontFamily: narrow,
                    fontWeight: 400,
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  <div style={{ marginBottom: '0.15rem' }}>{cls.name}</div>
                  <div style={{ fontSize: '0.6rem', color: selectedClass?.id === cls.id ? '#aaa' : '#999', letterSpacing: '0.04em' }}>
                    {cls.level.split(' — ')[0]} — {cls.conversations.length} SITZUNGEN
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {!selectedClass ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p style={{ fontFamily: narrow, fontSize: '0.65rem', letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>
                KLASSE AUSWÄHLEN
              </p>
            </div>
          ) : (
            <ClassDetail cls={selectedClass} avgAccuracy={avgAccuracy} onDelete={handleDeleteClass} />
          )}
        </main>
      </div>

      {showCreate && (
        <CreateClassModal professorId={professor.id} onClose={() => setShowCreate(false)} onCreated={refresh} />
      )}
    </div>
  )
}

function ClassDetail({
  cls,
  avgAccuracy,
  onDelete,
}: {
  cls: ClassWithConversations
  avgAccuracy: (c: Conversation[]) => number
  onDelete: (id: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const narrow = "'Arial Narrow', Arial, sans-serif"

  function copyCode() {
    navigator.clipboard.writeText(cls.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const acc = avgAccuracy(cls.conversations)
  const totalTime = cls.conversations.reduce((s, c) => s + c.duration, 0)

  return (
    <div style={{ maxWidth: '52rem' }}>

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <p style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            KLASSEN-AKTE
          </p>
          <h2 style={{ fontFamily: narrow, fontWeight: 400, fontSize: '1.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', margin: 0 }}>
            {cls.name}
          </h2>
          <p style={{ fontFamily: narrow, fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
            {cls.level} — ROBOTER: {cls.robot_name}
          </p>
        </div>
        <button
          onClick={() => onDelete(cls.id)}
          style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.1em', color: '#999', background: 'none', border: '1px solid #ccc', padding: '0.3rem 0.6rem', cursor: 'pointer', textTransform: 'uppercase' }}
        >
          LÖSCHEN
        </button>
      </div>

      {/* Code */}
      <div style={{ border: '1px solid #000', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <p style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.12em', color: '#999', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            ZUGANGSCODE FÜR SCHÜLER
          </p>
          <p style={{ fontFamily: narrow, fontWeight: 400, fontSize: '2.2rem', letterSpacing: '0.3em', color: '#000', margin: 0 }}>
            {cls.code}
          </p>
        </div>
        <button
          onClick={copyCode}
          style={{ fontFamily: narrow, fontSize: '0.65rem', letterSpacing: '0.12em', background: '#000', color: '#fff', border: '1px solid #000', padding: '0.6rem 1.25rem', cursor: 'pointer', textTransform: 'uppercase' }}
        >
          {copied ? 'KOPIERT' : 'KOPIEREN'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #000', borderLeft: '1px solid #000', marginBottom: '2rem' }}>
        {[
          { label: 'Durchschn. Genauigkeit', value: `${acc}%` },
          { label: 'Gesamtsitzungen', value: String(cls.conversations.length) },
          { label: 'Gesamtsprechzeit', value: formatDuration(totalTime) },
        ].map((s) => (
          <div key={s.label} style={{ padding: '1.25rem', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'center' }}>
            <p style={{ fontFamily: narrow, fontWeight: 400, fontSize: '2rem', letterSpacing: '0.05em', color: '#000', margin: '0 0 0.25rem' }}>{s.value}</p>
            <p style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.1em', color: '#999', textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sessions */}
      <p style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        SITZUNGSPROTOKOLL
      </p>
      {cls.conversations.length === 0 ? (
        <div style={{ border: '1px solid #eee', padding: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontFamily: narrow, fontSize: '0.65rem', color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            KEINE EINTRÄGE — CODE AN SCHÜLER WEITERGEBEN
          </p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: narrow }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              {['Schüler', 'Genauigkeit', 'Dauer', 'Fehler', 'Datum'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.75rem', fontSize: '0.6rem', letterSpacing: '0.1em', fontWeight: 400, textTransform: 'uppercase', color: '#999' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...cls.conversations]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((conv, i) => (
                <tr key={conv.id} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#000', textTransform: 'uppercase' }}>{conv.student_name}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: conv.accuracy >= 80 ? '#2a7a2a' : conv.accuracy >= 60 ? '#7a6a00' : '#a00000' }}>{conv.accuracy}%</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#666' }}>{formatDuration(conv.duration)}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#666' }}>{conv.mistakes}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#bbb' }}>{new Date(conv.created_at).toLocaleDateString('de-DE')}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
