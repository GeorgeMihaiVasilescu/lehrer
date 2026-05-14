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

  const stateRef = useRef<CallState>('idle')
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([])
  const accuracyRef = useRef(0)
  const mistakesRef = useRef(0)
  const startTimeRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  // Separate contexts: ttsCtx for playback (created on user gesture), audioCtx for mic analysis
  const ttsCtxRef = useRef<AudioContext | null>(null)
  const ttsSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
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
    try { ttsSourceRef.current?.stop() } catch {}
    rafRef.current && cancelAnimationFrame(rafRef.current)
    silenceTimerRef.current && clearTimeout(silenceTimerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
    ttsCtxRef.current?.close()
  }

  // Must be called directly from a user gesture to unlock iOS/Android audio
  function unlockTtsContext() {
    console.log('[audio] unlockTtsContext called')
    const ctx = new AudioContext()
    ttsCtxRef.current = ctx
    console.log('[audio] AudioContext created, state:', ctx.state)
    // Fire-and-forget resume — do NOT await before playing (kills iOS gesture window)
    ctx.resume().then(() => console.log('[audio] ctx.resume() resolved, state:', ctx.state))
    // Play silent buffer synchronously within gesture
    const silent = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()
    src.buffer = silent
    src.connect(ctx.destination)
    src.start(0)
    console.log('[audio] silent buffer started')
  }

  // Speaker button: plays an audible 440 Hz beep to confirm AudioContext works
  async function handleSpeakerTap() {
    console.log('[audio] speaker tapped')
    let ctx = ttsCtxRef.current
    if (!ctx) {
      console.log('[audio] no ctx — creating new one in speaker tap')
      ctx = new AudioContext()
      ttsCtxRef.current = ctx
    }
    console.log('[audio] ctx state before resume:', ctx.state)
    try { await ctx.resume() } catch (e) { console.error('[audio] resume error:', e) }
    console.log('[audio] ctx state after resume:', ctx.state)
    // Audible test beep — 440 Hz for 0.4s
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 440
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
      console.log('[audio] test beep started')
    } catch (e) {
      console.error('[audio] beep error:', e)
    }
  }

  async function startCall() {
    try {
      const perm = await navigator.mediaDevices.getUserMedia({ audio: true })
      perm.getTracks().forEach(t => t.stop())
    } catch {
      alert('Mikrofon-Berechtigung erforderlich.')
      return
    }

    // Unlock audio context synchronously within the user gesture (no await — preserves gesture window)
    unlockTtsContext()
    console.log('[audio] after unlockTtsContext, ctx state:', ttsCtxRef.current?.state)

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
      console.log('[tts] fetching audio for:', text.slice(0, 40))
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      console.log('[tts] fetch response status:', res.status, 'content-type:', res.headers.get('content-type'))
      if (!res.ok) {
        console.error('[tts] fetch failed:', res.status)
        startListening()
        return
      }
      const arrayBuffer = await res.arrayBuffer()
      console.log('[tts] arrayBuffer byteLength:', arrayBuffer.byteLength)
      const ctx = ttsCtxRef.current
      if (!ctx) { console.error('[tts] no AudioContext'); startListening(); return }
      console.log('[tts] ctx state before resume:', ctx.state)
      if (ctx.state === 'suspended') await ctx.resume()
      console.log('[tts] ctx state after resume:', ctx.state)
      let audioBuffer: AudioBuffer
      try {
        audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        console.log('[tts] decoded audioBuffer duration:', audioBuffer.duration, 'channels:', audioBuffer.numberOfChannels)
      } catch (e) {
        console.error('[tts] decodeAudioData error:', e)
        startListening()
        return
      }
      await new Promise<void>(resolve => {
        const source = ctx.createBufferSource()
        ttsSourceRef.current = source
        source.buffer = audioBuffer
        source.connect(ctx.destination)
        source.onended = () => { console.log('[tts] playback ended'); resolve() }
        source.start(0)
        console.log('[tts] source.start(0) called')
      })
    } catch (e) {
      console.error('[tts] unexpected error:', e)
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
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
    const supabase = createClient()
    await supabase.from('conversations').insert({
      class_id: cls.id,
      student_name: studentName,
      duration,
      accuracy: accuracyRef.current,
      mistakes: mistakesRef.current,
    })
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

    </main>
  )
}
