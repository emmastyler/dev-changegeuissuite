import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { calculateScores } from '@/lib/assessment/scoring'
import { TOTAL_QUESTIONS } from '@/lib/assessment/questions'
import { z } from 'zod'

const schema = z.object({ assessmentId: z.string().uuid() })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { assessmentId } = parsed.data

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

  // Verify ownership
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, user_id, status')
    .eq('id', assessmentId)
    .eq('user_id', session.user.id)
    .single()

  if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })

  // Fetch all responses
  const { data: responses } = await supabase
    .from('responses')
    .select('question_id, value')
    .eq('assessment_id', assessmentId)

  const uniqueAnswered = new Set(responses?.map(r => r.question_id)).size
  if (!responses || uniqueAnswered < TOTAL_QUESTIONS) {
    return NextResponse.json({
      error: `Incomplete — ${uniqueAnswered}/${TOTAL_QUESTIONS} questions answered`,
    }, { status: 422 })
  }

  // Build response map
  const responseMap: Record<string, number> = {}
  for (const r of responses) responseMap[r.question_id] = r.value

  // Run scoring engine
  const scores = calculateScores(responseMap)

  // Save scores
  const { error: scoresError } = await supabase
    .from('scores')
    .upsert({
      assessment_id: assessmentId,
      role_scores:   scores.role_scores,
      stage_scores:  scores.stage_scores,
      energy_scores: scores.energy_scores,
      derived:       scores.derived,
      calculated_at: new Date().toISOString(),
    }, { onConflict: 'assessment_id' })

  if (scoresError) {
    console.error('[assessment/complete] scores error:', scoresError)
    return NextResponse.json({ error: 'Failed to save scores' }, { status: 500 })
  }

  // Mark assessment complete
  await supabase
    .from('assessments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', assessmentId)

  // Update profile with derived results
  const { derived } = scores
  await supabase
    .from('profiles')
    .update({
      change_genius_role:     derived.primary_role,
      change_genius_role_2:   derived.secondary_role,
      role_pair_title:        derived.role_pair_title,
      primary_energy:         derived.primary_energy,
      top_adapts_stages:      derived.top_adapts_stages,
      bottom_adapts_stages:   derived.bottom_adapts_stages,
      onboarded:              true,
    })
    .eq('id', session.user.id)

  return NextResponse.json({ success: true, assessmentId, derived })
}
