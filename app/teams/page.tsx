'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
export default function TeamsPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  useEffect(() => { if (!loading && !isAuthenticated) router.push('/login?returnUrl=/teams') }, [loading, isAuthenticated, router])
  if (loading || !isAuthenticated) return null
  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)' }}>
      <div style={{ background:'var(--navy)', padding:'0 24px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ fontSize:16, fontWeight:800, color:'white', textDecoration:'none' }}>changegenius™</Link>
          <Link href="/dashboard" style={{ fontSize:13, color:'rgba(255,255,255,.6)', textDecoration:'none' }}>← Dashboard</Link>
        </div>
      </div>
      <div className="page">
        <div className="card" style={{ padding:52 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--blue)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12 }}>Team Change Map™</div>
          <h1 style={{ fontSize:32, fontWeight:800, color:'var(--text-1)', letterSpacing:'-0.8px', marginBottom:14 }}>My Teams</h1>
          <p style={{ fontSize:15, color:'var(--text-2)', lineHeight:1.7, marginBottom:28 }}>Create a team, share your invite link, and unlock your Team Change Map™ as members join.</p>
          <button style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--blue)', color:'white', fontSize:14, fontWeight:700, padding:'12px 24px', borderRadius:'100px', border:'none', cursor:'pointer' }}>Create a Team →</button>
        </div>
      </div>
    </div>
  )
}
