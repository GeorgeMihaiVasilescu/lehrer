import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import VoiceSession from './VoiceSession'

interface Props {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ name?: string }>
}

export default async function StudentSessionPage({ params, searchParams }: Props) {
  const { classId } = await params
  const { name } = await searchParams

  if (!name) notFound()

  const supabase = await createServerSupabaseClient()
  const { data: cls } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single()

  if (!cls) notFound()

  return <VoiceSession cls={cls} studentName={name} />
}
