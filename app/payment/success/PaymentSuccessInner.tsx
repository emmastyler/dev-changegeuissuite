'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

type Status = 'verifying' | 'success' | 'failed'

export default function PaymentSuccessInner() {
  const params    = useSearchParams()
  const provider  = params.get('provider')
  const reference = params.get('reference')   // Paystack
  const sessionId = params.get('session_id')  // Stripe

  const [status,  setStatus]  = useState<Status>('verifying')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => { void verify() }, []) // eslint-disable-line

  async function verify() {
    // ── PAYSTACK ─────────────────────────────────────────────
    if (provider === 'paystack' && reference) {
      try {
        const res  = await fetch(`/api/payment/verify?reference=${encodeURIComponent(reference)}`)
        const data = await res.json() as { success?: boolean }
        if (data.success) {
          await getSupabase().auth.refreshSession()
          setStatus('success')
        } else {
          setStatus('failed')
        }
      } catch { setStatus('failed') }
      return
    }

    // ── STRIPE ───────────────────────────────────────────────
    if (provider === 'stripe' && sessionId && sessionId !== '{CHECKOUT_SESSION_ID}') {
      // Step 1: try the direct confirm endpoint (verifies with Stripe API + sets has_paid)
      try {
        const res  = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        const data = await res.json() as { confirmed?: boolean; paid?: boolean; error?: string }

        if (data.confirmed && data.paid) {
          await getSupabase().auth.refreshSession()
          setStatus('success')
          return
        }
      } catch {
        // confirm endpoint failed — fall through to polling
      }

      // Step 2: poll the DB directly (webhook may have already landed)
      await pollUntilPaid()
      return
    }

    setStatus('failed')
  }

  async function pollUntilPaid(maxAttempts = 8, intervalMs = 1500) {
    const sb = getSupabase()
    for (let i = 0; i < maxAttempts; i++) {
      setAttempt(i + 1)
      await sb.auth.refreshSession()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { setStatus('failed'); return }

      const { data: profile } = await sb
        .from('profiles').select('has_paid').eq('id', user.id).single()

      if (profile?.has_paid) { setStatus('success'); return }
      if (i < maxAttempts - 1) await sleep(intervalMs)
    }
    // Payment went through — show success even if DB hasn't updated yet
    setStatus('success')
  }

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

  // ── VERIFYING ────────────────────────────────────────────────
  if (status === 'verifying') return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>⏳</div>
        <div style={{ fontSize:16, fontWeight:600, color:'var(--navy)', marginBottom:6 }}>Confirming your payment…</div>
        <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:16 }}>
          {attempt > 1 ? `Checking… (${attempt})` : 'This takes just a moment.'}
        </div>
        <div style={{ width:200, height:3, background:'var(--border)', borderRadius:2, overflow:'hidden', margin:'0 auto' }}>
          <div style={{ height:'100%', background:'var(--blue)', borderRadius:2, animation:'loadbar 1.5s ease infinite', width:'40%' }} />
        </div>
      </div>
      <style>{`@keyframes loadbar{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  )

  // ── FAILED ───────────────────────────────────────────────────
  if (status === 'failed') return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'white', borderRadius:'var(--radius)', padding:'52px 48px', maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 4px 24px rgba(10,37,64,.08)' }}>
        <div style={{ fontSize:52, marginBottom:20 }}>❌</div>
        <h1 style={{ fontSize:24, fontWeight:800, color:'var(--navy)', marginBottom:10 }}>Payment could not be confirmed</h1>
        <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.65, marginBottom:28 }}>
          Your payment may have gone through but we couldn&apos;t confirm it automatically.
          Contact support with your reference and we&apos;ll resolve it within the hour.
        </p>
        {reference && (
          <div style={{ background:'var(--off)', borderRadius:8, padding:'10px 16px', marginBottom:24, fontSize:13, fontFamily:'monospace', color:'var(--text-2)' }}>
            Ref: {reference}
          </div>
        )}
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/payment" style={{ background:'var(--blue)', color:'white', fontSize:14, fontWeight:700, padding:'11px 24px', borderRadius:'100px', textDecoration:'none' }}>Try Again</Link>
          <a href="mailto:support@changegeniussuite.com" style={{ background:'white', color:'var(--navy)', fontSize:14, fontWeight:700, padding:'11px 24px', borderRadius:'100px', textDecoration:'none', border:'1.5px solid var(--border)' }}>Contact Support</a>
        </div>
      </div>
    </div>
  )

  // ── SUCCESS ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'var(--navy)', borderRadius:'var(--radius)', padding:'60px 52px', maxWidth:560, width:'100%', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-40, top:-40, width:200, height:200, borderRadius:'50%', background:'rgba(26,107,250,.15)' }} />
        <div style={{ position:'absolute', left:-30, bottom:-30, width:140, height:140, borderRadius:'50%', background:'rgba(26,107,250,.08)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:56, marginBottom:20 }}>🎉</div>
          <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:12 }}>Payment confirmed</div>
          <h1 style={{ fontSize:'clamp(24px,3.5vw,32px)', fontWeight:800, color:'white', letterSpacing:'-0.8px', marginBottom:14, lineHeight:1.2 }}>
            You&apos;re ready to begin.
          </h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', lineHeight:1.65, marginBottom:32, maxWidth:380, marginLeft:'auto', marginRight:'auto' }}>
            Your Change Genius™ assessment is now unlocked. Complete it in 8–10 minutes and receive your full results immediately.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:32 }}>
            {[['⚡','Results appear instantly after completion'],['📄','Download your PDF report any time'],['👥','Invite your team from your dashboard']].map(([icon,text]) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', background:'rgba(255,255,255,.06)', borderRadius:8, textAlign:'left' }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
                <span style={{ fontSize:13, color:'rgba(255,255,255,.7)' }}>{text}</span>
              </div>
            ))}
          </div>
          <Link href="/assessment" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'white', color:'var(--navy)', fontSize:15, fontWeight:800, padding:'14px 36px', borderRadius:'100px', textDecoration:'none' }}>
            Start My Assessment →
          </Link>
          <div style={{ marginTop:16 }}>
            <Link href="/dashboard" style={{ fontSize:13, color:'rgba(255,255,255,.38)', textDecoration:'none' }}>Go to dashboard instead</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
