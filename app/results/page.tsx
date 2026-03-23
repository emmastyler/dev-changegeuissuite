'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function ResultsPage() {
  const { profile, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  useEffect(() => { if (!loading && !isAuthenticated) router.push('/login?returnUrl=/results') }, [loading, isAuthenticated, router])
  if (loading) return <div style={{ minHeight:'100vh',background:'var(--sage)',display:'flex',alignItems:'center',justifyContent:'center' }}>Loading…</div>
  if (!isAuthenticated) return null
  if (!profile?.onboarded) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', flexDirection:'column' }}>
        <div style={{ background:'var(--navy)', padding:'0 24px' }}>
          <div style={{ maxWidth:1160, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <Link href="/" style={{ fontSize:16, fontWeight:800, color:'white', textDecoration:'none' }}>changegenius™</Link>
            <Link href="/dashboard" style={{ fontSize:13, color:'rgba(255,255,255,.6)', textDecoration:'none' }}>← Dashboard</Link>
          </div>
        </div>
        <div className="page">
          <div className="card" style={{ padding:52, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📋</div>
            <h2 style={{ fontSize:26, fontWeight:800, color:'var(--text-1)', marginBottom:12 }}>No results yet</h2>
            <p style={{ fontSize:15, color:'var(--text-3)', marginBottom:28 }}>Complete your assessment to see your Change Genius™ role and ADAPTS stage profile.</p>
            <Link href="/assessment" style={{ display:'inline-flex', background:'var(--blue)', color:'white', fontSize:14, fontWeight:700, padding:'12px 28px', borderRadius:'100px', textDecoration:'none' }}>Take the Assessment →</Link>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)' }}>
      <div style={{ background:'var(--navy)', padding:'0 24px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ fontSize:16, fontWeight:800, color:'white', textDecoration:'none' }}>changegenius™</Link>
          <Link href="/dashboard" style={{ fontSize:13, color:'rgba(255,255,255,.6)', textDecoration:'none' }}>← Dashboard</Link>
        </div>
      </div>
      <div className="page">
        <div style={{ background:'var(--navy)', borderRadius:'var(--radius)', padding:'52px' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.36)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12 }}>Your Change Genius™ Role</div>
          <h1 style={{ fontSize:52, fontWeight:900, color:'white', letterSpacing:'-2px', lineHeight:1, marginBottom:8 }}>{profile.change_genius_role || 'Unifier'}</h1>
          <p style={{ fontSize:18, color:'rgba(255,255,255,.6)', fontWeight:300 }}>The Coalition Builder</p>
        </div>
      </div>
    </div>
  )
}
