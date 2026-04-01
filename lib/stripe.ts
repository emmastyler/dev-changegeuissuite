import Stripe from 'stripe'

// Singleton — only instantiated server-side
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (typeof window !== 'undefined') throw new Error('Stripe server client used on client side')
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set')
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    })
  }
  return _stripe
}

export interface CreateStripeSessionParams {
  userId: string
  userEmail: string
  plan: 'individual' | 'team'
  teamSize?: number
  teamId?: string
  successUrl: string
  cancelUrl: string
}

export async function createStripeCheckoutSession(params: CreateStripeSessionParams) {
  const stripe = getStripe()
  const priceUSD = 24 // $24 per person
  const quantity = params.plan === 'team' ? (params.teamSize ?? 1) : 1

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: params.userEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: params.plan === 'individual'
              ? 'Change Genius™ Individual Assessment'
              : `Change Genius™ Team Assessment (${quantity} members)`,
            description: 'One-time payment. Lifetime access to your results.',
            images: [],
          },
          unit_amount: priceUSD * 100, // cents
        },
        quantity,
      },
    ],
    metadata: {
      userId: params.userId,
      plan: params.plan,
      teamSize: String(quantity),
      teamId: params.teamId ?? '',
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    payment_intent_data: {
      metadata: {
        userId: params.userId,
        plan: params.plan,
      },
    },
  })

  return session
}

export async function constructStripeEvent(payload: string | Buffer, sig: string) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET not set')
  return stripe.webhooks.constructEvent(payload, sig, secret)
}
