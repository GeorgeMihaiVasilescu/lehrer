import { NextRequest, NextResponse } from 'next/server'

const levelMap: Record<string, string> = {
  A1: 'absolute beginner — use only the simplest words and very short sentences',
  A2: 'elementary — use simple, common vocabulary and basic grammar',
  B1: 'intermediate — use clear, everyday German with moderate complexity',
  B2: 'upper intermediate — use richer vocabulary and more complex structures',
  C1: 'advanced — use natural, fluent German at near-native level',
}

const personalityMap: Record<string, string> = {
  'Friendly & encouraging': 'You are warm, encouraging, and celebrate every small success.',
  'Strict & precise': 'You are strict and precise. Correct every mistake immediately and expect accuracy.',
  'Playful & humorous': 'You are playful and funny. Make jokes, use humor, keep the mood light.',
  'Socratic (asks questions back)': 'You use the Socratic method — ask guiding questions instead of giving answers directly.',
}

export async function POST(req: NextRequest) {
  const { robotName, personality, level, studentName } = await req.json()

  const levelCode = level.split(' — ')[0]
  const instructions = `You are ${robotName}, an AI German language tutor. ${personalityMap[personality] ?? personalityMap['Friendly & encouraging']}

The student is ${studentName}, at ${levelMap[levelCode] ?? 'intermediate'} level. Always respond primarily in German, but may briefly clarify in English when absolutely needed. Keep responses concise — 2 to 4 sentences. Correct mistakes naturally by modelling the correct form in your reply without lecturing. Ask a follow-up question to keep the conversation going. Begin by greeting ${studentName} warmly and inviting them to speak German.`

  const res = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: 'onyx',
      instructions,
      modalities: ['text', 'audio'],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text }, { status: res.status })
  }

  const session = await res.json()
  return NextResponse.json({ token: session.client_secret.value })
}
