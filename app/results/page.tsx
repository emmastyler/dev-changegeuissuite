'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { buildNarrative } from '@/lib/assessment/narratives'
import { STAGES, ROLES, type Role, type AdaptsStage, type Energy } from '@/lib/assessment/questions'

interface ResultsData {
  assessmentId:  string
  completedAt:   string
  roleScores:    Record<Role, number>
  stageScores:   Record<AdaptsStage, number>
  energyScores:  Record<Energy, number>
  derived: {
    primary_role:         Role
    secondary_role:       Role
    role_pair_title:      string
    primary_energy:       Energy
    top_adapts_stages:    AdaptsStage[]
    bottom_adapts_stages: AdaptsStage[]
  }
  profile: {
    full_name:          string | null
    change_genius_role: string | null
    role_pair_title:    string | null
  }
}

const ROLE_COLORS: Record<string, string> = {
  Innovator: '#0a2540',
  Achiever:  '#1557d4',
  Organizer: '#1a6bfa',
  Unifier:   '#4d8ef8',
  Builder:   '#93b8fb',
  Refiner:   '#0d3060',
}

const STAGE_COLORS: Record<string, string> = {
  'Alert the System':             '#0a2540',
  'Diagnose the Gaps':            '#0d3060',
  'Access Readiness':             '#1557d4',
  'Participate Through Dialogue': '#1a6bfa',
  'Transform Through Alignment':  '#4d8ef8',
  'Scale and Sustain':            '#93b8fb',
}

