import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const schema = z.object({
  assessmentId:  z.string().uuid(),
  questionId:    z.string().min(1),
  value:         z.number().int().min(1).max(5),
  questionIndex: z.number().int().min(0).max(59),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { assessmentId, questionId, value, questionIndex } = parsed.data

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

  // Verify this assessment belongs to the user
  const { data: assessment } = await supabase
    .from('assessments')
    .select('id, user_id, status')
    .eq('id', assessmentId)
    .eq('user_id', session.user.id)
    .single()

  if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
  if (assessment.status !== 'in_progress') {
    return NextResponse.json({ error: 'Assessment already completed' }, { status: 409 })
  }

  // Upsert the response — safe to call multiple times (handles back/forward navigation)
  const { error: responseError } = await supabase
    .from('responses')
    .upsert(
      { assessment_id: assessmentId, question_id: questionId, value, answered_at: new Date().toISOString() },
      { onConflict: 'assessment_id,question_id' }
    )

  if (responseError) {
    console.error('[assessment/answer]', responseError)
    return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 })
  }

  // Update progress tracker
  await supabase
    .from('assessments')
    .update({ last_question_index: Math.max(questionIndex, 0) })
    .eq('id', assessmentId)

  return NextResponse.json({ saved: true, questionIndex })
}
