'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error } = await getSupabase().auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'white', borderRadius:'var(--radius)', padding:'52px 44px', maxWidth:420, width:'100%', boxShadow:'0 4px 24px rgba(10,37,64,.08)' }}>
        <div style={{ fontSize:16, fontWeight:800, color:'var(--navy)', marginBottom:32 }}>changegenius™</div>
        <h1 style={{ fontSize:26, fontWeight:800, color:'var(--navy)', marginBottom:6 }}>Set new password</h1>
        <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:28 }}>Choose a strong password for your account.</p>
        {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:16 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="New password"
            style={{ padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:14, fontFamily:'Inter,sans-serif', outline:'none' }} />
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required placeholder="Confirm password"
            style={{ padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:8, fontSize:14, fontFamily:'Inter,sans-serif', outline:'none' }} />
          <button type="submit" disabled={loading}
            style={{ padding:'12px', background:'var(--blue)', color:'white', border:'none', borderRadius:'100px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
            {loading ? 'Updating…' : 'Update Password →'}
          </button>
        </form>
      </div>
    </div>
  )
}
