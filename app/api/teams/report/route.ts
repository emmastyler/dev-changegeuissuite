import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { computeTeamDiagnostic, type MemberScore } from '@/lib/assessment/team-diagnostic'
import type { Role, AdaptsStage, Energy } from '@/lib/assessment/questions'

export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get('teamId')
  if (!teamId) return NextResponse.json({ error: 'Missing teamId' }, { status: 400 })

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

  // Verify user is owner or member
  const { data: team } = await supabase
    .from('teams')
    .select('id, name, organization, invite_code, owner_id')
    .eq('id', teamId)
    .single()

  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 })

  const isOwner = team.owner_id === session.user.id
  if (!isOwner) {
    const { data: membership } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .single()
    if (!membership) return NextResponse.json({ error: 'Not a team member' }, { status: 403 })
  }

  // Get all members + their scores
  const { data: members } = await supabase
    .from('team_members')
    .select(`
      user_id, status,
      profiles(full_name, email, change_genius_role, change_genius_role_2)
    `)
    .eq('team_id', teamId)

  const completedMembers = (members ?? []).filter(m => m.status === 'completed')

  // Fetch scores for completed members
  const memberScores: MemberScore[] = []
  for (const member of completedMembers) {
    const profile = member.profiles as any
    if (!profile?.change_genius_role || !profile?.change_genius_role_2) continue

    // Get their latest assessment scores
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('user_id', member.user_id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()

    if (!assessment) continue

    const { data: scores } = await supabase
      .from('scores')
      .select('stage_scores, energy_scores')
      .eq('assessment_id', assessment.id)
      .single()

    if (!scores) continue

    memberScores.push({
      userId:       member.user_id,
      fullName:     profile.full_name ?? profile.email ?? 'Member',
      primaryRole:  profile.change_genius_role as Role,
      secondaryRole: profile.change_genius_role_2 as Role,
      stageScores:  scores.stage_scores as Record<AdaptsStage, number>,
      energyScores: scores.energy_scores as Record<Energy, number>,
    })
  }

  const totalMembers    = (members ?? []).length
  const completedCount  = completedMembers.length
  const appUrl          = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Enforce minimum threshold
  const BASIC_THRESHOLD = 3
  const FULL_THRESHOLD  = 5

  const unlocked     = completedCount >= BASIC_THRESHOLD
  const fullUnlocked = completedCount >= FULL_THRESHOLD

  // Only run diagnostic if enough members
  const diagnostic = unlocked ? computeTeamDiagnostic(memberScores) : null

  // Save/update team report if full unlock
  if (fullUnlocked && diagnostic) {
    await supabase.from('team_reports').upsert({
      team_id:      teamId,
      report_json:  diagnostic,
      member_count: totalMembers,
      risk_score:   diagnostic.riskScore,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'team_id' })
  }

  return NextResponse.json({
    team: {
      id:          team.id,
      name:        team.name,
      organization: team.organization,
      inviteCode:  team.invite_code,
      inviteLink:  `${appUrl}/teams/join?code=${team.invite_code}`,
      isOwner,
    },
    members: (members ?? []).map(m => ({
      userId:   m.user_id,
      status:   m.status,
      fullName: (m.profiles as any)?.full_name ?? (m.profiles as any)?.email ?? 'Member',
      role:     (m.profiles as any)?.change_genius_role ?? null,
    })),
    totalMembers,
    completedCount,
    unlocked,
    fullUnlocked,
    nextThreshold: !unlocked ? BASIC_THRESHOLD : !fullUnlocked ? FULL_THRESHOLD : null,
    diagnostic,
  })
}
