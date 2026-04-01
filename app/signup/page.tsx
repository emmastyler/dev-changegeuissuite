'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell, { inputStyle, labelStyle, errorStyle, btnPrimary, dividerStyle, googleBtnStyle } from '@/components/auth/AuthShell'
import { signUp, signInWithGoogle } from '@/lib/auth'
import { signUpSchema, type SignUpInput } from '@/lib/schemas'

function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e']
  return { score: s, label: labels[s - 1] ?? 'Weak', color: colors[s - 1] ?? '#ef4444' }
}

export default function SignupPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
  })

  const pwValue = watch('password', '')
  const strength = getStrength(pwValue)

  async function onSubmit(values: SignUpInput) {
    setServerError('')
    const res = await signUp({ full_name: values.full_name, email: values.email, password: values.password })
    if (res.error) { setServerError(res.error); return }
    if (res.confirmSent) { setConfirmed(true); return }
    router.push('/payment?plan=individual&welcome=1')
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const res = await signInWithGoogle()
    if (res.error) { setServerError(res.error); setGoogleLoading(false) }
  }

  const focusStyle = { borderColor: 'var(--blue)', boxShadow: '0 0 0 3px rgba(26,107,250,.12)' }

  if (confirmed) {
    return (
      <AuthShell title="Check your email" subtitle="">
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>
            We sent a confirmation link to your email address.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-4)', lineHeight: 1.6, marginBottom: 24 }}>
            Click the link to activate your account and start your assessment. Check your spam folder if you don&apos;t see it.
          </p>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)', textDecoration: 'none' }}>Back to sign in</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free for individuals. One-time payment. No subscription."
      footer={
        <span>Already have an account? <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link></span>
      }
    >
      {serverError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
          {serverError}
        </div>
      )}

      {/* Google */}
      <button onClick={handleGoogle} disabled={googleLoading} style={googleBtnStyle}>
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.805.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <div style={dividerStyle}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span>or</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Full name */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Full name</label>
          <input {...register('full_name')} type="text" autoComplete="name" placeholder="Your name"
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: errors.full_name ? '#dc2626' : 'var(--border)', boxShadow: 'none' })}
          />
          {errors.full_name && <p style={errorStyle}>{errors.full_name.message}</p>}
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email address</label>
          <input {...register('email')} type="email" autoComplete="email" placeholder="you@company.com"
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: errors.email ? '#dc2626' : 'var(--border)', boxShadow: 'none' })}
          />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input {...register('password')} type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder="Min. 8 characters"
              style={{ ...inputStyle, paddingRight: 40 }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--border)', boxShadow: 'none' })}
            />
            <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)' }}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
          {/* Strength bar */}
          {pwValue && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < strength.score ? strength.color : 'var(--border)', transition: 'background .2s' }} />
                ))}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: strength.color, minWidth: 36 }}>{strength.label}</span>
            </div>
          )}
          {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Confirm password</label>
          <div style={{ position: 'relative' }}>
            <input {...register('confirm_password')} type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat password"
              style={{ ...inputStyle, paddingRight: 40 }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--border)', boxShadow: 'none' })}
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)' }}>
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.confirm_password && <p style={errorStyle}>{errors.confirm_password.message}</p>}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 12, lineHeight: 1.5 }}>
          By creating an account you agree to our{' '}
          <Link href="/privacy" style={{ color: 'var(--blue)' }}>Privacy Policy</Link> and{' '}
          <Link href="/terms" style={{ color: 'var(--blue)' }}>Terms of Service</Link>.
        </p>

        <button type="submit" disabled={isSubmitting} style={{ ...btnPrimary, opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? 'Creating account…' : 'Create Account — Free'}
        </button>
      </form>
    </AuthShell>
  )
}
