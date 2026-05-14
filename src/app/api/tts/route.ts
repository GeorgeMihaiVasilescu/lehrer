import { NextRequest, NextResponse } from 'next/server'

function ssml(text: string) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
  return `<speak version='1.0' xml:lang='de-DE'><voice xml:lang='de-DE' xml:gender='Female' name='de-DE-KatjaNeural'>${escaped}</voice></speak>`
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const region = process.env.AZURE_SPEECH_REGION ?? 'westeurope'

  const res = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY!,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
      },
      body: ssml(text),
    },
  )

  if (!res.ok) return new NextResponse(null, { status: res.status })

  const buffer = Buffer.from(await res.arrayBuffer())
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length.toString(),
    },
  })
}
