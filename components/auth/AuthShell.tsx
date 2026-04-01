'use client'
import Link from 'next/link'
import { ReactNode } from 'react'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sage)', display: 'flex', flexDirection: 'column' }}>
      {/* Mini nav */}
      <div style={{ background: 'var(--navy)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: 'white', textDecoration: 'none', letterSpacing: '-0.4px' }}>changegenius™</Link>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Log in</Link>
            <Link href="/signup" style={{ fontSize: 13, fontWeight: 700, color: 'white', background: 'var(--blue)', padding: '7px 18px', borderRadius: '100px', textDecoration: 'none' }}>Get started</Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Card */}
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '40px', boxShadow: '0 4px 24px rgba(10,37,64,.08)' }}>
            {/* Logo */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>Change Genius™</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 6 }}>{title}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.5 }}>{subtitle}</p>
            </div>
            {children}
          </div>
          {footer && (
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>{footer}</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Shared form input style
export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  border: '1.5px solid var(--border)',
  borderRadius: 8,
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  color: 'var(--text-1)',
  background: 'white',
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
}

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-2)',
  marginBottom: 5,
}

export const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#dc2626',
  marginTop: 4,
}

export const btnPrimary: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  background: 'var(--blue)',
  color: 'white',
  border: 'none',
  borderRadius: '100px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  transition: 'background .15s',
  marginTop: 4,
}

export const dividerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  margin: '16px 0',
  fontSize: 12,
  color: 'var(--text-4)',
}

export const googleBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px',
  background: 'white',
  border: '1.5px solid var(--border)',
  borderRadius: '100px',
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--text-1)',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}
