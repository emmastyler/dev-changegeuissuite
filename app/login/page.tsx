'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, signInWithGoogle } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await signIn({ email, password })
    if (res.error) { setError(res.error); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'white', borderRadius:'var(--radius)', padding:'52px 44px', maxWidth:420, width:'100%', boxShadow:'0 4px 24px rgba(10,37,64,.08)' }}>
        <Link href="/" style={{ fontSize:16, fontWeight:800, color:'var(--navy)', textDecoration:'none', display:'block', marginBottom:32 }}>changegenius™</Link>
        <h1 style={{ fontSize:26, fontWeight:800, color:'var(--navy)', marginBottom:6 }}>Welcome back</h1>
        <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:28 }}>Sign in to your account</p>
        {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:16 }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', display:'block', marginBottom:6 }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{ width:'100%', padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:14, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', display:'block', marginBottom:6 }}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{ width:'100%', padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:14, fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ padding:'12px', background:'var(--blue)', color:'white', border:'none', borderRadius:'100px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif', opacity:loading?0.7:1 }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text-3)' }}>
          <Link href="/forgot-password" style={{ color:'var(--blue)', textDecoration:'none' }}>Forgot password?</Link>
          <span style={{ margin:'0 10px' }}>·</span>
          <Link href="/signup" style={{ color:'var(--blue)', textDecoration:'none' }}>Create account</Link>
        </div>
      </div>
    </div>
  )
}