// Simple bar chart component
function BarChart({ scores, colors, label }: { scores: Record<string, number>; colors: Record<string, string>; label: string }) {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map(([name, score]) => (
        <div key={name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{name}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{score}</span>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${score}%`,
              background: colors[name] ?? 'var(--blue)',
              borderRadius: 4,
              transition: 'width 1s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Hexagonal radar chart via SVG
function RadarChart({ stageScores }: { stageScores: Record<string, number> }) {
  const n   = STAGES.length
  const cx  = 160
  const cy  = 160
  const r   = 120
  const TWO_PI = Math.PI * 2

  function pt(radius: number, i: number) {
    const angle = -Math.PI / 2 + (TWO_PI * i) / n
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  }

  function ringPath(frac: number) {
    return STAGES.map((_, i) => {
      const p = pt(r * frac, i)
      return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
    }).join(' ') + ' Z'
  }

  // Score polygon — normalize score (0-100) to radius fraction
  const scorePath = STAGES.map((s, i) => {
    const frac = (stageScores[s] ?? 0) / 100
    const p    = pt(r * Math.max(0.05, frac), i)
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ') + ' Z'

  return (
    <svg viewBox="0 0 320 320" style={{ width: '100%', maxWidth: 320, height: 'auto' }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <path key={f} d={ringPath(f)} fill="none" stroke="var(--border)" strokeWidth={f === 1 ? 1.5 : 0.8} opacity={0.5} />
      ))}
      {/* Spokes */}
      {STAGES.map((_, i) => {
        const p = pt(r, i)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth={0.8} opacity={0.4} />
      })}
      {/* Score polygon */}
      <path d={scorePath} fill="rgba(26,107,250,.15)" stroke="var(--blue)" strokeWidth={2} />
      {/* Stage labels */}
      {STAGES.map((stage, i) => {
        const p = pt(r + 22, i)
        const anchor = Math.abs(Math.cos(-Math.PI / 2 + (TWO_PI * i) / n)) < 0.15 ? 'middle'
          : Math.cos(-Math.PI / 2 + (TWO_PI * i) / n) > 0 ? 'start' : 'end'
        const shortLabels: Record<string, string> = {
          'Alert the System':             'Alert',
          'Diagnose the Gaps':            'Diagnose',
          'Access Readiness':             'Readiness',
          'Participate Through Dialogue': 'Dialogue',
          'Transform Through Alignment':  'Alignment',
          'Scale and Sustain':            'Scale',
        }
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor as 'middle' | 'start' | 'end'}
            dominantBaseline="central" fontSize={10} fontWeight={700}
            fontFamily="Inter,sans-serif" fill="var(--text-3)">
            {shortLabels[stage]}
          </text>
        )
      })}
      {/* Score dots */}
      {STAGES.map((s, i) => {
        const frac = (stageScores[s] ?? 0) / 100
        const p    = pt(r * Math.max(0.05, frac), i)
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill={STAGE_COLORS[s] ?? 'var(--blue)'} />
      })}
      {/* Center */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={9} fontFamily="Inter,sans-serif" fill="var(--text-4)" letterSpacing={1}>ADAPTS</text>
    </svg>
  )
}

export default function ResultsPage() {
  const { profile, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [data,    setData]    = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login?returnUrl=/results')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    if (profile && !profile.has_paid) { router.push('/payment?plan=individual'); return }

    fetch('/api/results')
      .then(r => r.json())
      .then((d: ResultsData | { error: string }) => {
        if ('error' in d) { setError(d.error); setLoading(false); return }
        setData(d as ResultsData)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load results'); setLoading(false) })
  }, [authLoading, isAuthenticated, profile, router])

  // ── Loading ──────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>Loading your results…</div>
          <div style={{ width: 200, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', margin: '0 auto' }}>
            <div style={{ height: '100%', background: 'var(--blue)', width: '60%', animation: 'loadbar 1.2s ease infinite', borderRadius: 2 }} />
          </div>
        </div>
        <style>{`@keyframes loadbar{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
      </div>
    )
  }

  // ── Not paid ─────────────────────────────────────────────────
  if (profile && !profile.has_paid) return null

  // ── Not taken ────────────────────────────────────────────────
  if (!data && !loading) {
    const notTaken = error === 'No completed assessment found'
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sage)' }}>
        <Nav />
        <div className="page">
          <div className="card" style={{ padding: 52, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{notTaken ? '📋' : '⚠️'}</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)', marginBottom: 12 }}>
              {notTaken ? 'No results yet' : 'Could not load results'}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 28 }}>
              {notTaken ? 'Complete your assessment to see your Change Genius™ role and ADAPTS stage profile.' : error}
            </p>
            <Link href={notTaken ? '/assessment' : '/assessment'} style={{ display: 'inline-flex', background: 'var(--blue)', color: 'white', fontSize: 14, fontWeight: 700, padding: '12px 28px', borderRadius: '100px', textDecoration: 'none' }}>
              {notTaken ? 'Take the Assessment →' : 'Retry Assessment'}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { derived, roleScores, stageScores, energyScores } = data
  const narrative = buildNarrative(derived)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sage)' }}>
      <Nav />
      <div className="page">

        {/* ── HERO RESULT CARD ── */}
        <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius)', padding: '52px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(26,107,250,.12)' }} />
          <div style={{ position: 'absolute', left: -20, bottom: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(26,107,250,.06)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 16 }}>
              Your Change Genius™ Profile
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'end' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1, marginBottom: 8 }}>
                  {derived.primary_role}
                </h1>
                <div style={{ fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,.6)', marginBottom: 16 }}>
                  Secondary: <span style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{derived.secondary_role}</span>
                </div>
                <div style={{ display: 'inline-block', background: 'var(--blue)', color: 'white', fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: '100px', marginBottom: 20 }}>
                  {derived.role_pair_title}
                </div>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, maxWidth: 500 }}>
                  {narrative.executive_summary}
                </p>
              </div>
              {/* Energy badge */}
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,.07)', borderRadius: 12, padding: '20px 28px', flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Primary Energy</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{derived.primary_energy}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ADAPTS RADAR + STAGE SCORES ── */}
        <div className="card" style={{ padding: 40 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 52, alignItems: 'start' }}>
            {/* Radar */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 16 }}>ADAPTS Stage Map</div>
              <RadarChart stageScores={stageScores} />
            </div>
            {/* Stage bar chart */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 16 }}>Stage Scores</div>
              <BarChart scores={stageScores} colors={STAGE_COLORS} label="stage" />
              {/* Strengths + gaps */}
              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--blue-light)', borderRadius: 10, padding: '14px 16px', borderLeft: '3px solid var(--blue)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Top Strengths</div>
                  {derived.top_adapts_stages.map(s => (
                    <div key={s} style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 3 }}>✓ {s}</div>
                  ))}
                </div>
                <div style={{ background: '#fff7ed', borderRadius: 10, padding: '14px 16px', borderLeft: '3px solid #f97316' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Growth Areas</div>
                  {derived.bottom_adapts_stages.map(s => (
                    <div key={s} style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 3 }}>↑ {s}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROLE SCORES ── */}
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 }}>
            All Role Scores
          </div>
          <BarChart scores={roleScores} colors={ROLE_COLORS} label="role" />
        </div>

        {/* ── NARRATIVE SECTIONS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Role Profile */}
          <div className="card" style={{ padding: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12 }}>
              Role Profile
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              The {derived.primary_role}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75 }}>{narrative.role_profile}</p>
          </div>

          {/* Energy Profile */}
          <div className="card" style={{ padding: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12 }}>
              Energy Profile
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', marginBottom: 12, letterSpacing: '-0.3px' }}>
              {derived.primary_energy} Energy
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75 }}>{narrative.energy_profile}</p>
          </div>

          {/* ADAPTS Strengths */}
          <div className="card" style={{ padding: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12 }}>
              ADAPTS Strengths
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75 }}>{narrative.adapts_strengths}</p>
          </div>

          {/* ADAPTS Growth */}
          <div className="card" style={{ padding: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12 }}>
              Growth Areas
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75 }}>{narrative.adapts_growth}</p>
          </div>
        </div>

        {/* ── YOU IN A TEAM ── */}
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12 }}>
            You in a Team Context
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 720 }}>{narrative.individual_in_team}</p>
        </div>

        {/* ── 30-DAY PLAN ── */}
        <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius)', padding: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12 }}>
            Your Next 30 Days
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 28, letterSpacing: '-0.5px' }}>
            Four actions to apply your strengths
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {narrative.next_30_days.map((action, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.06)', borderRadius: 10, padding: '18px 20px', display: 'flex', gap: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue)', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.72)', lineHeight: 1.65 }}>{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTAs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {/* Share card */}
          <Link href={`/share?aid=${data.assessmentId}`} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '28px 24px', textDecoration: 'none', display: 'block', transition: 'box-shadow .15s' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🪪</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>Share Card</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>Generate your professional Change Genius™ identity card to share on LinkedIn.</div>
          </Link>
          {/* PDF */}
          <Link href={`/api/pdf/individual?aid=${data.assessmentId}`} style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '28px 24px', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>📄</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>Download PDF</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>Download your full individual report as a professional PDF.</div>
          </Link>
          {/* Invite team */}
          <Link href="/teams" style={{ background: 'var(--blue)', borderRadius: 'var(--radius)', padding: '28px 24px', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 6 }}>Build Your Team Map</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }}>Invite your team and unlock collective change intelligence.</div>
          </Link>
        </div>

      </div>
    </div>
  )
}

function Nav() {
  return (
    <div style={{ background: 'var(--navy)', padding: '0 24px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: 16, fontWeight: 800, color: 'white', textDecoration: 'none', letterSpacing: '-0.4px' }}>changegenius™</Link>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/teams" style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', textDecoration: 'none' }}>Teams</Link>
        </div>
      </div>
    </div>
  )
}
