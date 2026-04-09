'use client'
import { useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await forgotPassword(email)
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'white', borderRadius:'var(--radius)', padding:'52px 44px', maxWidth:420, width:'100%', boxShadow:'0 4px 24px rgba(10,37,64,.08)' }}>
        <Link href="/" style={{ fontSize:16, fontWeight:800, color:'var(--navy)', textDecoration:'none', display:'block', marginBottom:32 }}>changegenius™</Link>
        {sent ? (
          <>
            <div style={{ fontSize:40, marginBottom:16 }}>📧</div>
            <h1 style={{ fontSize:22, fontWeight:800, color:'var(--navy)', marginBottom:10 }}>Check your email</h1>
            <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.65 }}>If an account exists for <strong>{email}</strong>, we sent a password reset link.</p>
            <Link href="/login" style={{ display:'inline-block', marginTop:24, color:'var(--blue)', fontSize:13, textDecoration:'none' }}>← Back to login</Link>
          </>
        ) : (
          <>
            <h1 style={{ fontSize:26, fontWeight:800, color:'var(--navy)', marginBottom:6 }}>Reset password</h1>
            <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:28 }}>Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="your@email.com"
                style={{ padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:14, fontFamily:'Inter,sans-serif', outline:'none' }} />
              <button type="submit" disabled={loading}
                style={{ padding:'12px', background:'var(--blue)', color:'white', border:'none', borderRadius:'100px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <div style={{ textAlign:'center', marginTop:16 }}>
              <Link href="/login" style={{ fontSize:13, color:'var(--text-3)', textDecoration:'none' }}>← Back to login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
