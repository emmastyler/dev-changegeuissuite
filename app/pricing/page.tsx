import Link from 'next/link'

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
]

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sage)' }}>
      <div style={{ background: 'var(--navy)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: 'white', textDecoration: 'none', letterSpacing: '-0.4px' }}>changegenius™</Link>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Log in</Link>
            <Link href="/signup" style={{ fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--blue)', padding: '7px 18px', borderRadius: '100px', textDecoration: 'none' }}>Get started</Link>
          </div>
        </div>
      </div>

      <div className="page">

        {/* Hero */}
        <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius)', padding: '64px 52px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(26,107,250,.12)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 14 }}>
              Pricing
            </div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'white', letterSpacing: '-1.2px', marginBottom: 14 }}>
              Simple pricing. One payment.
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,.55)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto' }}>
              $24 per person. Individual or team. No subscription. No complexity.
              Lifetime access to your results.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Individual */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ background: 'var(--navy-mid)', padding: '32px 36px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Individual</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1, marginBottom: 4 }}>$24</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginBottom: 20 }}>One-time · Lifetime access</div>
              <Link href="/payment?plan=individual"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: 'var(--navy)', fontSize: 14, fontWeight: 700, padding: '11px 24px', borderRadius: '100px', textDecoration: 'none' }}>
                Get Started →
              </Link>
            </div>
            <div style={{ padding: '24px 36px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>What&apos;s included</div>
              <ul style={{ listStyle: 'none' }}>
                {INDIVIDUAL_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '6px 0', borderBottom: '1px solid var(--off)' }}>
                    <span style={{ color: 'var(--blue)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Team */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '2px solid var(--blue)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(26,107,250,.12)' }}>
            <div style={{ background: 'var(--navy)', padding: '32px 36px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--blue)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: '100px', letterSpacing: '.06em' }}>
                MOST POPULAR
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Team</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1, marginBottom: 4 }}>
                $24<span style={{ fontSize: 20, fontWeight: 400 }}>/person</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', marginBottom: 20 }}>Minimum 3 members · One-time</div>
              <Link href="/payment?plan=team"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--blue)', color: 'white', fontSize: 14, fontWeight: 700, padding: '11px 24px', borderRadius: '100px', textDecoration: 'none' }}>
                Start a Team →
              </Link>
            </div>
            <div style={{ padding: '24px 36px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>What&apos;s included</div>
              <ul style={{ listStyle: 'none' }}>
                {TEAM_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '6px 0', borderBottom: '1px solid var(--off)' }}>
                    <span style={{ color: 'var(--blue)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Payment providers note */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>We accept payments via:</div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#635BFF' }} />
              <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>Stripe</span>
              <span style={{ fontSize: 12, color: 'var(--text-4)' }}>— Cards, USD (International)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C3F7' }} />
              <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>Paystack</span>
              <span style={{ fontSize: 12, color: 'var(--text-4)' }}>— Cards, Naira (Africa)</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-4)' }}>
            🔒 Secure · Encrypted · Instant access
          </div>
        </div>

        {/* FAQ */}
        <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '36px 40px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', marginBottom: 24 }}>Common questions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 40px' }}>
            {[
              ['Is this really a one-time payment?', 'Yes. Pay once, access your results forever. No subscriptions, no renewals.'],
              ['What currency do I pay in?', 'African users pay in Naira via Paystack. International users pay in USD via Stripe. We detect your location automatically but you can switch.'],
              ['Can I retake the assessment?', 'Your results are generated once per purchase. Contact support if you need a retake.'],
              ['When do team reports unlock?', 'Basic team view at 3 members. Full team diagnostic report at 5 completed members.'],
              ['What if my payment fails?', 'No charge is made for failed payments. Contact support@changegeniussuite.com if you have issues.'],
              ['Do you offer refunds?', 'Yes — within 14 days if you have not yet downloaded or shared your report.'],
            ].map(([q, a]) => (
              <div key={q as string} style={{ padding: '14px 0', borderBottom: '1px solid var(--off)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 5 }}>{q}</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
