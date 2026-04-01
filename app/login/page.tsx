'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell, { inputStyle, labelStyle, errorStyle, btnPrimary, dividerStyle, googleBtnStyle } from '@/components/auth/AuthShell'
import { signIn, signInWithGoogle } from '@/lib/auth'
import { signInSchema, type SignInInput } from '@/lib/schemas'

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: 'onTouched',
  })

  async function onSubmit(values: SignInInput) {
    setServerError('')
    const res = await signIn(values)
    if (res.error) { setServerError(res.error); return }
    // Check for returnUrl in query params
    const params = new URLSearchParams(window.location.search)
    const returnUrl = params.get('returnUrl')
    const safe = returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/dashboard'
    router.push(safe)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const res = await signInWithGoogle()
    if (res.error) { setServerError(res.error); setGoogleLoading(false) }
    // Redirect happens automatically via Supabase
  }

  const focusStyle = { borderColor: 'var(--blue)', boxShadow: '0 0 0 3px rgba(26,107,250,.12)' }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Change Genius™ account."
      footer={
        <span>Don&apos;t have an account? <Link href="/signup" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link></span>
      }
    >
      {/* Server error */}
      {serverError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
          {serverError}
        </div>
      )}

      {/* Google OAuth */}
      <button onClick={handleGoogle} disabled={googleLoading} style={googleBtnStyle}>
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.805.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div style={dividerStyle}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span>or</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email address</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: errors.email ? '#dc2626' : 'var(--border)', boxShadow: 'none' })}
          />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>Forgot password?</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              style={{ ...inputStyle, paddingRight: 40 }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--border)', boxShadow: 'none' })}
            />
            <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', fontSize: 14 }}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} style={{ ...btnPrimary, opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </AuthShell>
  )
}
