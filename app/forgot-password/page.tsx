'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import AuthShell, { inputStyle, labelStyle, errorStyle, btnPrimary } from '@/components/auth/AuthShell'
import { forgotPassword } from '@/lib/auth'
import { forgotSchema, type ForgotInput } from '@/lib/schemas'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
    mode: 'onSubmit',
  })

  async function onSubmit(values: ForgotInput) {
    setEmail(values.email)
    await forgotPassword(values.email)
    setSent(true) // Always show success — prevents email enumeration
  }

  const focusStyle = { borderColor: 'var(--blue)', boxShadow: '0 0 0 3px rgba(26,107,250,.12)' }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📨</div>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 24 }}>
            The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
          </p>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)', textDecoration: 'none' }}>← Back to sign in</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<Link href="/login" style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>← Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email address</label>
          <input {...register('email')} type="email" autoComplete="email" placeholder="you@company.com"
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: 'var(--border)', boxShadow: 'none' })}
          />
          {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} style={{ ...btnPrimary, opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
    </AuthShell>
  )
}
