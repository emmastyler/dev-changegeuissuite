'use client'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { buildNarrative } from '@/lib/assessment/narratives'
import type { Role, AdaptsStage, Energy } from '@/lib/assessment/questions'

interface ShareData {
  derived: {
    primary_role:         Role
    secondary_role:       Role
    role_pair_title:      string
    primary_energy:       Energy
    top_adapts_stages:    AdaptsStage[]
    bottom_adapts_stages: AdaptsStage[]
  }
  profile: { full_name: string | null }
}

const ROLE_COLORS: Record<string, string> = {
  Innovator: '#0a2540', Achiever: '#1557d4', Organizer: '#1a6bfa',
  Unifier: '#4d8ef8', Builder: '#93b8fb', Refiner: '#0d3060',
}

function ShareCardInner() {
  const { isAuthenticated, profile, loading: authLoading } = useAuth()
  const router    = useRouter()
  const params    = useSearchParams()
  const cardRef   = useRef<HTMLDivElement>(null)

  const [data,     setData]     = useState<ShareData | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [copied,   setCopied]   = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?returnUrl=/share')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    fetch('/api/results')
      .then(r => r.json())
      .then((d: ShareData | { error: string }) => {
        if ('error' in d) { setLoading(false); return }
        setData(d as ShareData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [authLoading, isAuthenticated])

  function copyShareText() {
    if (!data) return
    const { primary_role, secondary_role, role_pair_title, top_adapts_stages } = data.derived
    const text = `I just discovered my Change Genius™ role: ${primary_role} + ${secondary_role} — The ${role_pair_title}.\n\nMy top ADAPTS stage: ${top_adapts_stages[0]}.\n\nDiscover yours at changegeniussuite.com`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function downloadPNG() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      // Use html2canvas via dynamic import
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = 'change-genius-profile.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      alert('Download failed — please try again.')
    }
    setDownloading(false)
  }

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--text-3)' }}>Loading…</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>Complete your assessment first</h2>
          <Link href="/assessment" style={{ color: 'var(--blue)', fontWeight: 600 }}>Take Assessment →</Link>
        </div>
      </div>
    )
  }

  const { primary_role, secondary_role, role_pair_title, primary_energy, top_adapts_stages } = data.derived
  const roleColor = ROLE_COLORS[primary_role] ?? 'var(--navy)'
  const narrative = buildNarrative(data.derived)
  const insightLine = narrative.executive_summary.split('.')[0] + '.'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sage)' }}>
      {/* Nav */}
      <div style={{ background: 'var(--navy)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: 'white', textDecoration: 'none' }}>changegenius™</Link>
          <Link href="/results" style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>← Results</Link>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Share Card</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.8px', marginBottom: 8 }}>Your Change Genius™ Identity Card</h1>
          <p style={{ fontSize: 15, color: 'var(--text-3)' }}>Download as PNG or copy your share text for LinkedIn.</p>
        </div>

        {/* ── THE SHARE CARD (1200×628 — LinkedIn OG size) ── */}
        <div ref={cardRef} style={{
          width: '100%', aspectRatio: '1200/628',
          background: `linear-gradient(135deg, ${roleColor} 0%, var(--navy) 60%)`,
          borderRadius: 16, padding: '48px 56px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(10,37,64,.25)',
        }}>
          {/* BG decoration */}
          <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
          <div style={{ position: 'absolute', right: 40, bottom: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 'clamp(11px,1.2vw,14px)', fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 }}>
                Change Genius™ Profile
              </div>
              <div style={{ fontSize: 'clamp(32px,4.5vw,56px)', fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>
                {primary_role}
              </div>
              <div style={{ fontSize: 'clamp(14px,1.6vw,20px)', fontWeight: 400, color: 'rgba(255,255,255,.6)', marginTop: 6 }}>
                + {secondary_role}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(8px,0.9vw,11px)', fontWeight: 700, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Energy</div>
              <div style={{ fontSize: 'clamp(13px,1.5vw,18px)', fontWeight: 800, color: 'white' }}>{primary_energy}</div>
            </div>
          </div>

          {/* Middle */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.15)', color: 'white', fontSize: 'clamp(11px,1.3vw,15px)', fontWeight: 700, padding: '6px 16px', borderRadius: '100px', marginBottom: 16 }}>
              {role_pair_title}
            </div>
            <p style={{ fontSize: 'clamp(12px,1.4vw,16px)', color: 'rgba(255,255,255,.72)', lineHeight: 1.6, maxWidth: 560 }}>
              {insightLine}
            </p>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 'clamp(8px,0.9vw,11px)', fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                Top ADAPTS Strength
              </div>
              <div style={{ fontSize: 'clamp(11px,1.3vw,14px)', fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>
                {top_adapts_stages[0]}
              </div>
            </div>
            <div style={{ fontSize: 'clamp(11px,1.2vw,14px)', fontWeight: 800, color: 'rgba(255,255,255,.45)', letterSpacing: '-0.3px' }}>
              changegeniussuite.com
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={downloadPNG} disabled={downloading} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--blue)', color: 'white', fontSize: 14, fontWeight: 700, padding: '12px 28px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            {downloading ? 'Generating…' : '⬇ Download PNG'}
          </button>
          <button onClick={copyShareText} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', color: 'var(--navy)', fontSize: 14, fontWeight: 700, padding: '12px 28px', borderRadius: '100px', border: '1.5px solid var(--border)', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
            {copied ? '✓ Copied!' : '📋 Copy Share Text'}
          </button>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://changegeniussuite.com')}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0A66C2', color: 'white', fontSize: 14, fontWeight: 700, padding: '12px 28px', borderRadius: '100px', textDecoration: 'none' }}>
            Share on LinkedIn
          </a>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-4)', marginTop: 16 }}>
          PNG is optimised for LinkedIn (1200×628px)
        </p>
      </div>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: 14, color: 'var(--text-3)' }}>Loading…</div></div>}>
      <ShareCardInner />
    </Suspense>
  )
}
