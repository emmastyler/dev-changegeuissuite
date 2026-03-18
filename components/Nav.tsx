'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'

const navLinks = [
  { href: '/assessment', label: 'Assessment' },
  { href: '/results', label: 'My Profile' },
  { href: '/team', label: 'My Teams' },
  { href: '/team/map', label: 'Team Change Map™' },
  { href: '/pulse', label: 'Weekly Pulse' },
  { href: '/dashboard', label: 'Dashboard' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav
      style={{
        background: 'rgba(15, 22, 35, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <div
              style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Zap size={16} color="white" fill="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
              Change Genius<span style={{ color: '#6366f1' }}>™</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: pathname === link.href ? '#a5b4fc' : '#94a3b8',
                  background: pathname === link.href ? 'rgba(99,102,241,0.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', textDecoration: 'none' }}>
              Sign in
            </Link>
            <Link href="/assessment" className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              Get Started
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
            style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(99,102,241,0.12)', padding: '12px 16px 16px' }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: pathname === link.href ? '#a5b4fc' : '#94a3b8',
                background: pathname === link.href ? 'rgba(99,102,241,0.12)' : 'transparent',
                textDecoration: 'none',
                marginBottom: 4,
              }}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-4">
            <Link href="/login" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
              Sign in
            </Link>
            <Link href="/assessment" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
