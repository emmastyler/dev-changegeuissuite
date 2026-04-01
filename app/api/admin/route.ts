import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin API uses service role key — bypasses RLS
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
  return createClient(url, key, { auth: { persistSession: false } })
}

function checkAdminToken(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token')
  const adminSecret = process.env.ADMIN_SECRET_TOKEN
  if (!adminSecret) return false
  return token === adminSecret
}

export async function GET(req: NextRequest) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = req.nextUrl.searchParams.get('type') ?? 'stats'
  const supabase = getAdminClient()

  if (type === 'stats') {
    const [users, assessments, teams, payments] = await Promise.all([
      supabase.from('profiles').select('id, has_paid, onboarded, created_at', { count: 'exact' }),
      supabase.from('assessments').select('id, status', { count: 'exact' }),
      supabase.from('teams').select('id', { count: 'exact' }),
      supabase.from('payments').select('id, amount_minor, currency, provider, created_at', { count: 'exact' }),
    ])

    const paidUsers      = (users.data ?? []).filter(u => u.has_paid).length
    const completedUsers = (users.data ?? []).filter(u => u.onboarded).length
    const completedAssessments = (assessments.data ?? []).filter(a => a.status === 'completed').length

    // Revenue by currency
    const revenue: Record<string, number> = {}
    for (const p of payments.data ?? []) {
      const key = p.currency ?? 'USD'
      revenue[key] = (revenue[key] ?? 0) + (p.amount_minor ?? 0)
    }

    return NextResponse.json({
      totalUsers:       users.count ?? 0,
      paidUsers,
      completedUsers,
      totalAssessments: assessments.count ?? 0,
      completedAssessments,
      totalTeams:       teams.count ?? 0,
      totalPayments:    payments.count ?? 0,
      revenue: Object.entries(revenue).map(([currency, minor]) => ({
        currency,
        amount: currency === 'NGN' ? (minor / 100).toFixed(0) : (minor / 100).toFixed(2),
      })),
    })
  }

  if (type === 'users') {
    const page  = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
    const limit = 50
    const from  = (page - 1) * limit
    const { data, count } = await supabase
      .from('profiles')
      .select('id, email, full_name, has_paid, onboarded, change_genius_role, role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    return NextResponse.json({ users: data, total: count, page, limit })
  }

  if (type === 'teams') {
    const { data, count } = await supabase
      .from('teams')
      .select(`
        id, name, organization, invite_code, created_at,
        profiles!owner_id(email, full_name),
        team_members(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ teams: data, total: count })
  }

  if (type === 'questions') {
    // Return question bank summary for admin review
    const { ORDERED_QUESTIONS } = await import('@/lib/assessment/questions')
    return NextResponse.json({
      total: ORDERED_QUESTIONS.length,
      questions: ORDERED_QUESTIONS.map(q => ({
        id: q.id, text: q.text, role: q.role, stage: q.stage,
        energy: q.energy, reverse: q.reverse, order: q.order,
      })),
    })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}
