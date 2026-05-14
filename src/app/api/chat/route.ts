import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function buildSystemPrompt(robotName: string, personality: string, level: string, lessonContext?: string) {
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

  return `You are ${robotName}, a friendly German conversation partner — not a teacher or examiner. ${personalityDesc}

You are chatting with a ${levelDesc} speaker. Your job is to keep the conversation flowing naturally in German while gently helping them improve.

HOW TO TALK:
- Respond like a real person having a conversation, not like a language test
- Keep replies short: 1-3 sentences maximum
- Ask AT MOST one question per reply — never stack multiple questions
- Never ask about family, relationships, or personal life unless the student brings it up first
- If lesson material is provided, steer the conversation toward those topics and vocabulary naturally
- When the student says something wrong, weave the correction casually into your reply — mirror it back correctly without making it a lesson moment. Use natural phrases like "Ah, du meinst...", "Genau, also...", or just repeat their idea in correct German and continue
- Never say "Das ist falsch" or "Du hast einen Fehler gemacht" — corrections should feel invisible
- If the student is stuck or silent, offer a simple prompt based on the lesson material or current topic

LANGUAGE:
- Always reply in German
- Match the complexity to the student's level: ${levelDesc}
- For A1/A2: very simple sentences, common words only, slow and clear
- For B1/B2: natural conversational German, some idioms are fine
- For C1: speak freely and naturally, full complexity

After processing the student's message, return a JSON object:
{
  "reply": "your conversational response in German",
  "accuracy": <integer 0-100, how grammatically and lexically correct their German was>,
  "mistakes": <integer, number of distinct errors>,
  "errors": [{"said": "<what the student said incorrectly>", "correct": "<the natural correct form>"}]
}

If there are no mistakes, set "errors" to [].
If this is the opening system message with no student input, set accuracy to 100, mistakes to 0, errors to [].${lessonContext ? `\n\nTODAY'S LESSON MATERIAL — use this to guide the conversation:\n${lessonContext}` : ''}`
}

export async function POST(req: NextRequest) {
  const { robotName, personality, level, messages, isSystem, lessonContext } = await req.json()

  console.log('[chat] lessonContext received:', lessonContext ? `"${String(lessonContext).slice(0, 80)}..." (${String(lessonContext).length} chars)` : 'NONE')
  const systemPrompt = buildSystemPrompt(robotName, personality, level, lessonContext || undefined)
  console.log('[chat] system prompt length:', systemPrompt.length, 'chars — includes lesson:', systemPrompt.includes('LESSON MATERIAL'))

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
