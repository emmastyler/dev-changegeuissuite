/**
 * Payment provider routing
 * Africa → Paystack  |  Rest of world → Stripe
 */

// African country codes (ISO 3166-1 alpha-2)
export const AFRICAN_COUNTRIES = new Set([
  'DZ','AO','BJ','BW','BF','BI','CV','CM','CF','TD','KM','CG','CD','CI','DJ',
  'EG','GQ','ER','SZ','ET','GA','GM','GH','GN','GW','KE','LS','LR','LY','MG',
  'MW','ML','MR','MU','MA','MZ','NA','NE','NG','RW','ST','SN','SL','SO','ZA',
  'SS','SD','TZ','TG','TN','UG','ZM','ZW',
])

export type PaymentProvider = 'stripe' | 'paystack'
export type PlanType = 'individual' | 'team'

export interface PriceConfig {
  provider: PaymentProvider
  currency: string
  amount: number          // in smallest unit (cents / kobo)
  displayAmount: string   // human-readable
  displayCurrency: string
}

export function getProviderForCountry(countryCode: string | null): PaymentProvider {
  if (!countryCode) return 'stripe'
  return AFRICAN_COUNTRIES.has(countryCode.toUpperCase()) ? 'paystack' : 'stripe'
}

export function getPriceConfig(provider: PaymentProvider, plan: PlanType, teamSize = 1): PriceConfig {
  const baseUSD = plan === 'individual' ? 24 : 24 // $24 per person
  const baseNGN = plan === 'individual' ? 39000 : 39000 // ₦39,000 per person

  if (provider === 'paystack') {
    const amount = baseNGN * (plan === 'team' ? teamSize : 1)
    return {
      provider,
      currency: 'NGN',
      amount: amount * 100, // Paystack uses kobo
      displayAmount: amount.toLocaleString('en-NG'),
      displayCurrency: '₦',
    }
  }

  const amount = baseUSD * (plan === 'team' ? teamSize : 1)
  return {
    provider,
    currency: 'USD',
    amount: amount * 100, // Stripe uses cents
    displayAmount: amount.toFixed(2),
    displayCurrency: '$',
  }
}

// Detect country from IP using a free geo service
export async function detectCountryFromIP(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    const data = await res.json() as { country_code?: string }
    return data.country_code ?? null
  } catch {
    return null
  }
}

// Server-side: detect country from request headers
export function getCountryFromHeaders(headers: Headers): string | null {
  // Vercel, Cloudflare, and most CDNs inject this header
  return (
    headers.get('x-vercel-ip-country') ??
    headers.get('cf-ipcountry') ??
    headers.get('x-country-code') ??
    null
  )
}
