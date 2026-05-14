import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  let { data: professor } = await supabase
    .from('professors')
    .select('*')
    .eq('id', user.id)
    .single()

  // User exists in auth but not in professors table — create the record now
  if (!professor) {
    const name = user.user_metadata?.name ?? user.email ?? 'Lehrkraft'
    await supabase.from('professors').insert({ id: user.id, email: user.email!, name })
    const { data } = await supabase.from('professors').select('*').eq('id', user.id).single()
    professor = data
  }

  const { data: classes } = await supabase
    .from('classes')
    .select('*, conversations(*)')
    .eq('professor_id', user.id)
    .order('created_at', { ascending: false })

  return <DashboardClient professor={professor!} initialClasses={classes ?? []} />
}
