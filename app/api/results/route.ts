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

  // Get the most recent completed assessment + scores
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, completed_at')
    .eq('user_id', session.user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  if (!assessment) return NextResponse.json({ error: 'No completed assessment found' }, { status: 404 })

  const { data: scores } = await supabase
    .from('scores')
    .select('role_scores, stage_scores, energy_scores, derived')
    .eq('assessment_id', assessment.id)
    .single()

  if (!scores) return NextResponse.json({ error: 'Scores not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, change_genius_role, change_genius_role_2, role_pair_title, primary_energy, top_adapts_stages, bottom_adapts_stages')
    .eq('id', session.user.id)
    .single()

  return NextResponse.json({
    assessmentId:    assessment.id,
    completedAt:     assessment.completed_at,
    roleScores:      scores.role_scores,
    stageScores:     scores.stage_scores,
    energyScores:    scores.energy_scores,
    derived:         scores.derived,
    profile,
  })
}
