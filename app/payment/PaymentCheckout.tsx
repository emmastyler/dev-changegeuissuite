'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import {
  getProviderForCountry,
  detectCountryFromIP,
  getPriceConfig,
  type PaymentProvider,
  type PlanType,
} from '@/lib/payment'

const INDIVIDUAL_FEATURES = [
  'Full 60-question assessment',
  'Primary & secondary Change Genius™ role',
  'Complete ADAPTS stage profile',
  'Personal narrative interpretation',
  '30-day action plan',
  'Downloadable PDF report',
  'Share card generation',
  'Invite teammates',
]

const TEAM_FEATURES = [
  'Everything in Individual',
  'Team role distribution map',
  'ADAPTS stage coverage analysis',
  'Friction pattern detection',
  'Change pod recommendations',
  '90-day team rollout plan',
  'Team PDF report export',
  'Unlocks at 3 members, full report at 5',
]

export default function PaymentCheckout() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()

  const planParam = (params.get('plan') ?? 'individual') as PlanType
  const teamSizeParam = parseInt(params.get('teamSize') ?? '3', 10)

  const [plan, setPlan] = useState<PlanType>(planParam)
  const [teamSize, setTeamSize] = useState(Math.max(3, teamSizeParam))
  const [provider, setProvider] = useState<PaymentProvider>('stripe')
  const [countryCode, setCountryCode] = useState<string | null>(null)
  const [countryDetected, setCountryDetected] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?returnUrl=/payment?plan=${plan}`)
    }
  }, [loading, isAuthenticated, router, plan])

  useEffect(() => {
    detectCountryFromIP().then((code) => {
      setCountryCode(code)
      setProvider(getProviderForCountry(code))
      setCountryDetected(true)
    })
  }, [])

  const priceConfig = getPriceConfig(provider, plan, plan === 'team' ? teamSize : 1)
  const perPersonConfig = getPriceConfig(provider, 'team', 1)

  async function handlePay() {
    if (!user) return
    setError('')
    setProcessing(true)
    try {
      const res = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, teamSize: plan === 'team' ? teamSize : 1, provider, countryCode }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || data.error) {
        setError(data.error ?? 'Payment failed. Please try again.')
        setProcessing(false)
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
      setProcessing(false)
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:14, color:'var(--text-3)' }}>Loading…</div>
      </div>
    )
  }

  const isTeam = plan === 'team'
  const input: React.CSSProperties = { width:72, padding:'7px 10px', border:'1.5px solid var(--border)', borderRadius:'100px', fontSize:13, fontFamily:'Inter,sans-serif', textAlign:'center', outline:'none' }

  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)' }}>
      {/* Nav */}
      <div style={{ background:'var(--navy)' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ fontSize:16, fontWeight:800, color:'white', textDecoration:'none', letterSpacing:'-0.4px' }}>changegenius™</Link>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13, color:'rgba(255,255,255,.35)' }}>🔒</span>
            <span style={{ fontSize:13, color:'rgba(255,255,255,.45)' }}>Secure Checkout</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:980, margin:'0 auto', padding:'40px 24px 80px' }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:10 }}>
            One-time payment · No subscription
          </div>
          <h1 style={{ fontSize:'clamp(26px,4vw,40px)', fontWeight:800, color:'var(--navy)', letterSpacing:'-1px', marginBottom:8 }}>
            Get Your Change Genius™ Assessment
          </h1>
          <p style={{ fontSize:15, color:'var(--text-3)', lineHeight:1.6 }}>
            Instant access after payment. Lifetime results. Download your report any time.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20, alignItems:'start' }}>

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Plan selector */}
            <div style={{ background:'white', borderRadius:'var(--radius)', border:'1px solid var(--border)', overflow:'hidden' }}>
              <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:14 }}>
                  Choose your plan
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {(['individual','team'] as PlanType[]).map((p) => (
                    <button key={p} onClick={() => setPlan(p)} style={{
                      padding:'14px 18px', border:`2px solid ${plan===p?'var(--blue)':'var(--border)'}`,
                      borderRadius:10, background:plan===p?'var(--blue-light)':'white',
                      cursor:'pointer', textAlign:'left', transition:'all .15s', fontFamily:'Inter,sans-serif',
                    }}>
                      <div style={{ fontSize:14, fontWeight:700, color:plan===p?'var(--blue)':'var(--text-1)', marginBottom:3 }}>
                        {p === 'individual' ? 'Individual' : 'Team'}
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-3)' }}>
                        {p === 'individual'
                          ? `${getPriceConfig(provider,'individual').displayCurrency}${getPriceConfig(provider,'individual').displayAmount} one-time`
                          : `${perPersonConfig.displayCurrency}${perPersonConfig.displayAmount} per person`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Team size */}
              {isTeam && (
                <div style={{ padding:'14px 24px', borderBottom:'1px solid var(--border)', background:'var(--off)' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text-2)', marginBottom:10 }}>How many team members?</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                    {[3,5,8,10,15,20].map((n) => (
                      <button key={n} onClick={() => setTeamSize(n)} style={{
                        padding:'6px 14px', borderRadius:'100px',
                        border:`1.5px solid ${teamSize===n?'var(--blue)':'var(--border)'}`,
                        background:teamSize===n?'var(--blue)':'white',
                        color:teamSize===n?'white':'var(--text-2)',
                        fontSize:13, fontWeight:600, cursor:'pointer',
                        fontFamily:'Inter,sans-serif', transition:'all .15s',
                      }}>{n}</button>
                    ))}
                    <input type="number" min={3} max={500} value={teamSize}
                      onChange={(e) => setTeamSize(Math.max(3, parseInt(e.target.value)||3))}
                      style={input} placeholder="Custom" />
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-4)', marginTop:8 }}>Minimum 3 members</div>
                </div>
              )}

              {/* Features */}
              <div style={{ padding:'16px 24px' }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:12 }}>
                  What&apos;s included
                </div>
                <ul style={{ listStyle:'none' }}>
                  {(isTeam ? TEAM_FEATURES : INDIVIDUAL_FEATURES).map((f) => (
                    <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'5px 0', borderBottom:'1px solid var(--off)' }}>
                      <span style={{ color:'var(--blue)', fontSize:14, fontWeight:700, flexShrink:0 }}>✓</span>
                      <span style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.5 }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Provider selector */}
            <div style={{ background:'white', borderRadius:'var(--radius)', border:'1px solid var(--border)', padding:'20px 24px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
                Payment method
                {countryDetected && countryCode && (
                  <span style={{ fontSize:11, fontWeight:400, color:'var(--text-4)', textTransform:'none', letterSpacing:0 }}>
                    · Detected: {countryCode}
                  </span>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {/* Stripe */}
                <button onClick={() => setProvider('stripe')} style={{
                  padding:'14px 16px', border:`2px solid ${provider==='stripe'?'var(--blue)':'var(--border)'}`,
                  borderRadius:10, background:provider==='stripe'?'var(--blue-light)':'white',
                  cursor:'pointer', textAlign:'left', transition:'all .15s', fontFamily:'Inter,sans-serif',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <svg width="28" height="12" viewBox="0 0 60 25" fill="none">
                      <path d="M27.5 6.8c0-1.8 1.5-2.5 3.8-2.5 3.4 0 7.7 1 11.1 2.8V1.1C39.1.4 35.8 0 32.5 0 24.8 0 19.7 4 19.7 10.2c0 9.9 13.7 8.3 13.7 12.6 0 2.1-1.8 2.8-4.3 2.8-3.7 0-8.5-1.5-12.3-3.6v6.1c4.2 1.8 8.4 2.5 12.3 2.5 7.9 0 13.3-3.9 13.3-10.2 0-10.7-13.9-8.8-13.9-13.6z" fill="#635BFF"/>
                    </svg>
                    <span style={{ fontSize:13, fontWeight:700, color:provider==='stripe'?'var(--blue)':'var(--text-1)' }}>Stripe</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>Cards · USD · International</div>
                </button>
                {/* Paystack */}
                <button onClick={() => setProvider('paystack')} style={{
                  padding:'14px 16px', border:`2px solid ${provider==='paystack'?'var(--blue)':'var(--border)'}`,
                  borderRadius:10, background:provider==='paystack'?'var(--blue-light)':'white',
                  cursor:'pointer', textAlign:'left', transition:'all .15s', fontFamily:'Inter,sans-serif',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="20" fill="#00C3F7"/>
                      <path d="M12 20h16M20 12v16" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize:13, fontWeight:700, color:provider==='paystack'?'var(--blue)':'var(--text-1)' }}>Paystack</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>Cards · NGN · Africa</div>
                </button>
              </div>

              {provider === 'paystack' && (
                <div style={{ marginTop:10, padding:'8px 12px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:7, fontSize:12, color:'#166534' }}>
                  ✓ Recommended for African users — pay in Naira with local cards
                </div>
              )}
              {provider === 'stripe' && (
                <div style={{ marginTop:10, padding:'8px 12px', background:'var(--blue-tint)', border:'1px solid #c7d2fe', borderRadius:7, fontSize:12, color:'var(--navy)' }}>
                  ✓ Recommended for international users — pay in USD with any card
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — order summary */}
          <div style={{ position:'sticky', top:80 }}>
            <div style={{ background:'var(--navy)', borderRadius:'var(--radius)', padding:'28px 28px 24px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:18 }}>
                Order Summary
              </div>

              <div style={{ background:'rgba(255,255,255,.06)', borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'white', marginBottom:4 }}>
                  Change Genius™ {isTeam ? 'Team' : 'Individual'} Assessment
                </div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.45)' }}>
                  {isTeam
                    ? `${teamSize} members × ${perPersonConfig.displayCurrency}${perPersonConfig.displayAmount}`
                    : 'Individual — one-time access'}
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
                <span style={{ fontSize:14, color:'rgba(255,255,255,.55)' }}>Total</span>
                <span style={{ fontSize:34, fontWeight:900, color:'white', letterSpacing:'-1px' }}>
                  {priceConfig.displayCurrency}{priceConfig.displayAmount}
                </span>
              </div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.3)', marginBottom:24 }}>
                {priceConfig.currency} · One-time payment · No subscription
              </div>

              {error && (
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:14 }}>
                  {error}
                </div>
              )}

              <button onClick={handlePay} disabled={processing} style={{
                width:'100%', padding:'14px',
                background: processing ? 'rgba(26,107,250,.5)' : 'var(--blue)',
                color:'white', border:'none', borderRadius:'100px',
                fontSize:15, fontWeight:700,
                cursor: processing ? 'not-allowed' : 'pointer',
                fontFamily:'Inter,sans-serif', transition:'background .15s',
                marginBottom:14,
              }}>
                {processing
                  ? 'Redirecting to payment…'
                  : `Pay ${priceConfig.displayCurrency}${priceConfig.displayAmount} with ${provider==='stripe'?'Stripe':'Paystack'}`}
              </button>

              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  '🔒 Encrypted end-to-end',
                  '⚡ Instant access after payment',
                  '📄 Lifetime access to your results',
                  '↩️ 14-day refund policy',
                ].map((t) => (
                  <div key={t} style={{ fontSize:12, color:'rgba(255,255,255,.38)' }}>{t}</div>
                ))}
              </div>
            </div>

            <div style={{ marginTop:12, padding:'10px 14px', background:'white', borderRadius:10, border:'1px solid var(--border)' }}>
              <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:2 }}>Paying as</div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)' }}>{user?.email}</div>
            </div>

            <p style={{ fontSize:11, color:'var(--text-4)', textAlign:'center', marginTop:12, lineHeight:1.5 }}>
              By completing your purchase you agree to our{' '}
              <Link href="/terms" style={{ color:'var(--blue)' }}>Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
