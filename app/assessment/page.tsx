'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function AssessmentPage() {
  const { isAuthenticated, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    // Not logged in → login first
    if (!isAuthenticated) {
      router.push('/login?returnUrl=/assessment')
      return
    }
    // Logged in but not paid → payment
    if (profile && !profile.has_paid) {
      router.push('/payment?plan=individual&from=assessment')
    }
  }, [loading, isAuthenticated, profile, router])

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:14, color:'var(--text-3)' }}>Loading…</div>
      </div>
    )
  }

  // Still resolving profile
  if (!isAuthenticated || !profile) return null

  // Block render until paid (redirect fires above, this is a safety net)
  if (!profile.has_paid) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ background:'white', borderRadius:'var(--radius)', padding:'52px 48px', maxWidth:480, textAlign:'center', boxShadow:'0 4px 24px rgba(10,37,64,.08)' }}>
          <div style={{ fontSize:44, marginBottom:16 }}>🔒</div>
          <h2 style={{ fontSize:24, fontWeight:800, color:'var(--navy)', marginBottom:10 }}>Assessment locked</h2>
          <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.65, marginBottom:28 }}>
            A one-time payment of $24 unlocks your assessment and gives you lifetime access to your results.
          </p>
          <Link href="/payment?plan=individual" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--blue)', color:'white', fontSize:14, fontWeight:700, padding:'12px 28px', borderRadius:'100px', textDecoration:'none' }}>
            Unlock Assessment — $24 →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)' }}>
      <div style={{ background:'var(--navy)', padding:'0 24px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ fontSize:16, fontWeight:800, color:'white', textDecoration:'none', letterSpacing:'-0.4px' }}>changegenius™</Link>
          <Link href="/dashboard" style={{ fontSize:13, color:'rgba(255,255,255,.6)', textDecoration:'none' }}>← Dashboard</Link>
        </div>
      </div>
      <div className="page">
        <div className="card" style={{ padding:52 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12 }}>
            Change Genius™ Assessment
          </div>
          <h1 style={{ fontSize:36, fontWeight:800, color:'var(--text-1)', letterSpacing:'-1px', marginBottom:14, lineHeight:1.15 }}>
            Discover Your Change Genius™ Role
          </h1>
          <p style={{ fontSize:16, color:'var(--text-2)', lineHeight:1.7, marginBottom:32, maxWidth:560 }}>
            60 behavioural questions. 8–10 minutes. No right or wrong answers — you are always the expert about your own behaviour during change.
          </p>
          <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap', marginBottom:36 }}>
            {[['📋','60 Questions'],['⏱️','8–10 Minutes'],['🔒','Private results'],['📥','Download & share']].map(([icon,label]) => (
              <div key={label as string} style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, fontWeight:600, color:'var(--text-2)', background:'var(--off)', padding:'7px 14px', borderRadius:'100px', border:'1px solid var(--border)' }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
          <Link href="/assessment/take" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--blue)', color:'white', fontSize:15, fontWeight:700, padding:'14px 32px', borderRadius:'100px', textDecoration:'none' }}>
            Begin Assessment →
          </Link>
          <p style={{ fontSize:12, color:'var(--text-4)', marginTop:14 }}>✓ Paid · Lifetime access to your results</p>
        </div>
      </div>
    </div>
  )
}
