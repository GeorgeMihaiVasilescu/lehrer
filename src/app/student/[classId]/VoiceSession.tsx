'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Class } from '@/types'

interface VoiceSessionProps {
  cls: Class
  studentName: string
}

type CallState = 'idle' | 'thinking' | 'speaking' | 'listening' | 'ended'

const narrow = "'Arial Narrow', Arial, sans-serif"
const TOTAL_SECONDS = 20 * 60
const SILENCE_THRESHOLD = 0.008
const SILENCE_MS = 1500
const MIN_RECORD_MS = 500

export default function VoiceSession({ cls, studentName }: VoiceSessionProps) {
  const [callState, setCallState] = useState<CallState>('idle')
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS)
  const [lastRobotText, setLastRobotText] = useState('')
  const [accuracy, setAccuracy] = useState(0)
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  function dbg(msg: string) {
    console.log(msg)
    const t = new Date().toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setDebugLogs(prev => [...prev.slice(-19), `${t} ${msg}`])
  }

  const stateRef = useRef<CallState>('idle')
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([])
  const accuracyRef = useRef(0)
  const convIdRef = useRef<string | null>(null)
  const mistakesRef = useRef(0)
  const startTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)  // TTS playback
  const audioCtxRef = useRef<AudioContext | null>(null)   // mic analysis only
  const analyserRef = useRef<AnalyserNode | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const recordStartRef = useRef(0)

  function go(s: CallState) {
    stateRef.current = s
    setCallState(s)
  }

  useEffect(() => () => teardown(), [])

  function teardown() {
    timerRef.current && clearInterval(timerRef.current)
    audioRef.current?.pause()
    rafRef.current && cancelAnimationFrame(rafRef.current)
    silenceTimerRef.current && clearTimeout(silenceTimerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
  }

  // Pre-create and "touch" an Audio element during the user gesture — required by iOS
  function initAudio() {
    dbg('[audio] initAudio called')
    const audio = new Audio()
    audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
    audio.play()
      .then(() => dbg('[audio] unlock play() OK'))
      .catch(e => dbg(`[audio] unlock play() FAIL: ${e}`))
    audioRef.current = audio
    dbg('[audio] element created')
  }

  // Speaker button: re-touch the audio element so iOS re-approves it
  function handleSpeakerTap() {
    dbg('[audio] speaker tapped')
    const audio = audioRef.current ?? new Audio()
    audioRef.current = audio
    audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
    audio.play()
      .then(() => dbg('[audio] speaker play() OK'))
      .catch(e => dbg(`[audio] speaker play() FAIL: ${e}`))
  }

  async function startCall() {
    try {
      const perm = await navigator.mediaDevices.getUserMedia({ audio: true })
      perm.getTracks().forEach(t => t.stop())
    } catch {
      alert('Mikrofon-Berechtigung erforderlich.')
      return
    }

    // Pre-create audio element during user gesture — required for iOS autoplay policy
    initAudio()

    // Create the conversation record now so we have an ID for real-time error saves
    const supabase = createClient()
    const { data: convRow } = await supabase
      .from('conversations')
      .insert({ class_id: cls.id, student_name: studentName, duration: 0, accuracy: 0, mistakes: 0 })
      .select('id')
      .single()
    convIdRef.current = convRow?.id ?? null

    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const rem = TOTAL_SECONDS - Math.floor((Date.now() - startTimeRef.current) / 1000)
      setTimeLeft(rem)
      if (rem <= 0) { clearInterval(timerRef.current!); timerRef.current = null; void endCall() }
    }, 1000)

    await robotTurn([], `The student's name is ${studentName}. Greet them briefly and invite them to speak German.`, true)
  }

  async function robotTurn(
    history: { role: 'user' | 'assistant'; content: string }[],
    overrideContent?: string,
    isSystem?: boolean,
  ) {
    if (stateRef.current === 'ended') return
    go('thinking')
    const messages = overrideContent
      ? [...history, { role: 'user' as const, content: overrideContent }]
      : history

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: cls.id, robotName: cls.robot_name, personality: cls.personality, level: cls.level, messages, isSystem }),
      })
      const data = await res.json()
      const reply: string = data.reply ?? ''
      setLastRobotText(reply)

      if (data.accuracy !== undefined) { accuracyRef.current = data.accuracy; setAccuracy(data.accuracy) }
      if (data.mistakes !== undefined) mistakesRef.current += data.mistakes
      if (convIdRef.current && Array.isArray(data.errors) && data.errors.length > 0) {
        const supabase = createClient()
        void supabase.from('conversation_errors').insert(
          data.errors.map((e: { said: string; correct: string }) => ({
            conversation_id: convIdRef.current,
            word_incorrect: e.said,
            word_correct: e.correct,
          }))
        )
      }

      historyRef.current = [...history, { role: 'assistant' as const, content: reply }]
      await speak(reply)
    } catch {
      startListening()
    }
  }

  async function speak(text: string) {
    if (stateRef.current === 'ended') return
    go('speaking')
    try {
      dbg(`[tts] fetch: "${text.slice(0, 30)}..."`)
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      dbg(`[tts] status: ${res.status} ${res.headers.get('content-type')}`)
      if (!res.ok) { dbg(`[tts] ERROR status ${res.status}`); startListening(); return }

      const blob = await res.blob()
      dbg(`[tts] blob: ${blob.size}b type=${blob.type}`)
      if (blob.size === 0) { dbg('[tts] ERROR empty blob'); startListening(); return }

      const url = URL.createObjectURL(blob)
      const audio = audioRef.current ?? new Audio()
      audioRef.current = audio
      audio.src = url
      dbg('[tts] src set, calling play()...')

      await new Promise<void>(resolve => {
        audio.onended = () => { dbg('[tts] onended ✓'); URL.revokeObjectURL(url); resolve() }
        audio.onerror = (e) => { dbg(`[tts] onerror: ${JSON.stringify(e)}`); URL.revokeObjectURL(url); resolve() }
        audio.play()
          .then(() => dbg('[tts] play() resolved ✓'))
          .catch(e => { dbg(`[tts] play() REJECTED: ${e}`); resolve() })
      })
    } catch (e) {
      dbg(`[tts] EXCEPTION: ${e}`)
    }
    startListening()
  }

  function startListening() {
    if (stateRef.current === 'ended') return
    go('listening')
    chunksRef.current = []
    silenceTimerRef.current && clearTimeout(silenceTimerRef.current)
    silenceTimerRef.current = null
    rafRef.current && cancelAnimationFrame(rafRef.current)

    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(stream => {
      if (stateRef.current !== 'listening') { stream.getTracks().forEach(t => t.stop()); return }
      streamRef.current = stream

      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser
      ctx.createMediaStreamSource(stream).connect(analyser)

      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.start(100)
      recordStartRef.current = Date.now()

      function tick() {
        if (stateRef.current !== 'listening') return
        const buf = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(buf)
        const rms = Math.sqrt(buf.reduce((s, x) => s + x * x, 0) / buf.length)

        if (Date.now() - recordStartRef.current > MIN_RECORD_MS) {
          if (rms < SILENCE_THRESHOLD) {
            if (!silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(() => {
                silenceTimerRef.current = null
                stopAndProcess()
              }, SILENCE_MS)
            }
          } else {
            if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }).catch(() => { const s: CallState = stateRef.current; if (s !== 'ended') go('idle') })
  }

  function stopAndProcess() {
    if (stateRef.current !== 'listening') return
    rafRef.current && cancelAnimationFrame(rafRef.current)
    rafRef.current = null

    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    recorder.addEventListener('stop', async () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      audioCtxRef.current?.close()
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      await transcribeAndRespond(blob)
    }, { once: true })
    recorder.stop()
  }

  async function transcribeAndRespond(audio: Blob) {
    if (stateRef.current === 'ended') return
    go('thinking')
    const form = new FormData()
    form.append('audio', audio, 'recording.webm')
    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: form })
      const { text } = await res.json()
      if (!text?.trim()) { startListening(); return }
      const next = [...historyRef.current, { role: 'user' as const, content: text }]
      historyRef.current = next
      await robotTurn(next)
    } catch {
      startListening()
    }
  }

  async function endCall() {
    if (stateRef.current === 'ended') return
    go('ended')
    teardown()
    if (!convIdRef.current) return
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    const supabase = createClient()
    await supabase.from('conversations').update({
      duration,
      accuracy: accuracyRef.current,
      mistakes: mistakesRef.current,
    }).eq('id', convIdRef.current)
  }

  function fmt(s: number) {
    const n = Math.max(0, s)
    return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
  }

  const imgStyle: React.CSSProperties = {
    objectFit: 'contain',
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
  }

  const debugPanel = (
    <div className="vs-debug-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ color: '#0f0', fontWeight: 'bold', fontSize: '10px' }}>DEBUG</span>
        <button onClick={() => setDebugLogs([])} style={{ background: 'none', border: '1px solid #555', color: '#aaa', fontSize: '9px', padding: '1px 5px', cursor: 'pointer' }}>clear</button>
      </div>
      {debugLogs.length === 0
        ? <div style={{ color: '#555' }}>no logs yet</div>
        : [...debugLogs].reverse().map((l, i) => (
            <div key={i} style={{ color: l.includes('ERROR') || l.includes('FAIL') || l.includes('REJECTED') || l.includes('EXCEPTION') ? '#f66' : l.includes('✓') ? '#0f0' : '#ccc', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '2px' }}>
              {l}
            </div>
          ))}
    </div>
  )

  /* ── END SCREEN ── */
  if (callState === 'ended') {
    return (
      <main style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <img src="/robot-mascot.png" alt="" style={{ ...imgStyle, width: '200px', marginBottom: '2rem' }} />
        <p style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#999', textTransform: 'uppercase', marginBottom: '0.5rem' }}>SITZUNG BEENDET</p>
        <h2 style={{ fontFamily: narrow, fontWeight: 400, fontSize: '1.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', margin: '0 0 0.5rem' }}>GUT GEMACHT</h2>
        <p style={{ fontFamily: narrow, fontSize: '0.8rem', color: '#999', marginBottom: '2rem' }}>{studentName}</p>
        <p style={{ fontFamily: narrow, fontWeight: 400, fontSize: '3rem', letterSpacing: '0.05em', color: '#000', margin: '0 0 0.25rem' }}>{accuracy}%</p>
        <p style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.12em', color: '#999', textTransform: 'uppercase', marginBottom: '2.5rem' }}>GENAUIGKEIT</p>
        <Link href="/student" style={{ fontFamily: narrow, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', background: '#000', color: '#fff', border: '1px solid #000', padding: '0.75rem 2rem', textDecoration: 'none' }}>
          ZURÜCK
        </Link>
        {debugPanel}
      </main>
    )
  }

  /* ── IDLE SCREEN ── */
  if (callState === 'idle') {
    return (
      <main style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <img src="/robot-mascot.png" alt="" style={{ ...imgStyle, width: '200px', marginBottom: '2rem' }} />
        <h2 style={{ fontFamily: narrow, fontWeight: 400, fontSize: '1.4rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#000', margin: '0 0 0.4rem' }}>
          {cls.robot_name}
        </h2>
        <p style={{ fontFamily: narrow, fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem' }}>{studentName}</p>
        <p style={{ fontFamily: narrow, fontSize: '0.65rem', color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3rem' }}>
          20 MINUTEN — DEUTSCH
        </p>
        <button
          onClick={startCall}
          style={{
            fontFamily: narrow,
            fontSize: '1.1rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            background: '#000',
            color: '#fff',
            border: '2px solid #000',
            padding: '1.25rem 5rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          ANRUFEN
        </button>
        {debugPanel}
      </main>
    )
  }

  /* ── ACTIVE CALL ── */
  const robotDim = callState === 'thinking'
  const dotColor = callState === 'listening' ? '#16a34a' : callState === 'speaking' ? '#000' : '#bbb'
  const dotBlink = callState === 'listening' || callState === 'speaking'
  const stateLabel = ({ thinking: 'VERARBEITUNG', speaking: 'SPRICHT', listening: 'HÖRT ZU' } as Record<string, string>)[callState] ?? ''

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes blink { 50% { opacity: 0 } }
        .vs-header { border-bottom: 1px solid #000; padding: 0.65rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
        .vs-robot-label { display: flex; align-items: center; gap: 0.5rem; min-width: 0; }
        .vs-robot-level { display: inline; }
        .vs-right { display: flex; align-items: center; gap: 1rem; }
        .vs-state-label { display: flex; align-items: center; gap: 0.35rem; }
        .vs-speaker-btn { display: none; background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0.1rem 0.2rem; outline: none; line-height: 1; }
        .vs-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; }
        .vs-robot-img { width: 200px; }
        @media (max-width: 480px) {
          .vs-header { padding: 0.5rem 0.75rem; }
          .vs-robot-level { display: none; }
          .vs-right { gap: 0.6rem; }
          .vs-state-label { display: none; }
          .vs-speaker-btn { display: inline-flex; align-items: center; }
          .vs-robot-img { width: 140px !important; }
          .vs-center { padding: 1.5rem 1rem; }
        }
        .vs-debug-panel { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.88); color: #ccc; font-family: monospace; font-size: 10px; padding: 8px; max-height: 200px; overflow-y: auto; z-index: 9999; }
        @media (max-width: 768px) { .vs-debug-panel { display: block; } }
      `}</style>

      {/* Header */}
      <div className="vs-header">
        <div className="vs-robot-label">
          <img src="/robot-mascot.png" alt="" style={{ ...imgStyle, width: '28px', flexShrink: 0 }} />
          <span style={{ fontFamily: narrow, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cls.robot_name}
          </span>
          <span className="vs-robot-level" style={{ fontFamily: narrow, fontSize: '0.65rem', color: '#bbb', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            {cls.level.split(' — ')[0]}
          </span>
        </div>

        <div className="vs-right">
          <span style={{ fontFamily: narrow, fontSize: '1rem', letterSpacing: '0.08em', color: timeLeft < 120 ? '#c00' : '#000', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {fmt(timeLeft)}
          </span>
          <span className="vs-state-label" style={{
            fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: callState === 'listening' ? '#16a34a' : callState === 'speaking' ? '#000' : '#999',
          }}>
            <span style={{ width: '6px', height: '6px', display: 'inline-block', background: dotColor, animation: dotBlink ? 'blink 1s step-end infinite' : 'none' }} />
            {stateLabel}
          </span>
          {/* Speaker button — mobile only, re-unlocks AudioContext after backgrounding */}
          <button className="vs-speaker-btn" onClick={handleSpeakerTap} title="Audio aktivieren">
            🔊
          </button>
          <button
            onClick={endCall}
            style={{ fontFamily: narrow, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: '#c00', border: '1px solid #c00', color: '#fff', padding: '0.3rem 0.6rem', cursor: 'pointer', whiteSpace: 'nowrap', outline: 'none' }}
          >
            AUFLEGEN
          </button>
        </div>
      </div>

      {/* Center */}
      <div className="vs-center">
        <img
          src="/robot-mascot.png"
          alt=""
          className="vs-robot-img"
          style={{ ...imgStyle, marginBottom: '2rem', opacity: robotDim ? 0.35 : 1, transition: 'opacity 0.3s' }}
        />
        {lastRobotText && (
          <p style={{ fontFamily: narrow, fontWeight: 400, fontSize: '1rem', color: '#333', maxWidth: '32rem', lineHeight: 1.7, letterSpacing: '0.02em' }}>
            {lastRobotText}
          </p>
        )}
        {callState === 'listening' && (
          <p style={{ fontFamily: narrow, fontSize: '0.6rem', letterSpacing: '0.15em', color: '#16a34a', textTransform: 'uppercase', marginTop: '1.5rem' }}>
            ● SPRECHEN SIE JETZT
          </p>
        )}
      </div>

      {debugPanel}
    </main>
  )
}
