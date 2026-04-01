import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const schema = z.object({
  teamId:         z.string().uuid(),
  weekNumber:     z.number().int().min(1),
  dialogueScore:  z.number().int().min(1).max(5),
  alignmentScore: z.number().int().min(1).max(5),
  executionScore: z.number().int().min(1).max(5),
})

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

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { teamId, weekNumber, dialogueScore, alignmentScore, executionScore } = parsed.data

  // Verify membership
  const { data: member } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('user_id', session.user.id)
    .single()

  if (!member) return NextResponse.json({ error: 'Not a team member' }, { status: 403 })

  // Upsert pulse entry
  const { error } = await supabase.from('pulse_entries').upsert({
    team_id:         teamId,
    user_id:         session.user.id,
    week_number:     weekNumber,
    dialogue_score:  dialogueScore,
    alignment_score: alignmentScore,
    execution_score: executionScore,
  }, { onConflict: 'team_id,user_id,week_number' })

  if (error) {
    console.error('[pulse]', error)
    return NextResponse.json({ error: 'Failed to save pulse' }, { status: 500 })
  }

  // Compute momentum score (average of 3 dimensions, scaled to 0-100)
  const momentum = Math.round(((dialogueScore + alignmentScore + executionScore) / 15) * 100)

  return NextResponse.json({ saved: true, weekNumber, momentum })
}

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

  const { data: entries } = await supabase
    .from('pulse_entries')
    .select('week_number, dialogue_score, alignment_score, execution_score, user_id')
    .eq('team_id', teamId)
    .order('week_number', { ascending: true })

  // Group by week — compute team averages
  const byWeek: Record<number, { d: number[]; a: number[]; e: number[] }> = {}
  for (const entry of entries ?? []) {
    if (!byWeek[entry.week_number]) byWeek[entry.week_number] = { d: [], a: [], e: [] }
    byWeek[entry.week_number].d.push(entry.dialogue_score)
    byWeek[entry.week_number].a.push(entry.alignment_score)
    byWeek[entry.week_number].e.push(entry.execution_score)
  }

  const weeks = Object.entries(byWeek).map(([wk, scores]) => {
    const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length
    const d = avg(scores.d)
    const a = avg(scores.a)
    const e = avg(scores.e)
    const momentum = Math.round(((d + a + e) / 15) * 100)
    return {
      week:      parseInt(wk),
      dialogue:  Math.round(d * 20),   // scale 1-5 → 20-100
      alignment: Math.round(a * 20),
      execution: Math.round(e * 20),
      momentum,
      respondents: scores.d.length,
    }
  })

  return NextResponse.json({ teamId, weeks })
}
