import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const levelDescriptions: Record<string, string> = {
  A1: 'absolute beginners who know only the most basic words and phrases',
  A2: 'elementary learners who understand simple sentences and common vocabulary',
  B1: 'intermediate learners who can handle everyday topics and straightforward texts',
  B2: 'upper-intermediate learners who can understand complex texts and nuanced language',
  C1: 'advanced learners who can understand demanding texts and implicit meaning',
}

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'no image' }, { status: 400 })

  const levelRaw = (form.get('level') as string | null) ?? ''
  const levelCode = levelRaw.split(' — ')[0].trim()
  const levelDesc = levelDescriptions[levelCode] ?? 'intermediate learners'

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = file.type || 'image/jpeg'

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    messages: [
      {
        role: 'system',
        content:
          `You are analyzing a page from a German language textbook designed for ${levelDesc} (${levelCode} level). ` +
          `Extract ALL content from this page: every word, sentence, dialogue, character name, and exercise instruction. ` +
          `Also describe every image or illustrated situation shown. Be extremely detailed and thorough. ` +
          `Then add a section called LEVEL NOTES where you: ` +
          `(1) list vocabulary and structures on this page that are especially important or challenging for ${levelCode} students, ` +
          `(2) flag anything that is above ${levelCode} level so the tutor knows to handle it carefully, ` +
          `(3) suggest 2-3 conversation angles Klaus (the AI tutor) can use with a ${levelCode} student based on this material.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
        ],
      },
    ],
  })

  const text = response.choices[0].message.content ?? ''
  return NextResponse.json({ text })
}
