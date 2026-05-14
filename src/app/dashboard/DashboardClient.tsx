'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CreateClassModal from '@/components/CreateClassModal'
import { createClient } from '@/lib/supabase'
import { formatDuration } from '@/lib/utils'
import type { Professor, Class, Conversation, ConversationError } from '@/types'

interface ClassWithConversations extends Class {
  conversations: Conversation[]
}

interface DashboardClientProps {
  professor: Professor | null
  initialClasses: ClassWithConversations[]
}

const narrow = "'Arial Narrow', Arial, sans-serif"

const DASH_STYLES = `
  .db-body { display: flex; flex: 1; min-height: 0; }
  .db-sidebar { width: 220px; border-right: 1px solid #000; display: flex; flex-direction: column; background: #fff; flex-shrink: 0; }
  .db-main { flex: 1; overflow-y: auto; padding: 2rem; min-width: 0; }
  .db-title-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; }
  .db-edit-fields { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
  .db-stats { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid #000; border-left: 1px solid #000; margin-bottom: 2rem; }
  .db-code-box { border: 1px solid #000; padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
  .db-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .db-nav { padding: 0.65rem 1rem; }
  .db-row-expandable { cursor: pointer; }
  .db-row-expandable:hover td { background: #f5f5f5 !important; }
  .db-error-detail td { background: #fafafa !important; }
  .db-error-table { width: 100%; border-collapse: collapse; font-family: 'Arial Narrow', Arial, sans-serif; }
  .db-error-table th { font-size: 0.55rem; letter-spacing: 0.1em; font-weight: 400; color: #999; text-transform: uppercase; text-align: left; padding: 0.3rem 0.5rem; border-bottom: 1px solid #e0e0e0; }
  .db-error-table td { font-size: 0.72rem; padding: 0.3rem 0.5rem; border-bottom: 1px solid #f0f0f0; }
  .db-summary-card { border: 1px solid #e8e8e8; padding: 1rem 1.25rem; margin-bottom: 1rem; }
  @media (max-width: 700px) {
    .db-body { flex-direction: column; }
    .db-sidebar { width: 100% !important; border-right: none; border-bottom: 1px solid #000; max-height: 180px; overflow-y: auto; }
    .db-main { padding: 1rem; }
    .db-title-row { flex-direction: column; gap: 0.75rem; }
    .db-edit-fields { flex-direction: column; }
    .db-stats { grid-template-columns: 1fr !important; }
    .db-code-box { flex-direction: column; align-items: flex-start !important; gap: 0.75rem; }
    .db-nav-name { display: none; }
  }
`

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
      <style>{DASH_STYLES}</style>

      {/* Navbar */}
      <nav className="db-nav" style={{ background: '#fff', borderBottom: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <img src="/robot-mascot.png" alt="" style={{ maxHeight: '40px', objectFit: 'contain' }} />
          <span style={{ fontFamily: narrow, fontWeight: 400, fontSize: '0.85rem', letterSpacing: '0.18em', color: '#000', textTransform: 'uppercase' }}>
            LEHRER.LIVE
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="db-nav-name" style={{ fontFamily: narrow, fontSize: '0.65rem', letterSpacing: '0.1em', color: '#999', textTransform: 'uppercase' }}>
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

      <div className="db-body">

        {/* Sidebar */}
        <aside className="db-sidebar">
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
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
        <main className="db-main">
          {!selectedClass ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px' }}>
              <p style={{ fontFamily: narrow, fontSize: '0.65rem', letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>
                KLASSE AUSWÄHLEN
              </p>
            </div>
          ) : (
            <ClassDetail cls={selectedClass} avgAccuracy={avgAccuracy} onDelete={handleDeleteClass} onUpdated={refresh} />
          )}
        </main>
      </div>

      {showCreate && (
        <CreateClassModal professorId={professor.id} onClose={() => setShowCreate(false)} onCreated={refresh} />
      )}
    </div>
  )
}

const LEVELS = ['A1 — Beginner', 'A2 — Elementary', 'B1 — Intermediate', 'B2 — Upper Intermediate', 'C1 — Advanced']
const PERSONALITIES = ['Friendly & encouraging', 'Strict & precise', 'Playful & humorous', 'Socratic (asks questions back)']

function ClassDetail({
  cls,
  avgAccuracy,
  onDelete,
  onUpdated,
}: {
  cls: ClassWithConversations
  avgAccuracy: (c: Conversation[]) => number
  onDelete: (id: string) => void
  onUpdated: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editRobotName, setEditRobotName] = useState('')
  const [editLevel, setEditLevel] = useState('')
  const [editPersonality, setEditPersonality] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [convErrors, setConvErrors] = useState<Record<string, ConversationError[]>>({})
  const [lessonContext, setLessonContext] = useState(cls.lesson_context ?? '')
  const [lessonExpanded, setLessonExpanded] = useState(false)
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'extracting' | 'saving' | 'done' | 'error'>('idle')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function handleLessonUpload(files: FileList) {
    setUploadState('uploading')
    console.log('[lesson] upload started,', files.length, 'file(s)')
    try {
      const supabase = createClient()
      const ts = Date.now()
      for (const file of Array.from(files)) {
        const path = `${cls.id}/${ts}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { error: storageErr } = await supabase.storage.from('lessons').upload(path, file, { upsert: true })
        if (storageErr) console.error('[lesson] storage upload ERROR:', storageErr.message)
        else console.log('[lesson] storage upload OK, path:', path)
      }

      setUploadState('extracting')
      const form = new FormData()
      for (const file of Array.from(files)) form.append('image', file)
      form.append('level', cls.level)
      const ocrRes = await fetch('/api/ocr', { method: 'POST', body: form })
      console.log('[lesson] OCR response status:', ocrRes.status)
      if (!ocrRes.ok) {
        const body = await ocrRes.text()
        console.error('[lesson] OCR failed, body:', body)
        throw new Error('OCR failed')
      }
      const { text } = await ocrRes.json()
      console.log('[lesson] OCR extracted text (' + text.length + ' chars):', text.slice(0, 200))

      setUploadState('saving')
      const { error: dbErr } = await supabase.from('classes').update({ lesson_context: text }).eq('id', cls.id)
      if (dbErr) {
        console.error('[lesson] DB update ERROR:', dbErr.message, 'code:', dbErr.code)
        throw new Error('DB update failed')
      }
      console.log('[lesson] DB update OK — lesson_context saved for class', cls.id)
      setLessonContext(text)
      setUploadState('done')
      setTimeout(() => setUploadState('idle'), 3000)
    } catch (e) {
      console.error('[lesson] handleLessonUpload EXCEPTION:', e)
      setUploadState('error')
      setTimeout(() => setUploadState('idle'), 3000)
    }
  }

  const uploadLabel: Record<string, string> = {
    idle: 'LEKTION HOCHLADEN',
    uploading: 'WIRD HOCHGELADEN...',
    extracting: 'TEXT WIRD EXTRAHIERT...',
    saving: 'WIRD GESPEICHERT...',
    done: 'GESPEICHERT ✓',
    error: 'FEHLER',
  }
  const uploadBusy = uploadState !== 'idle' && uploadState !== 'done' && uploadState !== 'error'

  useEffect(() => {
    const ids = cls.conversations.map(c => c.id)
    if (ids.length === 0) return
    const supabase = createClient()
    supabase.from('conversation_errors').select('*').in('conversation_id', ids).then(({ data }) => {
      if (!data) return
      const grouped: Record<string, ConversationError[]> = {}
      for (const e of data) {
        if (!grouped[e.conversation_id]) grouped[e.conversation_id] = []
        grouped[e.conversation_id].push(e)
      }
      setConvErrors(grouped)
    })
  }, [cls.id])

  function copyCode() {
    navigator.clipboard.writeText(cls.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function startEdit() {
    setEditRobotName(cls.robot_name)
    setEditLevel(cls.level)
    setEditPersonality(cls.personality)
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('classes').update({
      robot_name: editRobotName,
      level: editLevel,
      personality: editPersonality,
    }).eq('id', cls.id)
    setSaving(false)
    setEditing(false)
    onUpdated()
  }

  const acc = avgAccuracy(cls.conversations)
  const totalTime = cls.conversations.reduce((s, c) => s + c.duration, 0)

  const fieldStyle: React.CSSProperties = {
    width: '100%', border: '1px solid #ccc', background: '#fff', color: '#000',
    fontFamily: narrow, fontSize: '0.8rem', padding: '0.4rem 0.6rem', outline: 'none', borderRadius: 0,
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: narrow, fontSize: '0.55rem', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: '#999', marginBottom: '0.25rem',
  }

  return (
    <div style={{ maxWidth: '52rem' }}>

      {/* Title row */}
      <div className="db-title-row">
        <div style={{ flex: 1, marginRight: '1rem', minWidth: 0 }}>
          <p style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            KLASSEN-AKTE
          </p>
          <h2 style={{ fontFamily: narrow, fontWeight: 400, fontSize: '1.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', margin: 0, wordBreak: 'break-word' }}>
            {cls.name}
          </h2>
          {!editing ? (
            <p style={{ fontFamily: narrow, fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
              {cls.level} — ROBOTER: {cls.robot_name}
            </p>
          ) : (
            <div className="db-edit-fields">
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Roboter-Name</label>
                <input value={editRobotName} onChange={e => setEditRobotName(e.target.value)} style={fieldStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Sprachniveau</label>
                <select value={editLevel} onChange={e => setEditLevel(e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Persönlichkeit</label>
                <select value={editPersonality} onChange={e => setEditPersonality(e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                  {PERSONALITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {!editing ? (
            <>
              <button onClick={startEdit} style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.1em', color: '#000', background: 'none', border: '1px solid #000', padding: '0.3rem 0.6rem', cursor: 'pointer', textTransform: 'uppercase' }}>
                BEARBEITEN
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadBusy}
                style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.1em', color: uploadState === 'done' ? '#2a7a2a' : uploadState === 'error' ? '#a00000' : '#000', background: 'none', border: `1px solid ${uploadState === 'done' ? '#2a7a2a' : uploadState === 'error' ? '#a00000' : '#000'}`, padding: '0.3rem 0.6rem', cursor: uploadBusy ? 'not-allowed' : 'pointer', textTransform: 'uppercase', opacity: uploadBusy ? 0.6 : 1, whiteSpace: 'nowrap' }}
              >
                {uploadLabel[uploadState]}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => { const files = e.target.files; if (files?.length) { handleLessonUpload(files); e.target.value = '' } }}
              />
              <button onClick={() => onDelete(cls.id)} style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.1em', color: '#999', background: 'none', border: '1px solid #ccc', padding: '0.3rem 0.6rem', cursor: 'pointer', textTransform: 'uppercase' }}>
                LÖSCHEN
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving} style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.1em', background: '#000', color: '#fff', border: '1px solid #000', padding: '0.3rem 0.6rem', cursor: saving ? 'not-allowed' : 'pointer', textTransform: 'uppercase', opacity: saving ? 0.5 : 1 }}>
                {saving ? 'SPEICHERT...' : 'SPEICHERN'}
              </button>
              <button onClick={() => setEditing(false)} style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.1em', color: '#999', background: 'none', border: '1px solid #ccc', padding: '0.3rem 0.6rem', cursor: 'pointer', textTransform: 'uppercase' }}>
                ABBRECHEN
              </button>
            </>
          )}
        </div>
      </div>

      {/* Code */}
      <div className="db-code-box">
        <div>
          <p style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.12em', color: '#999', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            ZUGANGSCODE FÜR SCHÜLER
          </p>
          <p style={{ fontFamily: narrow, fontWeight: 400, fontSize: '2.2rem', letterSpacing: '0.3em', color: '#000', margin: 0 }}>
            {cls.code}
          </p>
        </div>
        <button onClick={copyCode} style={{ fontFamily: narrow, fontSize: '0.65rem', letterSpacing: '0.12em', background: '#000', color: '#fff', border: '1px solid #000', padding: '0.6rem 1.25rem', cursor: 'pointer', textTransform: 'uppercase' }}>
          {copied ? 'KOPIERT' : 'KOPIEREN'}
        </button>
      </div>

      {/* Lesson context */}
      <div style={{ border: '1px solid #eee', padding: '0.75rem 1rem', marginBottom: '2rem' }}>
        <p style={{ fontFamily: narrow, fontSize: '0.55rem', letterSpacing: '0.12em', color: '#999', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>
          AKTUELLE LEKTION
        </p>
        {lessonContext ? (
          <div>
            <p style={{ fontFamily: narrow, fontSize: '0.78rem', color: '#333', margin: '0 0 0.3rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {lessonExpanded || lessonContext.length <= 150
                ? lessonContext
                : lessonContext.slice(0, 150) + '...'}
            </p>
            {lessonContext.length > 150 && (
              <button
                onClick={() => setLessonExpanded(e => !e)}
                style={{ fontFamily: narrow, fontSize: '0.6rem', color: '#999', background: 'none', border: 'none', padding: 0, cursor: 'pointer', letterSpacing: '0.06em' }}
              >
                {lessonExpanded ? 'Ascunde' : 'Vezi tot'}
              </button>
            )}
          </div>
        ) : (
          <p style={{ fontFamily: narrow, fontSize: '0.72rem', color: '#bbb', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Keine Lektion hochgeladen
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="db-stats">
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
        <div className="db-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: narrow, minWidth: '480px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                {['Schüler', 'Genauigkeit', 'Dauer', 'Fehler', 'Datum', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.75rem', fontSize: '0.6rem', letterSpacing: '0.1em', fontWeight: 400, textTransform: 'uppercase', color: '#999' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...cls.conversations]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((conv, i) => {
                  const isExpanded = expandedId === conv.id
                  const errors = convErrors[conv.id] ?? []
                  return (
                    <>
                      <tr
                        key={conv.id}
                        className="db-row-expandable"
                        onClick={() => setExpandedId(isExpanded ? null : conv.id)}
                        style={{ borderBottom: isExpanded ? 'none' : '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                      >
                        <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#000', textTransform: 'uppercase' }}>{conv.student_name}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: conv.accuracy >= 80 ? '#2a7a2a' : conv.accuracy >= 60 ? '#7a6a00' : '#a00000' }}>{conv.accuracy}%</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#666' }}>{formatDuration(conv.duration)}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#666' }}>{conv.mistakes}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#bbb' }}>{new Date(conv.created_at).toLocaleDateString('de-DE')}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.65rem', color: '#bbb', whiteSpace: 'nowrap' }}>{isExpanded ? '▲' : '▼'}</td>
                      </tr>
                      {isExpanded && (
                        <tr key={conv.id + '-detail'} className="db-error-detail">
                          <td colSpan={6} style={{ padding: '0.75rem 1rem 1rem', borderBottom: '1px solid #eee' }}>
                            {errors.length === 0 ? (
                              <p style={{ fontFamily: narrow, fontSize: '0.65rem', color: '#bbb', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Keine Fehler aufgezeichnet
                              </p>
                            ) : (
                              <table className="db-error-table">
                                <thead>
                                  <tr>
                                    <th>Gesagt</th>
                                    <th>Korrekte Form</th>
                                    <th style={{ textAlign: 'right' }}>Zeitstempel</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {[...errors].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(e => (
                                    <tr key={e.id}>
                                      <td style={{ color: '#a00000' }}>{e.word_incorrect}</td>
                                      <td style={{ color: '#2a7a2a' }}>{e.word_correct}</td>
                                      <td style={{ textAlign: 'right', color: '#999', fontVariantNumeric: 'tabular-nums' }}>
                                        {new Date(e.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Per-student error summary */}
      {(() => {
        const studentMap = new Map<string, ConversationError[]>()
        for (const conv of cls.conversations) {
          const errors = convErrors[conv.id] ?? []
          if (!studentMap.has(conv.student_name)) studentMap.set(conv.student_name, [])
          studentMap.get(conv.student_name)!.push(...errors)
        }
        const summaries = Array.from(studentMap.entries()).map(([name, errors]) => {
          const agg = new Map<string, { said: string; correct: string; count: number }>()
          for (const e of errors) {
            const key = `${e.word_incorrect}|||${e.word_correct}`
            if (agg.has(key)) agg.get(key)!.count++
            else agg.set(key, { said: e.word_incorrect, correct: e.word_correct, count: 1 })
          }
          return { name, top: Array.from(agg.values()).sort((a, b) => b.count - a.count).slice(0, 5) }
        }).filter(s => s.top.length > 0)
        if (summaries.length === 0) return null
        return (
          <div style={{ marginTop: '2.5rem' }}>
            <p style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase', marginBottom: '1rem' }}>
              FEHLER-ZUSAMMENFASSUNG PRO SCHÜLER
            </p>
            {summaries.map(s => (
              <div key={s.name} className="db-summary-card">
                <p style={{ fontFamily: narrow, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', margin: '0 0 0.75rem' }}>
                  {s.name}
                </p>
                <table className="db-error-table">
                  <thead>
                    <tr>
                      <th>Häufigster Fehler</th>
                      <th>Korrekte Form</th>
                      <th style={{ textAlign: 'right' }}>Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.top.map((e, i) => (
                      <tr key={i}>
                        <td style={{ color: '#a00000' }}>{e.said}</td>
                        <td style={{ color: '#2a7a2a' }}>{e.correct}</td>
                        <td style={{ textAlign: 'right', color: '#999' }}>×{e.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}
