'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'

export default function DashboardPage() {
  const { user, profile, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?returnUrl=/dashboard')
    }
  }, [loading, isAuthenticated, router])

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-3)' }}>Loading…</div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const navItems = [
    { href: '/assessment', label: 'Assessment', icon: '📋' },
    { href: '/results', label: 'My Results', icon: '📊' },
    { href: '/teams', label: 'My Teams', icon: '👥' },
    { href: '/pulse', label: 'Weekly Pulse', icon: '📡' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sage)' }}>
      {/* Top nav */}
      <div style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: 'white', textDecoration: 'none', letterSpacing: '-0.4px', marginRight: 20 }}>changegenius™</Link>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
              {item.icon} {item.label}
            </Link>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>{user?.email}</span>
            <button onClick={handleSignOut} style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', background: 'none', border: '1px solid rgba(255,255,255,.15)', padding: '6px 14px', borderRadius: '100px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>Sign out</button>
          </div>
        </div>
      </div>

      <div className="page">

        {/* Welcome header */}
        <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius)', padding: '44px 52px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(26,107,250,.12)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.36)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Dashboard</div>
            <h1 style={{ fontSize: 34, fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-0.8px', marginBottom: 8 }}>
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.65 }}>
              {profile?.change_genius_role
                ? `Your Change Genius™ role: ${profile.change_genius_role}. Continue building your team or review your results.`
                : 'Start by taking the assessment to discover your Change Genius™ role and ADAPTS stage profile.'}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            { href: '/assessment', icon: '📋', title: profile?.onboarded ? 'Retake Assessment' : 'Take Assessment', desc: 'Discover your Change Genius™ role', bg: 'var(--blue-light)', color: 'var(--blue)' },
            { href: '/results', icon: '📊', title: 'My Results', desc: 'View your ADAPTS stage profile', bg: 'var(--blue-tint)', color: 'var(--navy)' },
            { href: '/teams', icon: '👥', title: 'My Teams', desc: 'Build your Team Change Map™', bg: '#f0f9ff', color: '#0369a1' },
            { href: '/pulse', icon: '📡', title: 'Weekly Pulse', desc: 'Submit this week\'s check-in', bg: '#f0fdf4', color: '#16a34a' },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ background: item.bg, borderRadius: 12, padding: '24px 20px', border: `1px solid ${item.color}22`, textDecoration: 'none', display: 'block', transition: 'transform .15s, box-shadow .15s' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>{item.desc}</div>
            </Link>
          ))}
        </div>

        {/* Assessment CTA if not onboarded */}
        {!profile?.onboarded && (
          <div style={{ background: 'var(--blue)', borderRadius: 'var(--radius)', padding: '28px 44px', display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontSize: 34, flexShrink: 0 }}>🎯</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>Start your assessment to unlock all features</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)' }}>60 questions · 8–10 minutes · Instant results</div>
            </div>
            <Link href="/assessment" style={{ background: 'white', color: 'var(--blue)', fontSize: 14, fontWeight: 700, padding: '12px 24px', borderRadius: '100px', textDecoration: 'none', flexShrink: 0 }}>Take Assessment →</Link>
          </div>
        )}

        {/* Profile info */}
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 }}>Account</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[
              { label: 'Name', value: profile?.full_name || '—' },
              { label: 'Email', value: user?.email || '—' },
              { label: 'Change Genius™ Role', value: profile?.change_genius_role || 'Not yet assessed' },
              { label: 'Member since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-4)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 15, color: 'var(--text-1)', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
