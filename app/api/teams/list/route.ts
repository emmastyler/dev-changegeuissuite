import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) => s.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = session.user.id

  // Teams owned by user
  const { data: owned } = await supabase
    .from('teams')
    .select(`
      id, name, organization, invite_code, created_at,
      team_members(id, status, user_id, profiles(full_name, email, change_genius_role, onboarded))
    `)
    .eq('owner_id', uid)
    .order('created_at', { ascending: false })

  // Teams user is a member of (not owner)
  const { data: memberOf } = await supabase
    .from('team_members')
    .select(`
      status,
      teams(id, name, organization, invite_code, created_at,
        team_members(id, status, user_id)
      )
    `)
    .eq('user_id', uid)
    .neq('teams.owner_id', uid)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Enrich owned teams with unlock status
  const enriched = (owned ?? []).map(team => {
    const members = (team.team_members as any[]) ?? []
    const completed = members.filter(m => m.status === 'completed').length
    const total     = members.length
    return {
      ...team,
      isOwner:        true,
      memberCount:    total,
      completedCount: completed,
      inviteLink:     `${appUrl}/teams/join?code=${team.invite_code}`,
      unlocked:       completed >= 3,    // basic unlock
      fullUnlock:     completed >= 5,    // full team report
    }
  })

  return NextResponse.json({
    owned:    enriched,
    memberOf: (memberOf ?? []).map((m: any) => m.teams).filter(Boolean),
  })
}
