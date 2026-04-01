import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getStripe } from '@/lib/stripe'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
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

    const { sessionId } = await req.json() as { sessionId?: string }
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

    // Verify with Stripe directly — no webhook needed
    const stripe = getStripe()
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ paid: false })
    }

    // Confirm session belongs to this user
    const metaUserId = checkoutSession.metadata?.userId
    if (metaUserId && metaUserId !== session.user.id) {
      return NextResponse.json({ error: 'Session mismatch' }, { status: 403 })
    }

    // Service role bypasses RLS
    const admin = getServiceClient()

    await admin.from('payments').upsert({
      user_id:             session.user.id,
      provider:            'stripe',
      provider_reference:  (checkoutSession.payment_intent as string) ?? checkoutSession.id,
      provider_session_id: checkoutSession.id,
      plan:                checkoutSession.metadata?.plan ?? 'individual',
      team_id:             checkoutSession.metadata?.teamId || null,
      amount_minor:        checkoutSession.amount_total ?? 0,
      currency:            (checkoutSession.currency ?? 'usd').toUpperCase(),
      status:              'completed',
      paid_at:             new Date().toISOString(),
    }, { onConflict: 'provider_reference' })

    await admin.from('profiles').update({ has_paid: true }).eq('id', session.user.id)

    console.log(`[payment/confirm] ✓ has_paid set for user ${session.user.id}`)
    return NextResponse.json({ confirmed: true, paid: true })
  } catch (err) {
    console.error('[payment/confirm]', err)
    return NextResponse.json({ error: 'Confirmation failed' }, { status: 500 })
  }
}
