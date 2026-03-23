'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell, { inputStyle, labelStyle, errorStyle, btnPrimary } from '@/components/auth/AuthShell'
import { resetPassword } from '@/lib/auth'
import { resetSchema, type ResetInput } from '@/lib/schemas'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    mode: 'onTouched',
  })

  async function onSubmit(values: ResetInput) {
    setServerError('')
    const res = await resetPassword(values.password)
    if (res.error) { setServerError(res.error); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  const focusStyle = { borderColor: 'var(--blue)', boxShadow: '0 0 0 3px rgba(26,107,250,.12)' }

  if (done) {
    return (
      <AuthShell title="Password updated!" subtitle="">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6 }}>Your password has been updated. Redirecting to your dashboard…</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Set new password" subtitle="Choose a strong password for your account.">
      {serverError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>New password</label>
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
          {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Confirm new password</label>
          <input {...register('confirm_password')} type="password" autoComplete="new-password" placeholder="Repeat password"
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--border)', boxShadow: 'none' })}
          />
          {errors.confirm_password && <p style={errorStyle}>{errors.confirm_password.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} style={{ ...btnPrimary, opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </AuthShell>
  )
}
