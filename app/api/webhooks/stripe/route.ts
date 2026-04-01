import { NextRequest, NextResponse } from 'next/server'
import { constructStripeEvent } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// Use service role client — bypasses RLS so we can update any profile
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    const rawBody = await req.text()
    event = await constructStripeEvent(rawBody, sig)
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, plan, teamId } = session.metadata ?? {}

    if (!userId) {
      console.error('[stripe-webhook] Missing userId in metadata')
      return NextResponse.json({ received: true }) // still return 200
    }

    try {
      const supabase = getServiceClient()

      // Record payment
      await supabase.from('payments').upsert({
        user_id:             userId,
        provider:            'stripe',
        provider_reference:  session.payment_intent as string ?? session.id,
        provider_session_id: session.id,
        plan:                plan ?? 'individual',
        team_id:             teamId || null,
        amount_minor:        session.amount_total ?? 0,
        currency:            (session.currency ?? 'usd').toUpperCase(),
        status:              'completed',
        paid_at:             new Date().toISOString(),
      }, { onConflict: 'provider_reference' })

      // Unlock assessment — this now works because service role bypasses RLS
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_paid: true })
        .eq('id', userId)

      if (updateError) {
        console.error('[stripe-webhook] Failed to update has_paid:', updateError)
      } else {
        console.log(`[stripe-webhook] ✓ has_paid set for user ${userId}`)
      }
    } catch (err) {
      console.error('[stripe-webhook] DB error:', err)
    }
  }

  return NextResponse.json({ received: true })
}
