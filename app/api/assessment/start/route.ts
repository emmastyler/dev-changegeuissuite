import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
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

  const userId = session.user.id

  // Check payment
  const { data: profile } = await supabase.from('profiles').select('has_paid').eq('id', userId).single()
  if (!profile?.has_paid) {
    return NextResponse.json({ error: 'Payment required' }, { status: 402 })
  }

  // Check for an existing in-progress assessment — resume it
  const { data: existing } = await supabase
    .from('assessments')
    .select('id, last_question_index, status')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    // Fetch already-answered responses for this assessment
    const { data: responses } = await supabase
      .from('responses')
      .select('question_id, value')
      .eq('assessment_id', existing.id)

    const answeredMap: Record<string, number> = {}
    for (const r of responses ?? []) answeredMap[r.question_id] = r.value

    return NextResponse.json({
      assessmentId: existing.id,
      resuming: true,
      lastQuestionIndex: existing.last_question_index,
      answeredResponses: answeredMap,
    })
  }

  // Create new assessment
  const { data: newAssessment, error } = await supabase
    .from('assessments')
    .insert({ user_id: userId, version: 'v1', status: 'in_progress' })
    .select('id')
    .single()

  if (error || !newAssessment) {
    console.error('[assessment/start]', error)
    return NextResponse.json({ error: 'Could not start assessment' }, { status: 500 })
  }

  return NextResponse.json({
    assessmentId: newAssessment.id,
    resuming: false,
    lastQuestionIndex: 0,
    answeredResponses: {},
  })
}
