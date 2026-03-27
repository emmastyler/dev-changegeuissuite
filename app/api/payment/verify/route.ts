import { NextRequest, NextResponse } from 'next/server'
import { verifyPaystackTransaction } from '@/lib/paystack'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
  }

  try {
    const result = await verifyPaystackTransaction(reference)

    if (!result.status || result.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment not successful', status: result.data.status }, { status: 402 })
    }

    // Record payment in DB
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    )

    const { userId, plan, teamId } = result.data.metadata

    await supabase.from('payments').upsert({
      user_id: userId,
      provider: 'paystack',
      provider_reference: reference,
      plan,
      team_id: teamId || null,
      amount_minor: result.data.amount,
      currency: result.data.currency,
      status: 'completed',
      paid_at: result.data.paid_at,
    }, { onConflict: 'provider_reference' })

    // Unlock assessment access for user
    await supabase.from('profiles').update({ has_paid: true }).eq('id', userId)

    return NextResponse.json({ success: true, plan, reference })

  } catch (err) {
    console.error('[payment/verify]', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
