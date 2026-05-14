import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function buildSystemPrompt(robotName: string, personality: string, level: string) {
  const levelMap: Record<string, string> = {
    A1: 'absolute beginner — use only the simplest words and very short sentences',
    A2: 'elementary — use simple, common vocabulary and basic grammar',
    B1: 'intermediate — use clear, everyday German with moderate complexity',
    B2: 'upper intermediate — use richer vocabulary and more complex structures',
    C1: 'advanced — use natural, fluent German at near-native level',
  }
  const levelCode = level.split(' — ')[0]
  const levelDesc = levelMap[levelCode] || 'intermediate'

  const personalityMap: Record<string, string> = {
    'Friendly & encouraging': 'You are warm, encouraging, and celebrate every small success.',
    'Strict & precise': 'You are strict and precise. Correct every mistake immediately and expect accuracy.',
    'Playful & humorous': 'You are playful and funny. Make jokes, use humor, keep the mood light.',
    'Socratic (asks questions back)': 'You use the Socratic method — ask guiding questions instead of giving answers directly.',
  }
  const personalityDesc = personalityMap[personality] || personalityMap['Friendly & encouraging']

  return `You are ${robotName}, an AI German language tutor. ${personalityDesc}

The student is at ${levelDesc} level. Always respond primarily in German, but you may briefly clarify in English when absolutely needed. Keep responses concise (2-4 sentences).

After each student message, evaluate their German:
1. Acknowledge what they said
2. Gently correct any mistakes (show the correct form)
3. Continue the conversation naturally

Return a JSON object with these fields:
{
  "reply": "your response in German (and minimal English if needed)",
  "accuracy": <integer 0-100 representing how accurate their German was>,
  "mistakes": <integer count of grammar/vocabulary mistakes found>,
  "errors": [{"said": "<exact incorrect word or phrase the student used>", "correct": "<the correct German form>"}]
}

If there are no mistakes, set "errors" to [].
If this is a system/greeting message with no German to evaluate, set accuracy to 100, mistakes to 0, and errors to [].`
}

export async function POST(req: NextRequest) {
  const { robotName, personality, level, messages, isSystem } = await req.json()

  const systemPrompt = buildSystemPrompt(robotName, personality, level)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 400,
  })

  const raw = completion.choices[0].message.content ?? '{}'
  let parsed: { reply: string; accuracy: number; mistakes: number; errors: { said: string; correct: string }[] }

  try {
    parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.errors)) parsed.errors = []
  } catch {
    parsed = { reply: raw, accuracy: 100, mistakes: 0, errors: [] }
  }

  return NextResponse.json(parsed)
}
