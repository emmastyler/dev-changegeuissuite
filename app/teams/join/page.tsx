'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

function JoinInner() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router  = useRouter()
  const params  = useSearchParams()
  const token   = params.get('token')
  const code    = params.get('code')

  const [status,  setStatus]  = useState<'idle'|'joining'|'done'|'error'>('idle')
  const [message, setMessage] = useState('')
  const [teamId,  setTeamId]  = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      // Save the invite URL so they come back after login
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
      router.push(`/signup?returnUrl=${returnUrl}`)
      return
    }
    if (!token && !code) { setStatus('error'); setMessage('Invalid invite link.'); return }
    void joinTeam()
  }, [authLoading, isAuthenticated])

  async function joinTeam() {
    setStatus('joining')
    try {
      const res = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token ?? undefined, code: code ?? undefined }),
      })
      const data = await res.json() as { teamId?: string; joined?: boolean; alreadyMember?: boolean; error?: string }
      if (!res.ok) { setStatus('error'); setMessage(data.error ?? 'Could not join team.'); return }
      setTeamId(data.teamId ?? null)
      setStatus('done')
      setMessage(data.alreadyMember ? 'You are already a member of this team.' : 'You have joined the team!')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  if (authLoading || status === 'idle' || status === 'joining') return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🤝</div>
        <div style={{ fontSize:16, fontWeight:700, color:'var(--navy)', marginBottom:8 }}>Joining team…</div>
        <div style={{ fontSize:13, color:'var(--text-3)' }}>Just a moment.</div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'white', borderRadius:'var(--radius)', padding:'52px 48px', maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 4px 24px rgba(10,37,64,.08)' }}>
        <div style={{ fontSize:52, marginBottom:20 }}>{status === 'done' ? '🎉' : '❌'}</div>
        <h1 style={{ fontSize:24, fontWeight:800, color:'var(--navy)', marginBottom:10 }}>
          {status === 'done' ? 'Welcome to the team!' : 'Could not join'}
        </h1>
        <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.65, marginBottom:28 }}>{message}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          {status === 'done' && (
            <>
              <Link href="/assessment" style={{ background:'var(--blue)', color:'white', fontSize:14, fontWeight:700, padding:'11px 24px', borderRadius:'100px', textDecoration:'none' }}>
                Take Assessment →
              </Link>
              <Link href="/teams" style={{ background:'white', color:'var(--navy)', fontSize:14, fontWeight:700, padding:'11px 24px', borderRadius:'100px', textDecoration:'none', border:'1.5px solid var(--border)' }}>
                View Team
              </Link>
            </>
          )}
          {status === 'error' && (
            <Link href="/" style={{ background:'var(--blue)', color:'white', fontSize:14, fontWeight:700, padding:'11px 24px', borderRadius:'100px', textDecoration:'none' }}>
              Go Home
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:14, color:'var(--text-3)' }}>Loading…</div>
      </div>
    }>
      <JoinInner />
    </Suspense>
  )
}
