import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

const schema = z.object({
  teamId: z.string().uuid(),
  emails: z.array(z.string().email()).min(1).max(20),
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

  const { teamId, emails } = parsed.data

  // Verify requester is team owner
  const { data: team } = await supabase
    .from('teams')
    .select('id, name, invite_code, owner_id')
    .eq('id', teamId)
    .eq('owner_id', session.user.id)
    .single()

  if (!team) return NextResponse.json({ error: 'Team not found or not owner' }, { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const results: { email: string; status: 'sent' | 'already_member' | 'error' }[] = []

  for (const email of emails) {
    // Check if already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', (await supabase.from('profiles').select('id').eq('email', email).single()).data?.id ?? '')
      .single()

    if (existingMember) {
      results.push({ email, status: 'already_member' })
      continue
    }

    // Create invite record
    const { data: invite, error } = await supabase
      .from('invites')
      .insert({
        team_id:         teamId,
        inviter_user_id: session.user.id,
        email,
      })
      .select('token')
      .single()

    if (error || !invite) {
      results.push({ email, status: 'error' })
      continue
    }

    // In production: send email via Resend/SendGrid here
    // For now: log the invite link (replace with email service)
    const inviteLink = `${appUrl}/teams/join?token=${invite.token}`
    console.log(`[teams/invite] Invite for ${email}: ${inviteLink}`)
    // TODO: await sendInviteEmail({ to: email, fromName: session.user.email, teamName: team.name, inviteLink })

    results.push({ email, status: 'sent' })
  }

  return NextResponse.json({
    inviteCode: team.invite_code,
    inviteLink: `${appUrl}/teams/join?code=${team.invite_code}`,
    results,
  })
}
