import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const audio = form.get('audio') as File

  if (!audio) return NextResponse.json({ text: '' }, { status: 400 })

  const groqForm = new FormData()
  groqForm.append('file', audio, 'recording.webm')
  groqForm.append('model', 'whisper-large-v3-turbo')
  groqForm.append('language', 'de')
  groqForm.append('response_format', 'json')

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: groqForm,
  })

  if (!res.ok) return NextResponse.json({ text: '' })
  const data = await res.json()
  return NextResponse.json({ text: data.text ?? '' })
}
