import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { buildTeamReportHTML, generatePDF } from '@/lib/pdf/generator'
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

  // Verify owner
  const { data: team } = await supabase
    .from('teams')
    .select('id, name, owner_id')
    .eq('id', teamId)
    .eq('owner_id', session.user.id)
    .single()

  if (!team) return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 })

  // Get completed members + scores
  const { data: members } = await supabase
    .from('team_members')
    .select('user_id, status, profiles(full_name, email, change_genius_role, change_genius_role_2)')
    .eq('team_id', teamId)
    .eq('status', 'completed')

  if (!members || members.length < 5) {
    return NextResponse.json({ error: 'Full report requires 5 completed members' }, { status: 403 })
  }

  const memberScores: MemberScore[] = []
  const memberNames: string[] = []

  for (const m of members) {
    const p = m.profiles as any
    if (!p?.change_genius_role) continue

    const { data: assessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('user_id', m.user_id)
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
      userId:        m.user_id,
      fullName:      p.full_name ?? p.email ?? 'Member',
      primaryRole:   p.change_genius_role as Role,
      secondaryRole: p.change_genius_role_2 as Role,
      stageScores:   scores.stage_scores  as Record<AdaptsStage, number>,
      energyScores:  scores.energy_scores as Record<Energy, number>,
    })
    memberNames.push(p.full_name ?? p.email ?? 'Member')
  }

  const diagnostic = computeTeamDiagnostic(memberScores)
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const html = buildTeamReportHTML({
    teamName: team.name,
    diagnostic,
    memberNames,
    date,
  })

  try {
    const pdfBuffer = await generatePDF(html)
    const slug = team.name.toLowerCase().replace(/\s+/g, '-')
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${slug}-team-report.pdf"`,
        'Cache-Control':       'private, no-cache',
      },
    })
  } catch (err) {
    console.error('[pdf/team] Chromium unavailable, returning HTML:', err)
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html', 'Content-Disposition': 'inline' },
    })
  }
}
